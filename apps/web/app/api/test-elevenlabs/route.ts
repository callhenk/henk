import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'ELEVENLABS_API_KEY not configured',
      });
    }

    // Test basic ElevenLabs API call
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `ElevenLabs API error: ${response.status} ${response.statusText}`,
      });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'ElevenLabs integration working',
      voices_count: data.voices?.length || 0,
    });
  } catch (error) {
    console.error('ElevenLabs test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test ElevenLabs integration',
    });
  }
}
