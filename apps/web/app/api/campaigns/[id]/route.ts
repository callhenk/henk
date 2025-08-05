import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

interface CampaignRouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: CampaignRouteParams,
) {
  try {
    const { id } = await params;

    const supabase = getSupabaseServerClient();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error(`GET /api/campaigns/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaign' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: CampaignRouteParams,
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const supabase = getSupabaseServerClient();

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .update({
        name: body.name,
        description: body.description,
        agent_id: body.agent_id,
        calling_hours: body.calling_hours,
        max_attempts: body.max_attempts,
        daily_call_cap: body.daily_call_cap,
        script: body.script,
        retry_logic: body.retry_logic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`PUT /api/campaigns/${id} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to update campaign' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    console.error(`PUT /api/campaigns/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: CampaignRouteParams,
) {
  try {
    const { id } = await params;

    const supabase = getSupabaseServerClient();

    const { error } = await supabase.from('campaigns').delete().eq('id', id);

    if (error) {
      console.error(`DELETE /api/campaigns/${id} error:`, error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete campaign' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully',
    });
  } catch (error) {
    console.error(`DELETE /api/campaigns/${id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 },
    );
  }
}
