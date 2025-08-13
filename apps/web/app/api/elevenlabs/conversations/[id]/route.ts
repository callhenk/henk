import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RouteParams {
  params: Promise<{ id: string }>; // conversation_id
}

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const { id } = await params; // This may be either external conversation_id or local row id

    const supabase = getSupabaseServerClient();

    // Require authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: corsHeaders },
      );
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // If a local conversations row exists whose conversation_id matches the incoming id or whose id matches
    // we can resolve the external id first to be precise
    let externalId = id;
    try {
      const result = await supabase
        .from('conversations')
        .select('conversation_id, id')
        .or(`conversation_id.eq.${id},id.eq.${id}`)
        .maybeSingle();
      const row = (
        result as unknown as {
          data?: { conversation_id?: string; id?: string };
        }
      ).data;
      if (row?.conversation_id) {
        externalId = row.conversation_id;
      }
    } catch {
      // ignore and use provided id
    }

    // Fetch conversation details from ElevenLabs per docs
    // https://elevenlabs.io/docs/conversational-ai/api-reference/conversations/get?explorer=true
    const url = `https://api.elevenlabs.io/v1/convai/conversations/${encodeURIComponent(
      externalId,
    )}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({}) as Record<string, unknown>);

      // Fallback: try to load from our local DB if ElevenLabs denies access or not found
      const shouldFallback =
        response.status === 404 ||
        (typeof errorData === 'object' &&
          errorData !== null &&
          'status' in errorData &&
          (errorData as { status?: string }).status ===
            'conversation_history_not_found');

      if (shouldFallback) {
        const { data: localConv } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', id)
          .single();

        if (localConv) {
          const startedAt = localConv.started_at
            ? Date.parse(localConv.started_at)
            : undefined;
          const endedAt = localConv.ended_at
            ? Date.parse(localConv.ended_at)
            : undefined;
          const durationSeconds =
            typeof localConv.duration_seconds === 'number'
              ? localConv.duration_seconds
              : startedAt && endedAt
                ? Math.max(0, Math.floor((endedAt - startedAt) / 1000))
                : 0;

          const fallbackPayload = {
            agent_id: localConv.agent_id ?? null,
            conversation_id: id,
            status: localConv.status ?? 'unknown',
            transcript: localConv.transcript
              ? [
                  {
                    role: 'assistant',
                    time_in_call_secs: durationSeconds,
                    message: localConv.transcript as unknown as string,
                  },
                ]
              : [],
            metadata: {
              start_time_unix_secs: startedAt
                ? Math.floor(startedAt / 1000)
                : null,
              call_duration_secs: durationSeconds,
            },
            has_audio: Boolean(localConv.recording_url),
            has_user_audio: Boolean(localConv.recording_url),
            has_response_audio: Boolean(localConv.recording_url),
          };

          return NextResponse.json(
            { success: true, data: fallbackPayload },
            { headers: corsHeaders },
          );
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            status:
              (errorData as { status?: string }).status || 'unknown_error',
            message:
              (errorData &&
                ((errorData as { detail?: string; error?: string }).detail ||
                  (errorData as { error?: string }).error)) ||
              response.statusText,
          },
        },
        { status: response.status, headers: corsHeaders },
      );
    }

    const data = await response.json();

    return NextResponse.json({ success: true, data }, { headers: corsHeaders });
  } catch (error) {
    console.error('GET /api/elevenlabs/conversations/[id] error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders },
    );
  }
}
