import { NextRequest, NextResponse } from 'next/server';

import { z } from 'zod';

import { ElevenLabsClient } from '~/lib/elevenlabs-client';
import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

const bodySchema = z.object({
  // Provide either phone_number_id or caller_id (E.164)
  phone_number_id: z.string().optional(),
  caller_id: z.string().min(5).optional(),
});

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

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

    const payload = bodySchema.parse(await request.json());

    // Load agent to get elevenlabs_agent_id
    const { data: agentRow, error } = await supabase
      .from('agents')
      .select('id, elevenlabs_agent_id')
      .eq('id', id)
      .single();

    if (error || !agentRow?.elevenlabs_agent_id) {
      return NextResponse.json(
        { success: false, error: 'Agent does not have elevenlabs_agent_id' },
        { status: 400, headers: corsHeaders },
      );
    }

    const el = new ElevenLabsClient(apiKey);
    let phoneNumberId = payload.phone_number_id;
    if (!phoneNumberId) {
      if (!payload.caller_id) {
        return NextResponse.json(
          { success: false, error: 'Provide phone_number_id or caller_id' },
          { status: 400, headers: corsHeaders },
        );
      }
      const numbers = await el.listPhoneNumbers();
      const match = numbers.find((n) => n.phone_number === payload.caller_id);
      if (!match) {
        return NextResponse.json(
          { success: false, error: 'Caller ID not found in ElevenLabs' },
          { status: 400, headers: corsHeaders },
        );
      }
      phoneNumberId = match.phone_number_id;
    }

    const result = await el.assignAgentPhoneNumber(
      agentRow.elevenlabs_agent_id,
      phoneNumberId,
    );

    return NextResponse.json(
      { success: true, data: result },
      { headers: corsHeaders },
    );
  } catch (err) {
    console.error('POST /api/agents/[id]/assign-phone error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to assign phone number' },
      { status: 500, headers: corsHeaders },
    );
  }
}
