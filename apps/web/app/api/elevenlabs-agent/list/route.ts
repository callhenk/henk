import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
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

    // Call the ElevenLabs API to list all agents
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Use the correct ElevenLabs API endpoint
    let response: Response | undefined;
    let errorMessage = '';

    try {
      response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
        method: 'GET',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      errorMessage = `ElevenLabs API request failed: ${error}`;
    }

    if (!response || !response.ok) {
      const errorData = response ? await response.json().catch(() => ({})) : {};
      return NextResponse.json(
        {
          success: false,
          error:
            errorData.detail ||
            errorMessage ||
            `Failed to list agents: ${response?.statusText || 'No response'}`,
        },
        { status: response?.status || 500, headers: corsHeaders },
      );
    }

    const agentsList = await response.json();

    return NextResponse.json(
      { success: true, data: agentsList },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('ElevenLabs agents list error:', error);
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
