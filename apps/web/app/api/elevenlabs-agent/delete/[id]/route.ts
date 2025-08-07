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

export async function DELETE(
  request: NextRequest,
  { params }: AgentRouteParams,
) {
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

    // Get ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Delete ElevenLabs agent
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${id}`,
      {
        method: 'DELETE',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ElevenLabs API error: ${errorData.detail || response.statusText}`,
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'ElevenLabs agent deleted successfully',
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error deleting ElevenLabs agent:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete ElevenLabs agent',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
