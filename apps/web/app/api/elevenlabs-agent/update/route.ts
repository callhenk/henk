import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function PATCH(request: NextRequest) {
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
    const { agent_id, updates } = await request.json();

    if (!agent_id) {
      return NextResponse.json(
        { success: false, error: 'agent_id is required' },
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

    // Transform updates to match ElevenLabs API structure
    let transformedUpdates = updates;
    if (updates.voice_id) {
      transformedUpdates = {
        conversation_config: {
          tts: {
            voice_id: updates.voice_id,
          },
        },
      };
      // Remove voice_id from root level if it exists
      delete transformedUpdates.voice_id;
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/agents/${agent_id}`,
      {
        method: 'PATCH',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transformedUpdates),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `ElevenLabs API error: ${errorData.detail || response.statusText}`,
      );
    }

    const updatedAgent = await response.json();

    return NextResponse.json(
      {
        success: true,
        data: updatedAgent,
        message: 'ElevenLabs agent updated successfully',
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error updating ElevenLabs agent:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update ElevenLabs agent',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
