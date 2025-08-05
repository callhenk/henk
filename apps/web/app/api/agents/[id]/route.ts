import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

interface AgentRouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: AgentRouteParams) {
  try {
    const { id } = await params;

    const supabase = getSupabaseServerClient();

    const { data: agent, error } = await supabase
      .from('agents')
      .select('*')
      .eq('id', id)
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
    console.error(`GET /api/agents/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: AgentRouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = getSupabaseServerClient();

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
    console.error(`PUT /api/agents/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
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

    const { error } = await supabase.from('agents').delete().eq('id', id);

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
    console.error(`DELETE /api/agents/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete agent' },
      { status: 500 },
    );
  }
}
