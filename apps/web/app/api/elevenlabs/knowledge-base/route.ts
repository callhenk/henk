import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '~/lib/elevenlabs-client';
import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
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

    // List knowledge bases
    const knowledgeBases = await elevenLabs.listKnowledgeBases();

    return NextResponse.json(
      {
        success: true,
        data: knowledgeBases,
        count: knowledgeBases.length,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error listing knowledge bases:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to list knowledge bases',
      },
      { status: 500, headers: corsHeaders },
    );
  }
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

    // Parse request body
    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'name is required' },
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

    // Create knowledge base
    const knowledgeBase = await elevenLabs.createKnowledgeBase({
      name,
      description,
    });

    return NextResponse.json(
      {
        success: true,
        data: knowledgeBase,
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error creating knowledge base:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create knowledge base',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
