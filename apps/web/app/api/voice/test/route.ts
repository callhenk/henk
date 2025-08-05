import { NextRequest, NextResponse } from 'next/server';

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

interface VoiceTestRequest {
  voice_id: string;
  sample_text: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VoiceTestRequest = await request.json();

    const { voice_id, sample_text } = body;

    console.log('Voice test request:', { voice_id, sample_text });

    if (!voice_id || !sample_text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: voice_id, sample_text',
        },
        { status: 400 },
      );
    }

    // Call the edge function to test voice
    const edgeFunctionUrl = `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-test-voice`;
    console.log('Calling edge function:', edgeFunctionUrl);

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        voice_id,
        sample_text,
      }),
    });

    console.log('Edge function response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error:', errorText);
      throw new Error(
        `Edge function error: ${response.statusText} - ${errorText}`,
      );
    }

    const result = await response.json();
    console.log('Edge function result:', result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          testId: `test_${Date.now()}`,
          voice_id,
          sample_text,
          audio_url: result.data.audio_url,
          duration_seconds: result.data.duration_seconds,
          file_size_bytes: result.data.file_size_bytes,
          voice_name: result.data.voice_name,
          status: 'completed',
          timestamp: new Date().toISOString(),
        },
        demo_mode: result.demo_mode,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to test voice',
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('POST /api/voice/test error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to test voice',
      },
      { status: 500 },
    );
  }
}
