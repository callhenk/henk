import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '~/lib/elevenlabs-client';
import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(_request: NextRequest) {
  try {
    // Handle CORS preflight
    if (_request.method === 'OPTIONS') {
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

    // Get ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Initialize ElevenLabs client
    const elevenLabs = new ElevenLabsClient(apiKey);

    // Get voices
    const voices = await elevenLabs.getVoices();

    return NextResponse.json(
      {
        success: true,
        data: voices,
        count: voices.length,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to fetch voices',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
