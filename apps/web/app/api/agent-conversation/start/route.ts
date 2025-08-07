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
    const {
      agent_id,
      account_id,
      business_id,
      initial_message,
      conversation_type,
    } = await request.json();

    if (!agent_id || !account_id || !business_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'agent_id, account_id, and business_id are required',
        },
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

    // Start conversation with ElevenLabs agent
    const response = await fetch(
      'https://api.elevenlabs.io/v1/convai/conversations',
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_id,
          account_id,
          business_id,
          initial_message:
            initial_message || 'Hello, I would like to start a conversation.',
          conversation_type: conversation_type || 'voice',
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ElevenLabs API error: ${errorData.detail || response.statusText}`,
      );
    }

    const conversation = await response.json();

    // Store conversation in local database
    const { data: conversationRecord, error: dbError } = await supabase
      .from('conversations')
      .insert({
        id: conversation.conversation_id,
        agent_id,
        account_id,
        business_id,
        status: 'active',
        started_at: new Date().toISOString(),
        conversation_type: conversation_type || 'voice',
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing conversation in database:', dbError);
      // Don't fail the entire operation if database storage fails
    }

    return NextResponse.json(
      {
        success: true,
        data: conversation,
        message: 'Conversation started successfully',
      },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start conversation',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
