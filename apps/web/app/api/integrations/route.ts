import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export async function GET(_request: NextRequest) {
  try {
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

    // 3. Fetch integrations for the business
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('*')
      .eq('business_id', teamMember.business_id);

    if (integrationsError) {
      console.error('Failed to fetch integrations:', integrationsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch integrations' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      integrations: integrations || [],
    });
  } catch (error) {
    console.error('Integrations fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
