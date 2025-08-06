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

    // Get user's account information
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', user.id)
      .single();

    if (accountError) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('GET /api/auth/user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}
