import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function POST(request: NextRequest) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = getSupabaseServerClient();

    // Get authenticated user
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

    const body = await request.json();
    const { agentConfig } = body ?? {};

    // Get user's business context
    const { data: userBusiness, error: businessError } = await supabase
      .from('team_members')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not associated with any business',
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Call ElevenLabs directly per docs: https://elevenlabs.io/docs/api-reference/agents/create?explorer=true
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ELEVENLABS_API_KEY not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Build minimal valid payload per ElevenLabs docs
    // Required: name
    // Optional: conversation_config/platform_settings/tags
    if (!agentConfig?.name || typeof agentConfig.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    const payload: Record<string, unknown> = {
      name: agentConfig.name,
      conversation_config: agentConfig?.conversation_config ?? {},
    };

    if (agentConfig?.platform_settings != null) {
      payload.platform_settings = agentConfig.platform_settings;
    }
    if (agentConfig?.tags != null) payload.tags = agentConfig.tags;

    const headers: Record<string, string> = {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (process.env.ELEVENLABS_WORKSPACE_ID) {
      headers['xi-workspace-id'] = process.env.ELEVENLABS_WORKSPACE_ID;
    }

    // Log minimal request info (no secrets)
    console.log('[elevenlabs-agent] Creating agent with payload:', {
      name: payload.name,
      hasConversationConfig:
        typeof payload.conversation_config === 'object' &&
        payload.conversation_config !== null,
      hasPlatformSettings: Boolean(payload.platform_settings),
      hasTags: Boolean(payload.tags),
      hasWorkspaceHeader: Boolean(process.env.ELEVENLABS_WORKSPACE_ID),
    });

    const resp = await fetch(
      'https://api.elevenlabs.io/v1/convai/agents/create',
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      },
    );

    const raw = await resp.text();
    let json: unknown = {};
    try {
      json = raw ? JSON.parse(raw) : {};
    } catch {
      // ignore JSON parse error, keep raw for diagnostics
    }
    console.log('[elevenlabs-agent] ElevenLabs response:', {
      status: resp.status,
      ok: resp.ok,
      bodyPreview: raw?.slice(0, 500),
    });
    if (!resp.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            [
              (json as Record<string, unknown>)?.detail,
              (json as Record<string, unknown>)?.error,
              (json as Record<string, unknown>)?.message,
              (json as Record<string, unknown>)?.errors,
            ]
              .filter(Boolean)
              .map((e) => (typeof e === 'string' ? e : JSON.stringify(e)))
              .join(' | ') || 'Failed to create ElevenLabs agent',
          details: json,
          raw,
        },
        { status: resp.status, headers: corsHeaders },
      );
    }

    // Return the agent_id from ElevenLabs, along with minimal context
    return NextResponse.json(
      {
        success: true,
        data: {
          agent_id:
            (json as Record<string, unknown>)?.agent_id ||
            (json as Record<string, unknown>)?.id ||
            (json as { agent?: { agent_id?: string; id?: string } })?.agent
              ?.agent_id ||
            (json as { agent?: { agent_id?: string; id?: string } })?.agent?.id,
        },
        // Keep business context in response if needed by caller
        context: { business_id: userBusiness.business_id, account_id: user.id },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('ElevenLabs agent creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
