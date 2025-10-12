import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // 3. Get Salesforce OAuth configuration from environment
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { success: false, error: 'Salesforce OAuth not configured' },
        { status: 500 },
      );
    }

    // 4. Generate state parameter for CSRF protection
    const state = crypto.randomUUID();

    // Store state in session or cache (for now we'll include business_id in state)
    const stateData = {
      state,
      business_id: teamMember.business_id,
      user_id: user.id,
    };

    // In production, you'd store this in Redis or session store
    // For now, we'll encode it in the state parameter
    const encodedState = Buffer.from(JSON.stringify(stateData)).toString('base64url');

    // 5. Build Salesforce authorization URL
    const authUrl = new URL('https://login.salesforce.com/services/oauth2/authorize');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'api refresh_token');
    authUrl.searchParams.set('state', encodedState);

    return NextResponse.json({
      success: true,
      authorization_url: authUrl.toString(),
    });
  } catch (error) {
    console.error('Salesforce authorize error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}