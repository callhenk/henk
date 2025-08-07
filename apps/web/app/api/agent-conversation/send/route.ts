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
    const { conversation_id, message, account_id } = await request.json();

    if (!conversation_id || !message || !account_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'conversation_id, message, and account_id are required',
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

    // Send message to ElevenLabs conversation
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversation_id}/messages`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          account_id,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `ElevenLabs API error: ${errorData.detail || response.statusText}`,
      );
    }

    const messageResponse = await response.json();

    // Store message in local database
    const { error: dbError } = await supabase
      .from('conversation_messages')
      .insert({
        conversation_id,
        message,
        account_id,
        timestamp: new Date().toISOString(),
        message_type: 'user',
      });

    if (dbError) {
      console.error('Error storing message in database:', dbError);
      // Don't fail the entire operation if database storage fails
    }

    return NextResponse.json(
      {
        success: true,
        data: messageResponse,
        message: 'Message sent successfully',
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to send message',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
