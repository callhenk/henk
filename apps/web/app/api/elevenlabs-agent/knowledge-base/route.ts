import { NextRequest, NextResponse } from 'next/server';

import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '~/lib/database.types';
import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to get user's business context
async function getUserBusinessContext(supabase: SupabaseClient<Database>) {
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
async function validateAgentBusinessAccess(
  supabase: SupabaseClient<Database>,
  agentId: string,
  businessId: string,
) {
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

// Helper function to extract error message from ElevenLabs API response
function extractErrorMessage(errorData: unknown): string {
  if (typeof errorData === 'object' && errorData !== null) {
    const obj = errorData as Record<string, unknown>;

    // Check for detail object with message
    if (obj.detail && typeof obj.detail === 'object') {
      const detail = obj.detail as Record<string, unknown>;
      if (detail.message && typeof detail.message === 'string') {
        return detail.message;
      }
    }

    // Check for message field
    if (obj.message && typeof obj.message === 'string') {
      return obj.message;
    }

    // Check for error field
    if (obj.error && typeof obj.error === 'string') {
      return obj.error;
    }
  }

  return 'Failed to create knowledge base. Please check your input and try again.';
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get('page_size') || '30', 10);
    const search = searchParams.get('search');
    const agentId = searchParams.get('agent_id');

    // If agent_id is provided, validate it belongs to the user's business
    if (agentId) {
      await validateAgentBusinessAccess(
        supabase,
        agentId,
        businessContext.business_id,
      );
    }

    // Fetch knowledge bases from our database for business isolation
    let query = supabase
      .from('knowledge_bases')
      .select(
        'id, name, description, elevenlabs_kb_id, file_count, char_count, status, metadata, created_at',
      )
      .eq('business_id', businessContext.business_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(pageSize);

    // Apply search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: kbRecords, error: dbError } = await query;

    if (dbError) {
      console.error('Failed to fetch knowledge bases from database:', dbError);
      throw new Error('Failed to fetch knowledge bases');
    }

    // Transform database records to match the expected format
    // Each KB record represents a knowledge base that can be linked to an agent
    const documents = (kbRecords || []).map((kb) => {
      // Safely extract usage_mode from metadata
      let usageMode = 'default';
      if (
        typeof kb.metadata === 'object' &&
        kb.metadata !== null &&
        !Array.isArray(kb.metadata)
      ) {
        const metadata = kb.metadata as Record<string, unknown>;
        if (typeof metadata.usage_mode === 'string') {
          usageMode = metadata.usage_mode;
        }
      }

      return {
        id: kb.id,
        name: kb.name,
        description: kb.description || '',
        knowledge_base_id: kb.elevenlabs_kb_id,
        type: 'knowledge_base',
        status: kb.status,
        metadata: {
          file_count: typeof kb.file_count === 'number' ? kb.file_count : 0,
          char_count: typeof kb.char_count === 'number' ? kb.char_count : 0,
          created_at_unix_secs: kb.created_at
            ? Math.floor(new Date(kb.created_at).getTime() / 1000)
            : 0,
        },
        usage_mode: usageMode,
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          documents,
          has_more: false,
          next_cursor: null,
        },
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
      await validateAgentBusinessAccess(
        supabase,
        agent_id,
        businessContext.business_id,
      );
    }

    let response;

    switch (type) {
      case 'url': {
        if (!url) {
          return NextResponse.json(
            { success: false, error: 'URL is required for URL type documents' },
            { status: 400, headers: corsHeaders },
          );
        }

        // Validate and normalize URL
        let validUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          validUrl = `https://${url}`;
        }

        // Validate URL format
        try {
          new URL(validUrl);
        } catch {
          return NextResponse.json(
            {
              success: false,
              error:
                'Invalid URL format. Please enter a valid URL (e.g., https://example.com)',
            },
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
              url: validUrl,
              name: name || validUrl,
            }),
          },
        );
        break;
      }

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
      const errorMessage = extractErrorMessage(errorData);
      console.error('Knowledge base creation error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        extractedMessage: errorMessage,
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();

    // Save the knowledge base to our database for business isolation
    // data.id is the ElevenLabs KB ID from the response
    if (!data.id) {
      throw new Error('No knowledge base ID returned from ElevenLabs');
    }

    const { data: insertedData, error: dbError } = await supabase
      .from('knowledge_bases')
      .upsert(
        {
          business_id: businessContext.business_id,
          elevenlabs_kb_id: data.id,
          name: name || 'Unnamed Knowledge Base',
          description: null,
          file_count: 0,
          char_count: 0,
          status: 'active',
          metadata: {
            document_type: type,
            created_from_api: true,
          },
          created_by: businessContext.user_id,
          updated_by: businessContext.user_id,
        },
        {
          onConflict: 'business_id,elevenlabs_kb_id',
        },
      )
      .select('id, name, elevenlabs_kb_id, status, created_at');

    if (dbError) {
      console.error('Failed to save knowledge base to database:', {
        error: dbError,
        input: {
          business_id: businessContext.business_id,
          elevenlabs_kb_id: data.id,
          name: name || 'Unnamed Knowledge Base',
        },
      });
      throw new Error(
        `Failed to save knowledge base to database: ${dbError.message}`,
      );
    }

    if (!insertedData || insertedData.length === 0) {
      console.error('No data returned from knowledge base upsert');
      throw new Error('Failed to save knowledge base: No data returned');
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const savedKBRecord = insertedData[0] as any;
    console.log('Knowledge base saved to database:', {
      id: savedKBRecord.id,
      name: savedKBRecord.name,
      elevenlabs_kb_id: savedKBRecord.elevenlabs_kb_id,
    });

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
        data: savedKBRecord,
        business_context: {
          business_id: businessContext.business_id,
          role: businessContext.role,
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('POST /api/elevenlabs-agent/knowledge-base error:', {
      message: errorMessage,
      stack: errorStack,
      error,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage || 'Failed to create knowledge document',
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
