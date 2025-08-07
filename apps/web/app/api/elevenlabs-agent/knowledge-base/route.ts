import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to get user's business context
async function getUserBusinessContext(supabase: any) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Get the user's active business membership
  const { data: teamMembership, error: teamError } = await supabase
    .from('team_members')
    .select('business_id, user_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (teamError || !teamMembership) {
    throw new Error('No active business membership found');
  }

  return {
    user_id: user.id,
    business_id: teamMembership.business_id,
    role: teamMembership.role,
    status: teamMembership.status,
  };
}

// Helper function to validate agent belongs to user's business
async function validateAgentBusinessAccess(supabase: any, agentId: string, businessId: string) {
  const { data: agent, error } = await supabase
    .from('agents')
    .select('id, business_id')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    throw new Error('Agent not found');
  }

  if (agent.business_id !== businessId) {
    throw new Error('Access denied: Agent does not belong to your business');
  }

  return agent;
}

export async function GET(request: NextRequest) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = getSupabaseServerClient();

    // Get user's business context
    const businessContext = await getUserBusinessContext(supabase);

    // Get ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const pageSize = searchParams.get('page_size') || '30';
    const search = searchParams.get('search');
    const showOnlyOwned =
      searchParams.get('show_only_owned_documents') || 'false';
    const types = searchParams.get('types');
    const agentId = searchParams.get('agent_id');

    // If agent_id is provided, validate it belongs to the user's business
    if (agentId) {
      await validateAgentBusinessAccess(supabase, agentId, businessContext.business_id);
    }

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (cursor) queryParams.append('cursor', cursor);
    if (pageSize) queryParams.append('page_size', pageSize);
    if (search) queryParams.append('search', search);
    if (showOnlyOwned)
      queryParams.append('show_only_owned_documents', showOnlyOwned);
    if (types) queryParams.append('types', types);

    // Fetch knowledge base documents from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/knowledge-base?${queryParams.toString()}`,
      {
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs knowledge base API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `ElevenLabs knowledge base API error: ${errorData.detail || response.statusText}`,
      );
    }

    const data = await response.json();

    // Filter documents by business access (if we have business-specific filtering)
    // Note: ElevenLabs doesn't provide business-level filtering, so we rely on
    // the fact that each business uses their own ElevenLabs API key or we
    // implement additional filtering logic here if needed

    return NextResponse.json(
      {
        success: true,
        data,
        business_context: {
          business_id: businessContext.business_id,
          role: businessContext.role,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('GET /api/elevenlabs-agent/knowledge-base error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
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

    // Get user's business context
    const businessContext = await getUserBusinessContext(supabase);

    // Get ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: 500, headers: corsHeaders },
      );
    }

    const body = await request.json();
    const { type, url, name, text, file, agent_id } = body;

    // If agent_id is provided, validate it belongs to the user's business
    if (agent_id) {
      await validateAgentBusinessAccess(supabase, agent_id, businessContext.business_id);
    }

    let response;

    switch (type) {
      case 'url':
        if (!url) {
          return NextResponse.json(
            { success: false, error: 'URL is required for URL type documents' },
            { status: 400, headers: corsHeaders },
          );
        }

        response = await fetch(
          'https://api.elevenlabs.io/v1/convai/knowledge-base/url',
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              url,
              name: name || url,
            }),
          },
        );
        break;

      case 'text':
        if (!text) {
          return NextResponse.json(
            {
              success: false,
              error: 'Text content is required for text type documents',
            },
            { status: 400, headers: corsHeaders },
          );
        }

        response = await fetch(
          'https://api.elevenlabs.io/v1/convai/knowledge-base/text',
          {
            method: 'POST',
            headers: {
              'xi-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text,
              name: name || 'Text Document',
            }),
          },
        );
        break;

      case 'file':
        if (!file) {
          return NextResponse.json(
            {
              success: false,
              error: 'File is required for file type documents',
            },
            { status: 400, headers: corsHeaders },
          );
        }

        // For file uploads, we need to handle the file data
        // This would typically involve getting the file from Supabase storage
        // and then uploading it to ElevenLabs
        return NextResponse.json(
          { success: false, error: 'File upload not yet implemented' },
          { status: 501, headers: corsHeaders },
        );

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid document type' },
          { status: 400, headers: corsHeaders },
        );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs knowledge base creation error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
      });
      throw new Error(
        `ElevenLabs knowledge base creation error: ${errorData.detail || response.statusText}`,
      );
    }

    const data = await response.json();

    // Log the creation for audit purposes
    console.log('Knowledge base document created:', {
      business_id: businessContext.business_id,
      user_id: businessContext.user_id,
      document_type: type,
      document_name: name,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        data,
        business_context: {
          business_id: businessContext.business_id,
          role: businessContext.role,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error('POST /api/elevenlabs-agent/knowledge-base error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
