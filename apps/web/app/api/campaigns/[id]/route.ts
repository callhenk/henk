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
        max_attempts: body.max_attempts,
        daily_call_cap: body.daily_call_cap,
        script: body.script,
        retry_logic: body.retry_logic,
        budget: body.budget,
        start_date: body.start_date,
        end_date: body.end_date,
        // Wizard fields (optional)
        goal_metric: body.goal_metric,
        call_window_start: body.call_window_start,
        call_window_end: body.call_window_end,
        // TODO: Add back when multiple Twilio numbers available: caller_id: body.caller_id,
        // TODO: Add back if needed: disclosure_line: body.disclosure_line,
        audience_list_id: body.audience_list_id,
        dedupe_by_phone: body.dedupe_by_phone,
        exclude_dnc: body.exclude_dnc,
        audience_contact_count: body.audience_contact_count,
        status: body.status,
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
