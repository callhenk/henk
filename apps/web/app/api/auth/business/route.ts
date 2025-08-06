import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // Get authenticated user
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

    // Get user's business context
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('business_id')
      .eq('user_id', user.id)
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { success: false, error: 'User not associated with any business' },
        { status: 400 },
      );
    }

    // Get business information
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', teamMember.business_id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { success: false, error: 'Business not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error('GET /api/auth/business error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
