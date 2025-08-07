import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '~/lib/elevenlabs-client';
import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface GenerateSpeechRequest {
  text: string;
  voice_id: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
  };
}

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

    const body: GenerateSpeechRequest = await request.json();

    const { text, voice_id, voice_settings } = body;

    if (!text || !voice_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: text, voice_id',
        },
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

    // Initialize ElevenLabs client
    const elevenLabs = new ElevenLabsClient(apiKey);

    // Generate speech
    const result = await elevenLabs.generateSpeech({
      text,
      voice_id,
      voice_settings,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          audio_url: `data:audio/mpeg;base64,${Buffer.from(result.audio).toString('base64')}`,
          duration_seconds: result.duration,
          file_size_bytes: result.audio.byteLength,
          voice_id,
          text,
        },
        demo_mode: false,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('POST /api/voice/generate error:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate speech',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
