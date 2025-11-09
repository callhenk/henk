import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export interface AuthenticatedContext {
  user: {
    id: string;
    email?: string;
  };
  businessId: string;
  role: string;
}

/**
 * Middleware to verify user authentication and business membership
 * Returns the authenticated context or an error response
 */
export async function withAuth(
  _request: NextRequest,
): Promise<
  | { success: true; context: AuthenticatedContext }
  | { success: false; response: NextResponse }
> {
  const supabase = getSupabaseServerClient();

  // 1. Verify authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      response: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      ),
    };
  }

  // 2. Get user's business context
  const { data: teamMember, error: teamError } = await supabase
    .from('team_members')
    .select('business_id, role, status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (teamError || !teamMember) {
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'No active business membership found',
        },
        { status: 403 },
      ),
    };
  }

  return {
    success: true,
    context: {
      user: {
        id: user.id,
        email: user.email,
      },
      businessId: teamMember.business_id,
      role: teamMember.role,
    },
  };
}
