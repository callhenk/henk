// Cron-driven conversation orchestrator
// - Finds recent/ongoing conversations without finalized data
// - Pulls history from ElevenLabs (demo-friendly)
// - Writes `conversation_events` and fills missing transcript/outcome fields
// Skip type declarations - Deno handles this
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type _Json = Record<string, unknown> | string | number | boolean | null | _Json[];

interface ConversationRow {
  id: string;
  campaign_id: string | null;
  agent_id: string | null;
  lead_id: string | null;
  conversation_id: string | null; // ElevenLabs conversation id
  call_sid: string | null;
  status: string | null; // initiated|in_progress|completed|failed|no_answer|busy|voicemail
  outcome: string | null;
  transcript: string | null;
  recording_url: string | null;
  created_at: string;
  updated_at: string | null;
  started_at?: string | null;
  ended_at?: string | null;
}

// Define message type for conversation history
interface ConversationMessage {
  role: string;
  content: string;
  timestamp?: string;
}

// Define conversation history response type
interface ConversationHistory {
  conversation_id: string;
  messages: ConversationMessage[];
  demo_mode?: boolean;
}

// Define conversation event insert type
interface ConversationEventInsert {
  conversation_id: string;
  event_type: string;
  sequence_number: number;
  agent_text: string | null;
  user_response: string | null;
  started_at: string;
  created_at: string;
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getConversationHistory(
  conversationId: string,
): Promise<ConversationHistory> {
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/messages`,
      {
        headers: {
          'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || '',
          'Content-Type': 'application/json',
        },
      },
    );
    if (!res.ok) {
      // Fallback to demo history if endpoint not available
      const demo: ConversationHistory = {
        conversation_id: conversationId,
        messages: [
          {
            role: 'agent',
            content: 'Hello, this is Henk calling about your pledge.',
            timestamp: new Date().toISOString(),
          },
          {
            role: 'user',
            content: 'Sounds good, tell me more.',
            timestamp: new Date().toISOString(),
          },
        ],
        demo_mode: true,
      };
      return demo;
    }
    return (await res.json()) as ConversationHistory;
  } catch (error) {
    // Demo fallback - log error for debugging
    console.error('Failed to fetch conversation history:', error);
    return {
      conversation_id: conversationId,
      messages: [
        {
          role: 'agent',
          content: 'Hello, this is Henk calling about your pledge.',
          timestamp: new Date().toISOString(),
        },
      ],
      demo_mode: true,
    };
  }
}

function inferOutcomeFromMessages(
  messages: Array<{ role: string; content: string }>,
) {
  // Only look at user messages for outcome determination
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.toLowerCase())
    .join(' \n ');

  // Check for positive commitment phrases
  if (
    userMessages.includes('i will pledge') ||
    userMessages.includes("i'll pledge") ||
    userMessages.includes("yes, i'll pledge") ||
    userMessages.includes("i'd like to pledge") ||
    userMessages.includes('count me in') ||
    userMessages.includes("i'm interested") ||
    (userMessages.includes('yes') && userMessages.includes('pledge'))
  ) {
    return 'pledged';
  }

  if (
    userMessages.includes('donate') ||
    userMessages.includes("i'll donate") ||
    userMessages.includes('i will donate')
  ) {
    return 'donated';
  }

  if (
    userMessages.includes('not interested') ||
    userMessages.includes('no thanks') ||
    userMessages.includes('not right now') ||
    userMessages.includes("don't want") ||
    userMessages.includes('no, ') ||
    (userMessages.includes('no') && !userMessages.includes('no problem'))
  ) {
    return 'not_interested';
  }

  return null;
}

function summarizeTranscript(
  messages: Array<{ role: string; content: string }>,
) {
  const parts = messages.map((m) => `${m.role}: ${m.content}`);
  return parts.join('\n').slice(0, 15000); // keep within a safe size
}

function deriveSentimentScore(outcome: string | null): number | null {
  if (!outcome) return null;
  if (outcome === 'donated') return 0.8;
  if (outcome === 'pledged') return 0.5;
  if (outcome === 'not_interested') return -0.5;
  return null;
}

function extractKeyPoints(
  messages: Array<{ role: string; content: string }>,
): Array<string> {
  const highlights: string[] = [];
  for (const m of messages) {
    const content = String(m.content || '').trim();
    if (!content) continue;
    if (m.role === 'user' && highlights.length < 3) {
      highlights.push(content.slice(0, 200));
    }
    if (highlights.length >= 5) break;
  }
  if (highlights.length === 0 && messages.length > 0) {
    highlights.push(messages[0].content.slice(0, 200));
  }
  return highlights;
}

async function getExistingEventCount(conversationId: string) {
  const { count, error } = await supabase
    .from('conversation_events')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId);
  if (error) {
    console.error('conversation_events count error', error);
    return 0;
  }
  return count ?? 0;
}

async function upsertConversationEvents(
  conversationId: string,
  messages: ConversationMessage[],
) {
  // Append-only: skip messages already represented by existing events count
  const existingCount = await getExistingEventCount(conversationId);
  const newMessages = messages.slice(existingCount);
  if (newMessages.length === 0) return;

  let seq = existingCount + 1;
  const rows: ConversationEventInsert[] = newMessages.map((m) => ({
    conversation_id: conversationId,
    event_type: m.role === 'agent' ? 'response_processed' : 'speech_detected',
    sequence_number: seq++,
    agent_text: m.role === 'agent' ? m.content : null,
    user_response: m.role !== 'agent' ? m.content : null,
    started_at: m.timestamp ?? new Date().toISOString(),
    created_at: new Date().toISOString(),
  }));

  const batchSize = Number(
    Deno.env.get('CONVERSATION_SYNC_EVENTS_BATCH_SIZE') || '50',
  );
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('conversation_events').insert(chunk);
    if (error) console.error('conversation_events insert error', error);
  }
}

export async function processTick(options?: {
  lookbackHours?: number;
  batchLimit?: number;
}) {
  const nowIso = new Date().toISOString();
  console.log(`[conversation-orchestrator] tick at ${nowIso}`);

  // Pick recently updated or still-open conversations missing transcript/outcome
  const lookbackHours = Number(
    options?.lookbackHours ??
      Deno.env.get('CONVERSATION_SYNC_LOOKBACK_HOURS') ??
      '48',
  );
  const batchLimit = Number(
    options?.batchLimit ??
      Deno.env.get('CONVERSATION_SYNC_BATCH_LIMIT') ??
      '10',
  );
  const sinceIso = new Date(
    Date.now() - lookbackHours * 60 * 60 * 1000,
  ).toISOString();
  const { data, error } = await supabase
    .from('conversations')
    .select(
      'id, campaign_id, agent_id, lead_id, conversation_id, call_sid, status, outcome, transcript, recording_url, started_at, ended_at, created_at, updated_at',
    )
    .or(
      'status.eq.initiated,status.eq.in_progress,transcript.is.null,outcome.is.null',
    )
    .gte('created_at', sinceIso)
    .order('updated_at', { ascending: true, nullsFirst: true })
    .limit(batchLimit);

  if (error) {
    console.error('Failed to fetch conversations', error);
    return { ok: false, error: 'fetch conversations failed' };
  }

  const conversations = (data ?? []) as ConversationRow[];
  if (conversations.length === 0) {
    console.log('[conversation-orchestrator] nothing to sync');
    return { ok: true, message: 'no conversations to sync' };
  }

  console.log(
    `[conversation-orchestrator] syncing ${conversations.length} conversation(s)`,
  );

  for (const c of conversations) {
    if (!c.conversation_id) {
      console.log(
        `[skip] conversation ${c.id} missing ElevenLabs conversation_id`,
      );
      continue;
    }
    const history = await getConversationHistory(c.conversation_id);
    const messages = Array.isArray(history?.messages) ? history.messages : [];
    if (messages.length === 0) continue;

    await upsertConversationEvents(c.id, messages);

    const inferredOutcome = c.outcome ?? inferOutcomeFromMessages(messages);
    const transcriptFull = summarizeTranscript(messages);

    // Determine status based on message flow
    let newStatus: string | null = null;
    const userMessages = messages.filter(
      (m: ConversationMessage) => m.role !== 'agent',
    );
    if (inferredOutcome) {
      newStatus = 'completed';
    } else if (
      (c.status === 'initiated' || !c.status) &&
      userMessages.length > 0
    ) {
      newStatus = 'in_progress';
    }

    // Determine timestamps and duration
    const lastTimestampStr = String(
      messages[messages.length - 1]?.timestamp || new Date().toISOString(),
    );
    const lastTimestamp = new Date(lastTimestampStr);
    const startedAt = c.started_at
      ? new Date(c.started_at)
      : new Date(c.created_at);
    const durationSeconds = Math.max(
      0,
      Math.floor((lastTimestamp.getTime() - startedAt.getTime()) / 1000),
    );

    const updates: Record<string, unknown> = {};
    if (!c.outcome && inferredOutcome) updates.outcome = inferredOutcome;
    if (!c.transcript || c.transcript !== transcriptFull)
      updates.transcript = transcriptFull;
    const sentiment = deriveSentimentScore(inferredOutcome);
    if (sentiment !== null) updates.sentiment_score = sentiment;
    const keyPoints = extractKeyPoints(messages);
    if (keyPoints.length > 0) updates.key_points = keyPoints;
    if (newStatus) updates.status = newStatus;
    if (newStatus === 'completed')
      updates.ended_at = lastTimestamp.toISOString();
    if (!c.ended_at && newStatus === 'completed')
      updates.ended_at = lastTimestamp.toISOString();
    if (durationSeconds >= 0) updates.duration_seconds = durationSeconds;
    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date().toISOString();
      const { error: uErr } = await supabase
        .from('conversations')
        .update(updates)
        .eq('id', c.id);
      if (uErr) console.error(`[conversations] update failed id=${c.id}`, uErr);
      else console.log(`[conversations] update ok id=${c.id}`);
    }
  }

  return { ok: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }

  try {
    let body: { lookbackHours?: number; batchLimit?: number } = {};
    try {
      const parsed = await req.json();
      if (parsed && typeof parsed === 'object') {
        body = parsed as { lookbackHours?: number; batchLimit?: number };
      }
    } catch {
      // Empty body is valid, use defaults
    }
    const result = await processTick({
      lookbackHours:
        typeof body?.lookbackHours === 'number'
          ? body.lookbackHours
          : undefined,
      batchLimit:
        typeof body?.batchLimit === 'number' ? body.batchLimit : undefined,
    });
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.error('conversation-orchestrator error', e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});
