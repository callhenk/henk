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

    // 3. Get Salesforce OAuth configuration from business integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials, config')
      .eq('business_id', teamMember.business_id)
      .eq('name', 'Salesforce')
      .eq('type', 'crm')
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Salesforce integration not found. Please save your Connected App credentials first by completing the setup steps.',
        },
        { status: 404 },
      );
    }

    const credentials = integration.credentials as Record<string, string> | null;
    const clientId = credentials?.clientId || process.env.SALESFORCE_CLIENT_ID;

    // Redirect URI is fixed for the application
    const redirectUri = process.env.SALESFORCE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.callhenk.com'}/api/integrations/salesforce/callback`;

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Client ID is required. Please enter your Connected App credentials in the setup form.',
        },
        { status: 400 },
      );
    }

    // Determine the Salesforce login URL based on environment
    const config = integration.config as Record<string, string> | null;
    const environment = config?.env || 'production';
    const loginUrl =
      environment === 'sandbox'
        ? 'https://test.salesforce.com'
        : 'https://login.salesforce.com';

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
    const authUrl = new URL(`${loginUrl}/services/oauth2/authorize`);
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