import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helper function to get user's business context
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };
}

// Helper function to validate agent belongs to user's business
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// Helper function to validate knowledge base belongs to user's business
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function validateKnowledgeBaseBusinessAccess(supabase: any, kbId: string, businessId: string) {
  const { data: kb, error } = await supabase
    .from('knowledge_bases')
    .select('id, business_id')
    .eq('id', kbId)
    .single();

  if (error || !kb) {
    throw new Error('Knowledge base not found');
  }

  if (kb.business_id !== businessId) {
    throw new Error('Access denied: Knowledge base does not belong to your business');
  }

  return kb;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = getSupabaseServerClient();
    const businessContext = await getUserBusinessContext(supabase);
    const agentId = params.id;

    // Validate agent belongs to user's business
    await validateAgentBusinessAccess(supabase, agentId, businessContext.business_id);

    // Fetch linked knowledge bases for this agent
    const { data: linkedKBs, error: dbError } = await supabase
      .from('agents_knowledge_bases')
      .select(
        `
        id,
        knowledge_base_id,
        created_at,
        knowledge_bases!inner(
          id,
          name,
          description,
          elevenlabs_kb_id,
          file_count,
          char_count,
          status,
          created_at
        )
      `
      )
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Failed to fetch agent knowledge bases:', dbError);
      throw new Error('Failed to fetch knowledge bases');
    }

    return NextResponse.json(
      {
        success: true,
        data: linkedKBs || [],
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('GET /api/agents/[id]/knowledge-bases error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const supabase = getSupabaseServerClient();
    const businessContext = await getUserBusinessContext(supabase);
    const agentId = params.id;

    // Validate agent belongs to user's business
    await validateAgentBusinessAccess(supabase, agentId, businessContext.business_id);

    const body = await request.json();
    const { knowledge_base_id } = body;

    if (!knowledge_base_id) {
      return NextResponse.json(
        { success: false, error: 'knowledge_base_id is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate knowledge base belongs to user's business
    await validateKnowledgeBaseBusinessAccess(supabase, knowledge_base_id, businessContext.business_id);

    // Check if already linked
    const { data: existing } = await supabase
      .from('agents_knowledge_bases')
      .select('id')
      .eq('agent_id', agentId)
      .eq('knowledge_base_id', knowledge_base_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Knowledge base is already linked to this agent' },
        { status: 409, headers: corsHeaders }
      );
    }

    // Create the link
    const { data: linked, error: linkError } = await supabase
      .from('agents_knowledge_bases')
      .insert({
        agent_id: agentId,
        knowledge_base_id: knowledge_base_id,
      })
      .select('id, created_at')
      .single();

    if (linkError) {
      console.error('Failed to link knowledge base to agent:', linkError);
      throw new Error('Failed to link knowledge base to agent');
    }

    console.log('Knowledge base linked to agent:', {
      agent_id: agentId,
      knowledge_base_id: knowledge_base_id,
      business_id: businessContext.business_id,
    });

    return NextResponse.json(
      {
        success: true,
        data: linked,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('POST /api/agents/[id]/knowledge-bases error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; kb_id: string } }
) {
  try {
    const supabase = getSupabaseServerClient();
    const businessContext = await getUserBusinessContext(supabase);
    const agentId = params.id;
    const kbId = params.kb_id;

    // Validate agent belongs to user's business
    await validateAgentBusinessAccess(supabase, agentId, businessContext.business_id);

    // Validate knowledge base belongs to user's business
    await validateKnowledgeBaseBusinessAccess(supabase, kbId, businessContext.business_id);

    // Delete the link
    const { error: deleteError } = await supabase
      .from('agents_knowledge_bases')
      .delete()
      .eq('agent_id', agentId)
      .eq('knowledge_base_id', kbId);

    if (deleteError) {
      console.error('Failed to unlink knowledge base from agent:', deleteError);
      throw new Error('Failed to unlink knowledge base from agent');
    }

    console.log('Knowledge base unlinked from agent:', {
      agent_id: agentId,
      knowledge_base_id: kbId,
      business_id: businessContext.business_id,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Knowledge base unlinked successfully',
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('DELETE /api/agents/[id]/knowledge-bases error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
