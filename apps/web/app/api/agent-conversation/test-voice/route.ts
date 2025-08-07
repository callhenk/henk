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

    // Parse request body
    const { agent_id } = await request.json();

    if (!agent_id) {
      return NextResponse.json(
        { success: false, error: 'agent_id is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Get ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Start a test conversation with the agent
    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversations',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id,
          conversation_type: 'voice',
          test_mode: true,
          initial_message:
            'Hello, this is a test of your voice. How do you sound?',
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ElevenLabs API error: ${errorData.detail || response.statusText}`,
      );
    }

    const testConversation = await response.json();

    return NextResponse.json(
      {
        success: true,
        data: testConversation,
        message: 'Voice test started successfully',
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error testing agent voice:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to test agent voice',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
