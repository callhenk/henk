import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface AgentRouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: AgentRouteParams) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const { id } = await params;
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

    // Call the ElevenLabs API directly to get agent details
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Try different ElevenLabs API endpoints
    let response: Response | undefined;
    let errorMessage = '';

    // Use the correct ElevenLabs API endpoint with cache busting
    try {
      response = await fetch(
        `https://api.elevenlabs.io/v1/convai/agents/${id}?t=${Date.now()}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': elevenLabsApiKey,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        },
      );
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
            `Failed to fetch agent details: ${response?.statusText || 'No response'}`,
        },
        { status: response?.status || 500, headers: corsHeaders },
      );
    }

    const agentDetails = await response.json();
    console.log('ElevenLabs agent details for ID:', id, ':', agentDetails);

    return NextResponse.json(
      { success: true, data: agentDetails },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('ElevenLabs agent details fetch error:', error);
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
