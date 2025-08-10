import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { ElevenLabsClient } from '~/lib/elevenlabs-client';
import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const requestSchema = z.object({
  to_number: z.string().min(5),
  agent_id: z.string().optional(),
  caller_id: z.string().min(5).optional(),
  agent_phone_number_id: z.string().optional(),
  campaign_id: z.string().uuid().optional(),
  lead_name: z.string().optional(),
  disclosure_line: z.string().optional(),
  goal_metric: z.string().optional(),
});

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Auth check
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

    const json = await request.json();
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.flatten(),
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const {
      to_number,
      agent_id,
      caller_id,
      agent_phone_number_id: req_phone_number_id,
      campaign_id,
      lead_name,
      disclosure_line,
      goal_metric,
    } = parsed.data;

    // Get user's active business context
    const { data: userBusiness, error: businessError } = await supabase
      .from('team_members')
      .select('business_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (businessError || !userBusiness) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not associated with any active business',
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Server configuration missing' },
        { status: 500, headers: corsHeaders },
      );
    }

    // If we have ElevenLabs IDs, call ElevenLabs directly
    if (elevenLabsApiKey && agent_id) {
      // Resolve agent_phone_number_id from caller_id via ElevenLabs when possible
      let agent_phone_number_id: string | undefined = req_phone_number_id;
      if (!agent_phone_number_id && caller_id) {
        try {
          const el = new ElevenLabsClient(elevenLabsApiKey);
          const numbers = await el.listPhoneNumbers();
          const digits = (s: string) => s.replace(/\D+/g, '');
          const target = digits(caller_id);
          const equalish = (a: string, b: string) => {
            if (a === b) return true;
            if (
              a.length + 1 === b.length &&
              b.startsWith('1') &&
              b.slice(1) === a
            )
              return true;
            if (
              b.length + 1 === a.length &&
              a.startsWith('1') &&
              a.slice(1) === b
            )
              return true;
            return false;
          };
          const match = numbers.find((n) =>
            equalish(digits(n.phone_number), target),
          );
          agent_phone_number_id = match?.phone_number_id;
        } catch (e) {
          console.warn('Failed to resolve phone_number_id from ElevenLabs:', e);
        }
      }

      let resolvedElevenlabsAgentId: string | undefined = agent_id;
      if (!resolvedElevenlabsAgentId) {
        // Try to resolve ElevenLabs agent id from internal agent_id
        const { data: agentRow } = await supabase
          .from('agents')
          .select('elevenlabs_agent_id')
          .eq('id', agent_id)
          .single();
        if (agentRow?.elevenlabs_agent_id) {
          resolvedElevenlabsAgentId = agentRow.elevenlabs_agent_id as string;
        }
      }

      const effectiveElevenlabsAgentId = resolvedElevenlabsAgentId;

      if (!(effectiveElevenlabsAgentId && agent_phone_number_id)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Missing elevenlabs_agent_id or agent_phone_number_id',
          },
          { status: 400, headers: corsHeaders },
        );
      }

      const el = new ElevenLabsClient(elevenLabsApiKey);
      const result = await el.twilioOutboundCall({
        agent_id: effectiveElevenlabsAgentId!,
        agent_phone_number_id: agent_phone_number_id!,
        to_number,
        conversation_initiation_client_data: {
          source: 'simulate-call',
          campaign_id: campaign_id || null,
        },
      });

      return NextResponse.json(
        { success: true, data: result, message: 'Simulation call initiated' },
        { headers: corsHeaders },
      );
    }

    // Fallback: existing edge function path
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/simulate-call`;
    const edgePayload = {
      business_id: userBusiness.business_id,
      agent_id,
      caller_id,
      to_number,
      campaign_id,
      lead_name: lead_name || user.user_metadata?.full_name || 'Test Call',
      disclosure_line,
      goal_metric: goal_metric || 'pledge_rate',
    };
    const edgeResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify(edgePayload),
    });
    const edgeJson = await edgeResponse.json().catch(() => ({}));
    if (!edgeResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: edgeJson?.error || 'Failed to trigger simulate call',
          details: edgeJson,
        },
        { status: edgeResponse.status, headers: corsHeaders },
      );
    }
    return NextResponse.json(
      { success: true, data: edgeJson, message: 'Simulation call initiated' },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('POST /api/campaigns/simulate-call error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: corsHeaders },
    );
  }
}
