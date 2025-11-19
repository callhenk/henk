import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '~/lib/elevenlabs-client';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    // Get agent_id from query parameters
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agent_id');

    if (!agentId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter: agent_id' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Get ElevenLabs API key from environment
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Initialize ElevenLabs client
    const elevenLabs = new ElevenLabsClient(apiKey);

    // Get signed URL from ElevenLabs
    const { signed_url } = await elevenLabs.getSignedUrl(agentId);

    return NextResponse.json(
      {
        success: true,
        signed_url,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error getting signed URL:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to get signed URL',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
