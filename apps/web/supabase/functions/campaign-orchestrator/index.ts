// Cron-driven campaign orchestrator using ElevenLabs Twilio outbound
// - Picks eligible campaigns/leads
// - Respects call windows, caps, retries
// - Places outbound calls via ElevenLabs
// Skip type declarations - Deno handles this
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import type { Database } from '../../../database.types.ts';

// Extract types from Database schema
type CampaignRow = Database['public']['Tables']['campaigns']['Row'];
type LeadRow = Database['public']['Tables']['leads']['Row'];
type ConversationInsert =
  Database['public']['Tables']['conversations']['Insert'];
type CallLogInsert = Database['public']['Tables']['call_logs']['Insert'];

// Enriched lead row includes both lead data and campaign_lead relationship data
interface EnrichedLeadRow extends LeadRow {
  campaign_lead_id: string;
  campaign_id: string;
  attempts: number;
  campaign_status: string;
  last_attempt_at: string | null;
  name: string; // Computed from first_name + last_name
}

// Type for the campaign_leads joined query result
interface CampaignLeadQueryResult {
  id: string;
  campaign_id: string;
  lead_id: string;
  status: string;
  attempts: number | null;
  last_attempt_at: string | null;
  pledged_amount: number | null;
  donated_amount: number | null;
  leads: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    timezone: string | null;
    do_not_call: boolean | null;
    company: string | null;
    quality_rating: number | null;
    lead_score: number | null;
    last_activity_at: string | null;
  };
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function processTick() {
  const nowIso = new Date().toISOString();
  console.log(`[orchestrator] tick at ${nowIso}`);

  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    // Include campaigns that have no start_date set or have already started
    .or(`start_date.is.null,start_date.lte.${nowIso}`)
    // And also include campaigns with no end_date or not yet ended
    .or(`end_date.is.null,end_date.gte.${nowIso}`)
    .limit(10);

  if (campaignsError) {
    console.error('Failed to fetch campaigns:', campaignsError);
    return { ok: false, error: 'failed to fetch campaigns' };
  }

  if (!campaigns || campaigns.length === 0) {
    console.log('[orchestrator] No active campaigns matched filters');
    return { ok: true, message: 'no active campaigns' };
  }

  console.log(`[orchestrator] fetched ${campaigns.length} active campaign(s)`);

  for (const c of campaigns as CampaignRow[]) {
    console.log(
      `[campaign] id=${c.id} name=${c.name} agent_id=${c.agent_id} start=${c.start_date} end=${c.end_date}`,
    );
    const remaining = await remainingDailyQuota(c.id, c.daily_call_cap ?? 0);
    if (remaining <= 0) {
      console.log(`[skip] campaign ${c.id} has no remaining daily quota`);
      continue;
    }

    if (!c.agent_id) {
      console.log(`[skip] campaign ${c.id} missing agent_id`);
      continue;
    }

    const { data: agent } = await supabase
      .from('agents')
      .select('id, elevenlabs_agent_id, caller_id')
      .eq('id', c.agent_id)
      .maybeSingle();
    console.log(
      `[agent] id=${c.agent_id} elevenlabs_agent_id=${
        agent?.elevenlabs_agent_id ?? 'null'
      } caller_id=${agent?.caller_id ?? 'null'}`,
    );
    if (!agent?.elevenlabs_agent_id) {
      console.log(`[skip] agent ${c.agent_id} has no elevenlabs_agent_id`);
      continue;
    }

    const callerId = agent?.caller_id ?? null;
    if (!callerId) {
      console.log(`[skip] no caller_id found on agent for campaign ${c.id}`);
      continue;
    }

    console.log(`[leads] selecting up to ${remaining} eligible lead(s)`);
    const leads = await pickEligibleLeads(c, remaining);
    console.log(`[leads] campaign ${c.id} returned ${leads.length} lead(s)`);
    for (const lead of leads) {
      const windowOk = inLocalCallWindow(lead, c);
      console.log(
        `[lead] id=${lead.id} phone=${lead.phone} tz=${
          lead.timezone ?? 'UTC'
        } window=${c.call_window_start ?? '*'}-${
          c.call_window_end ?? '*'
        } ok=${windowOk}`,
      );
      if (!windowOk) continue;

      const attemptNo = await getAttemptNo(c.id, lead.id);
      console.log(
        `[attempt] lead=${
          lead.id
        } previous_attempts=${attemptNo} next_attempt=${attemptNo + 1}`,
      );

      console.log(`[dial] placing call to ${lead.phone}`);
      const dynamicVars: Record<string, unknown> = {
        donor_name: lead.first_name || '',
        campaign_name: c.name,
        disclosure_line: c.disclosure_line ? '' : null,
        goal_metric: c.goal_metric ?? null,
        campaign_id: c.id,
        agent_id: c.agent_id,
        lead_id: lead.id,
        attempt_no: attemptNo + 1,
        caller_id: callerId,
        name: lead.name || '',
        company: lead.company || '',
      };

      console.log(dynamicVars);

      const { conversation_id, callSid } = await placeOutboundCall({
        agent_id: agent.elevenlabs_agent_id!,
        agent_phone_number_id: callerId,
        to_number: lead.phone || '', // Handle null phone numbers
        conversation_initiation_client_data: {
          dynamic_variables: dynamicVars,
        },
      });
      console.log(
        `[dial] success conversation_id=${conversation_id} callSid=${callSid}`,
      );

      try {
        const conversationInsert: ConversationInsert = {
          campaign_id: c.id,
          agent_id: c.agent_id!,
          lead_id: lead.id,
          status: 'initiated',
          call_sid: callSid,
          conversation_id,
          started_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        };
        const { data: convoData, error: convoError } = await supabase
          .from('conversations')
          .insert(conversationInsert);

        if (convoError) {
          console.error(
            `[convo] insert failed campaign=${c.id} lead=${lead.id}`,
            convoError,
          );
          // Fallback: write to call_logs if conversations insert fails
          const callLogInsert: CallLogInsert = {
            campaign_id: c.id,
            agent_id: c.agent_id!,
            lead_id: lead.id,
            conversation_id,
            call_sid: callSid,
            from_number: callerId,
            to_number: lead.phone,
            status: 'initiated',
            direction: 'outbound',
            queued_at: new Date().toISOString(),
            initiated_at: new Date().toISOString(),
          };
          const { data: logData, error: logError } = await supabase
            .from('call_logs')
            .insert(callLogInsert);
          if (logError) {
            console.error(
              `[call_logs] insert failed campaign=${c.id} lead=${lead.id}`,
              logError,
            );
          } else {
            const logId = Array.isArray(logData)
              ? ((logData[0] as Record<string, unknown>)?.id ?? 'unknown')
              : ((logData as Record<string, unknown>)?.id ?? 'unknown');
            console.log(
              `[call_logs] insert ok campaign=${c.id} lead=${lead.id} call_log_id=${logId}`,
            );
          }
        } else {
          const convoId = Array.isArray(convoData)
            ? ((convoData[0] as Record<string, unknown>)?.id ?? 'unknown')
            : ((convoData as Record<string, unknown>)?.id ?? 'unknown');
          console.log(
            `[convo] insert ok campaign=${c.id} lead=${lead.id} conversation_id=${convoId}`,
          );
        }
      } catch (e) {
        console.error(
          `[convo] insert exception campaign=${c.id} lead=${lead.id}`,
          e,
        );
        // Fallback on exception as well
        try {
          const callLogInsertFallback: CallLogInsert = {
            campaign_id: c.id,
            agent_id: c.agent_id!,
            lead_id: lead.id,
            conversation_id,
            call_sid: callSid,
            from_number: callerId,
            to_number: lead.phone,
            status: 'initiated',
            direction: 'outbound',
            queued_at: new Date().toISOString(),
            initiated_at: new Date().toISOString(),
          };
          const { data: logData, error: logError } = await supabase
            .from('call_logs')
            .insert(callLogInsertFallback);
          if (logError) {
            console.error(
              `[call_logs] insert failed campaign=${c.id} lead=${lead.id}`,
              logError,
            );
          } else {
            const logId = Array.isArray(logData)
              ? ((logData[0] as Record<string, unknown>)?.id ?? 'unknown')
              : ((logData as Record<string, unknown>)?.id ?? 'unknown');
            console.log(
              `[call_logs] insert ok campaign=${c.id} lead=${lead.id} call_log_id=${logId}`,
            );
          }
        } catch (e2) {
          console.error(
            `[call_logs] insert exception campaign=${c.id} lead=${lead.id}`,
            e2,
          );
        }
      }

      try {
        // Update campaign_leads record
        const { error: clError } = await supabase
          .from('campaign_leads')
          .update({
            attempts: (lead.attempts ?? 0) + 1,
            last_attempt_at: new Date().toISOString(),
            status: 'contacted',
          })
          .eq('campaign_id', c.id)
          .eq('lead_id', lead.id);

        if (clError) {
          console.error(
            `[campaign_lead] update failed campaign=${c.id} lead=${lead.id}`,
            clError,
          );
        } else {
          console.log(
            `[campaign_lead] update ok campaign=${c.id} lead=${lead.id} attempts=${
              (lead.attempts ?? 0) + 1
            } status=contacted`,
          );
        }

        // Update lead's general activity timestamp
        const { error: leadError } = await supabase
          .from('leads')
          .update({
            last_activity_at: new Date().toISOString(),
          })
          .eq('id', lead.id);

        if (leadError) {
          console.warn(
            `[lead] activity update failed id=${lead.id}`,
            leadError,
          );
        }
      } catch (e) {
        console.error(
          `[lead] update exception campaign=${c.id} lead=${lead.id}`,
          e,
        );
      }
    }
  }

  return { ok: true };
}

async function remainingDailyQuota(campaignId: string, cap: number) {
  if (!cap || cap <= 0) return 0;
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .gte('created_at', startOfDay.toISOString());
  const remaining = Math.max(0, cap - (count ?? 0));
  console.log(
    `[quota] campaign=${campaignId} cap=${cap} callsToday=${
      count ?? 0
    } remaining=${remaining}`,
  );
  return remaining;
}

async function pickEligibleLeads(
  c: CampaignRow,
  limit: number,
): Promise<EnrichedLeadRow[]> {
  const maxAttempts = c.max_attempts ?? 3;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Build the query joining campaign_leads with leads
  let q = supabase
    .from('campaign_leads')
    .select(
      `
      id,
      campaign_id,
      lead_id,
      status,
      attempts,
      last_attempt_at,
      pledged_amount,
      donated_amount,
      leads!inner(
        id,
        first_name,
        last_name,
        phone,
        timezone,
        do_not_call,
        company,
        quality_rating,
        lead_score,
        last_activity_at
      )
    `,
    )
    .eq('campaign_id', c.id)
    .neq('status', 'pledged')
    .lt('attempts', maxAttempts)
    .or(`last_attempt_at.is.null,last_attempt_at.lte.${oneDayAgo}`);

  const { data, error } = await q
    .order('quality_rating', {
      ascending: false,
      nullsFirst: false,
      foreignTable: 'leads',
    })
    .order('lead_score', {
      ascending: false,
      nullsFirst: true,
      foreignTable: 'leads',
    })
    .order('last_attempt_at', { ascending: true, nullsFirst: true })
    .limit(limit * 2); // Fetch extra in case we need to filter out DNC

  if (error) {
    console.error(`[leads] pickEligibleLeads error campaign=${c.id}`, error);
    return [];
  }

  // Transform the nested structure into EnrichedLeadRow
  let rows: EnrichedLeadRow[] = (data ?? []).map(
    (cl: CampaignLeadQueryResult) => {
      const lead = cl.leads;
      // Compute full name from first_name and last_name
      const name =
        [lead.first_name, lead.last_name].filter(Boolean).join(' ').trim() ||
        'Unknown';

      return {
        ...lead,
        name, // Add computed name field
        campaign_lead_id: cl.id,
        campaign_id: cl.campaign_id,
        attempts: cl.attempts ?? 0,
        campaign_status: cl.status,
        last_attempt_at: cl.last_attempt_at,
      };
    },
  );

  // Apply DNC filter in JavaScript (easier than complex OR logic in PostgREST)
  if (c.exclude_dnc) {
    rows = rows.filter((lead) => !lead.do_not_call);
  }

  // Limit to requested amount after filtering
  rows = rows.slice(0, limit);

  console.log(
    `[leads] pickEligibleLeads campaign=${c.id} limit=${limit} returned=${rows.length}`,
  );
  return rows;
}

function inLocalCallWindow(lead: LeadRow, c: CampaignRow) {
  console.log(
    `[inLocalCallWindow] lead=${lead.id} timezone=${lead.timezone} call_window_start=${
      c.call_window_start
    } call_window_end=${c.call_window_end}`,
  );
  if (!c.call_window_start || !c.call_window_end) return true;

  // Default to UTC if no timezone is set
  const timezone = lead.timezone || 'UTC';

  console.log(
    `[inLocalCallWindow] lead=${lead.id} timezone=${timezone} call_window_start=${c.call_window_start} call_window_end=${c.call_window_end}`,
  );

  // Compute local time window check
  try {
    const now = new Date();
    const localNow = new Date(
      now.toLocaleString('en-US', { timeZone: timezone }),
    );
    const [sH, sM = '0'] = c.call_window_start.split(':');
    const [eH, eM = '0'] = c.call_window_end.split(':');
    const start = new Date(localNow);
    start.setHours(Number(sH), Number(sM), 0, 0);
    const end = new Date(localNow);
    end.setHours(Number(eH), Number(eM), 0, 0);

    console.log(
      `[inLocalCallWindow] localNow=${localNow} start=${start} end=${end}`,
    );
    return localNow >= start && localNow <= end;
  } catch {
    return true;
  }
}

async function getAttemptNo(campaignId: string, leadId: string) {
  const { count } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('lead_id', leadId);
  return count ?? 0;
}

async function placeOutboundCall(p: {
  agent_id: string;
  agent_phone_number_id: string;
  to_number: string;
  conversation_initiation_client_data: {
    dynamic_variables?: Record<string, unknown>;
  };
}) {
  console.log(
    `[placeOutboundCall] start agent=${p.agent_id} from=${p.agent_phone_number_id} to=${p.to_number}`,
  );
  try {
    const res = await fetch(
      'https://api.elevenlabs.io/v1/convai/twilio/outbound-call',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY') || '',
        },
        body: JSON.stringify(p),
      },
    );
    if (!res.ok) {
      const bodyText = await res.text();
      console.error(
        `[placeOutboundCall] failed status=${res.status} body=${bodyText}`,
      );
      throw new Error(`dial failed: ${res.status} ${bodyText}`);
    }
    const json = await res.json();
    console.log(
      `[placeOutboundCall] success conversation_id=${json.conversation_id} callSid=${json.callSid}`,
    );
    return {
      conversation_id: json.conversation_id as string,
      callSid: json.callSid as string,
    };
  } catch (error) {
    console.error(
      `[placeOutboundCall] exception agent=${p.agent_id} to=${p.to_number}:`,
      error,
    );
    throw error;
  }
}

// HTTP entrypoint for scheduled invocation
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
    const result = await processTick();
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.error('orchestrator error', e);
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
