import { NextRequest, NextResponse } from 'next/server';

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

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
    const body: GenerateSpeechRequest = await request.json();

    const { text, voice_id, voice_settings } = body;

    if (!text || !voice_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: text, voice_id',
        },
        { status: 400 },
      );
    }

    // Call the edge function to generate speech
    const response = await fetch(
      `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-generate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          text,
          voice_id,
          voice_settings,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Edge function error: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        demo_mode: result.demo_mode,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to generate speech',
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('POST /api/voice/generate error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate speech',
      },
      { status: 500 },
    );
  }
}
