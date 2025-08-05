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

    // First, get the campaign to check its current status
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
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

    // Update campaign status to paused
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        status: 'paused',
        stopped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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
