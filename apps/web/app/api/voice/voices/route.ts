import { NextRequest, NextResponse } from 'next/server';

const EDGE_FUNCTIONS_BASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

export async function GET(_request: NextRequest) {
  try {
    // Call the edge function to get voices
    const response = await fetch(
      `${EDGE_FUNCTIONS_BASE_URL}/elevenlabs-voices`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
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
        count: result.count,
        demo_mode: result.demo_mode,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch voices',
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error('GET /api/voice/voices error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch voices',
      },
      { status: 500 },
    );
  }
}
