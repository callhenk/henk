import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '~/lib/elevenlabs-client';
import { StorageClient } from '~/lib/storage-client';
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
    const { voice_id, sample_text } = await request.json();

    if (!voice_id) {
      return NextResponse.json(
        { success: false, error: 'voice_id is required' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Get environment variables
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, error: 'Missing required environment variables' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Initialize clients
    const elevenLabs = new ElevenLabsClient(apiKey);
    const storage = new StorageClient(supabaseUrl, supabaseServiceKey);

    // Generate test speech
    const textToTest =
      sample_text || 'Hello! This is a test of the voice. How does it sound?';
    const speechResult = await elevenLabs.testVoice(voice_id, textToTest);

    // Upload to storage
    const fileName = storage.generateFileName(voice_id, Date.now());
    const uploadResult = await storage.uploadAudio(
      speechResult.audio,
      fileName,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          audio_url: uploadResult.url,
          file_path: uploadResult.path,
          file_size: uploadResult.size,
          duration: speechResult.duration,
          voice_id,
          sample_text: textToTest,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error testing voice:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to test voice',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
