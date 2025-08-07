import { NextRequest, NextResponse } from 'next/server';

import { ElevenLabsClient } from '~/lib/elevenlabs-client';
import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface KnowledgeBaseRouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: KnowledgeBaseRouteParams,
) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const { id } = await params;
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

    // Get knowledge base
    const knowledgeBase = await elevenLabs.getKnowledgeBase(id);

    return NextResponse.json(
      {
        success: true,
        data: knowledgeBase,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error getting knowledge base:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to get knowledge base',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: KnowledgeBaseRouteParams,
) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const { id } = await params;
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
    const updates = await request.json();

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

    // Update knowledge base
    const knowledgeBase = await elevenLabs.updateKnowledgeBase(id, updates);

    return NextResponse.json(
      {
        success: true,
        data: knowledgeBase,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error updating knowledge base:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update knowledge base',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: KnowledgeBaseRouteParams,
) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const { id } = await params;
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

    // Delete knowledge base
    await elevenLabs.deleteKnowledgeBase(id);

    return NextResponse.json(
      {
        success: true,
        message: 'Knowledge base deleted successfully',
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete knowledge base',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
