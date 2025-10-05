import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

interface AgentRouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: AgentRouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Get user's business context
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('business_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { success: false, error: 'No active business membership found' },
        { status: 403 },
      );
    }

    // 3. Get agent with business validation
    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
      .eq('business_id', teamMember.business_id)
      .single();

    if (error || !agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: `/api/agents/[id]`,
      method: 'GET',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent',
        requestId,
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: AgentRouteParams) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Get user's business context
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('business_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { success: false, error: 'No active business membership found' },
        { status: 403 },
      );
    }

    // 3. Verify agent belongs to user's business
    const { data: existingAgent, error: agentCheckError } = await supabase
      .from('agents')
      .select('id')
      .eq('id', id)
      .eq('business_id', teamMember.business_id)
      .single();

    if (agentCheckError || !existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 },
      );
    }

    // 4. Parse and update agent
    const body = await request.json();

    const { data: agent, error } = await supabase
      .from('agents')
      .update({
        name: body.name,
        description: body.description,
        voice_id: body.voice_id,
        voice_settings: body.voice_settings,
        personality: body.personality,
        script_template: body.script_template,
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`PUT /api/agents/${id} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to update agent' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: agent,
    });
  } catch (error) {
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: `/api/agents/[id]`,
      method: 'PUT',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update agent',
        requestId,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: AgentRouteParams,
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseServerClient();

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Get user's business context
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('business_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { success: false, error: 'No active business membership found' },
        { status: 403 },
      );
    }

    // 3. Check user has permission to delete (admin or owner)
    if (teamMember.role !== 'owner' && teamMember.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions to delete agents' },
        { status: 403 },
      );
    }

    // 4. Delete agent (with business validation via RLS or explicit check)
    const { error } = await supabase
      .from('agents')
      .delete()
      .eq('id', id)
      .eq('business_id', teamMember.business_id);

    if (error) {
      console.error(`DELETE /api/agents/${id} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete agent' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully',
    });
  } catch (error) {
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: `/api/agents/[id]`,
      method: 'DELETE',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete agent',
        requestId,
      },
      { status: 500 },
    );
  }
}
