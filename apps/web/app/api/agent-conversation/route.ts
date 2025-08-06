import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface ConversationRequest {
  agent_id: string;
  conversation_id?: string;
  message?: string;
  conversation_type: 'text' | 'voice';
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

    // Check if this is a multipart form data request (for audio files)
    const contentType = request.headers.get('content-type') || '';
    let body: ConversationRequest;

    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data for audio files
      const formData = await request.formData();
      const jsonData = formData.get('data') as string;
      body = JSON.parse(jsonData);
    } else {
      // Handle JSON request for text messages
      body = await request.json();
    }

    const { agent_id, conversation_type } = body;

    // Validate required fields
    if (!agent_id || !conversation_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: agent_id, conversation_type',
        },
        { status: 400, headers: corsHeaders },
      );
    }

    // Get user's account and business context
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', user.id)
      .single();

    if (accountError || !account) {
      return NextResponse.json(
        {
          success: false,
          error: 'User account not found',
        },
        { status: 400, headers: corsHeaders },
      );
    }

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

    // Call your Edge Function for agent conversation
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/agent-conversation`;

    console.log('Sending to Edge Function:', {
      ...body,
      account_id: user.id,
      business_id: userBusiness.business_id,
      user_info: {
        email: user.email,
        name:
          user.user_metadata?.full_name ||
          user.email?.split('@')[0] ||
          'Unknown',
        phone: user.user_metadata?.phone || null,
      },
      auth_user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      },
    });

    const edgeFunctionResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        ...body,
        account_id: user.id,
        business_id: userBusiness.business_id,
        user_info: {
          email: user.email,
          name:
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'Unknown',
          phone: user.user_metadata?.phone || null,
        },
        auth_user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
      }),
    });

    if (!edgeFunctionResponse.ok) {
      const errorData = await edgeFunctionResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to process conversation',
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
    console.error('Agent conversation error:', error);
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

// Handle voice message uploads
export async function PUT(request: NextRequest) {
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

    // Handle voice message upload
    const formData = await request.formData();
    const audio = formData.get('audio') as File;
    const agentId = formData.get('agent_id') as string;
    const conversationId = formData.get('conversation_id') as string;
    const conversationType = formData.get('conversation_type') as string;

    if (!audio || !agentId || !conversationType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400, headers: corsHeaders },
      );
    }

    // Call your Edge Function for voice processing
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/agent-conversation`;

    const voiceFormData = new FormData();
    voiceFormData.append('audio', audio);
    voiceFormData.append('agent_id', agentId);
    voiceFormData.append('conversation_id', conversationId || '');
    voiceFormData.append('conversation_type', conversationType);
    voiceFormData.append('user_id', user.id);

    const edgeFunctionResponse = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
      },
      body: voiceFormData,
    });

    if (!edgeFunctionResponse.ok) {
      const errorData = await edgeFunctionResponse.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || 'Failed to process voice message',
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
    console.error('Voice message processing error:', error);
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
