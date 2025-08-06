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

    const body = await request.json();
    const { action, ...agentConfig } = body;

    if (action !== 'create') {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Get user's business context
    const { data: userBusiness, error: businessError } = await supabase
      .from('team_members')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (businessError || !userBusiness) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not associated with any business',
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Call the ElevenLabs agent Edge Function
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/elevenlabs-agent/create`;

    const requestBody = {
      ...agentConfig,
      account_id: user.id,
      business_id: userBusiness.business_id,
    };

    console.log(
      'Sending to ElevenLabs Edge Function:',
      JSON.stringify(requestBody, null, 2),
    );

    const edgeFunctionResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!edgeFunctionResponse.ok) {
      const errorData = await edgeFunctionResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to create ElevenLabs agent',
        },
        { status: edgeFunctionResponse.status, headers: corsHeaders },
      );
    }

    const responseData = await edgeFunctionResponse.json();

    return NextResponse.json(
      { success: true, ...responseData },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('ElevenLabs agent creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
