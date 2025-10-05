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

    // 3. Get campaign with business validation
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('business_id', teamMember.business_id)
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
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: `/api/campaigns/[id]`,
      method: 'GET',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaign',
        requestId,
      },
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

    // 3. Verify campaign belongs to user's business
    const { data: existingCampaign, error: campaignCheckError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .eq('business_id', teamMember.business_id)
      .single();

    if (campaignCheckError || !existingCampaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 },
      );
    }

    // 4. Parse and update campaign
    const body = await request.json();

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
        updated_by: user.id,
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
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: `/api/campaigns/[id]`,
      method: 'PUT',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update campaign',
        requestId,
      },
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
        {
          success: false,
          error: 'Insufficient permissions to delete campaigns',
        },
        { status: 403 },
      );
    }

    // 4. Delete campaign (with business validation via RLS or explicit check)
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('business_id', teamMember.business_id);

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
    const requestId = request.headers.get('x-correlation-id');
    console.error('API Error:', {
      path: `/api/campaigns/[id]`,
      method: 'DELETE',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete campaign',
        requestId,
      },
      { status: 500 },
    );
  }
}
