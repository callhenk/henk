import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

interface CampaignStopRouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: CampaignStopRouteParams,
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

    // 3. Check permissions (members can stop campaigns)
    if (teamMember.role === 'viewer') {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient permissions to stop campaigns',
        },
        { status: 403 },
      );
    }

    // 4. Get the campaign and verify business ownership
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .eq('business_id', teamMember.business_id)
      .single();

    if (fetchError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 },
      );
    }

    if (campaign.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Campaign is not currently active' },
        { status: 400 },
      );
    }

    // 5. Update campaign status to paused
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'paused',
        stopped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: user.id,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error(`POST /api/campaigns/${id}/stop error:`, updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to stop campaign' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
      message: 'Campaign stopped successfully. No new calls will be initiated.',
    });
  } catch (error) {
    console.error(`POST /api/campaigns/${id}/stop error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to stop campaign' },
      { status: 500 },
    );
  }
}
