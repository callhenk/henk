import { NextRequest, NextResponse } from 'next/server';

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
    const agentConfig = await request.json();

    if (!agentConfig.name || !agentConfig.voice_id) {
      return NextResponse.json(
        { success: false, error: 'name and voice_id are required' },
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

    // Create ElevenLabs agent
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: agentConfig.name,
        description: agentConfig.description || '',
        voice_id: agentConfig.voice_id,
        llm_model: agentConfig.llm_model || 'gpt-4o',
        voice_settings: agentConfig.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        },
        context_data: agentConfig.context_data || {},
        conversation_flow: agentConfig.conversation_flow || {},
        prompts: agentConfig.prompts || {},
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ElevenLabs API error: ${errorData.detail || response.statusText}`,
      );
    }

    const createdAgent = await response.json();

    return NextResponse.json(
      {
        success: true,
        data: createdAgent,
        message: 'ElevenLabs agent created successfully',
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error creating ElevenLabs agent:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create ElevenLabs agent',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
