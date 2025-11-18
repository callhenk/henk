import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('[Salesforce Callback] Received callback with params:', {
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
      url: request.url,
    });

    // Initialize Supabase client early to ensure session is maintained
    const supabase = getSupabaseServerClient();

    // Try to refresh the session to prevent logout
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[Salesforce Callback] Session error:', sessionError);
    }

    // Verify user is still authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Salesforce Callback] User not authenticated:', authError);
      console.log('[Salesforce Callback] Session data:', {
        hasSession: !!session,
      });

      // If there's an error param, still try to redirect to integrations page
      // The middleware might let them through if cookies are still valid
      if (error) {
        const errorDescription = searchParams.get('error_description') || '';
        return NextResponse.redirect(
          new URL(
            `/home/integrations?error=oauth_error&error_description=${encodeURIComponent(errorDescription || 'Authentication failed')}`,
            request.url,
          ),
        );
      }

      // Otherwise, redirect to sign in
      return NextResponse.redirect(
        new URL(
          `/auth/sign-in?next=/home/integrations&error=session_expired`,
          request.url,
        ),
      );
    }

    // Handle OAuth errors (but user is authenticated)
    if (error) {
      const errorDescription = searchParams.get('error_description') || '';
      console.error(
        '[Salesforce Callback] Salesforce OAuth error:',
        error,
        errorDescription,
      );

      // Map common Salesforce errors to user-friendly messages
      let errorMessage = 'oauth_error';
      if (error === 'access_denied') {
        errorMessage = 'access_denied';
      } else if (error === 'redirect_uri_mismatch') {
        errorMessage = 'redirect_uri_mismatch';
      } else if (errorDescription.includes('invalid_client_id')) {
        errorMessage = 'invalid_client_id';
      }

      // Create redirect response without manually copying cookies
      // Supabase client will handle session cookies automatically
      return NextResponse.redirect(
        new URL(
          `/home/integrations?error=${errorMessage}&error_description=${encodeURIComponent(errorDescription)}`,
          request.url,
        ),
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/home/integrations?error=missing_parameters', request.url),
      );
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return NextResponse.redirect(
        new URL('/home/integrations?error=invalid_state', request.url),
      );
    }

    // Get business-specific Salesforce credentials
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials, config')
      .eq('business_id', stateData.business_id)
      .eq('name', 'Salesforce')
      .eq('type', 'crm')
      .single();

    if (integrationError || !integration) {
      return NextResponse.redirect(
        new URL(
          '/home/integrations?error=configuration_error&error_description=Salesforce+integration+not+found.+Please+complete+the+setup+process+to+save+your+credentials.',
          request.url,
        ),
      );
    }

    const credentials = integration.credentials as Record<
      string,
      string
    > | null;
    const clientId = credentials?.clientId || process.env.SALESFORCE_CLIENT_ID;
    const clientSecret =
      credentials?.clientSecret || process.env.SALESFORCE_CLIENT_SECRET;

    // Redirect URI is fixed for the application
    const redirectUri =
      process.env.SALESFORCE_REDIRECT_URI ||
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.callhenk.com'}/api/integrations/salesforce/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL(
          '/home/integrations?error=configuration_error&error_description=Client+ID+or+Client+Secret+is+missing.+Please+enter+your+Connected+App+credentials+in+the+setup+form.',
          request.url,
        ),
      );
    }

    // Determine the Salesforce token URL based on environment
    const config = integration.config as Record<string, string> | null;
    const environment = config?.env || 'production';
    const loginUrl =
      environment === 'sandbox'
        ? 'https://test.salesforce.com'
        : 'https://login.salesforce.com';
    const tokenUrl = `${loginUrl}/services/oauth2/token`;
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      console.error(
        'Salesforce token exchange failed:',
        await tokenResponse.text(),
      );
      return NextResponse.redirect(
        new URL('/home/integrations?error=token_exchange_failed', request.url),
      );
    }

    const tokenData = await tokenResponse.json();

    // Update integration with OAuth tokens while preserving client credentials
    const updatedCredentials = {
      // Preserve the client credentials from the initial setup
      clientId: credentials?.clientId,
      clientSecret: credentials?.clientSecret,
      // Add the OAuth tokens
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenType: tokenData.token_type,
    };

    const updatedConfig = {
      // Preserve existing config
      ...(config || {}),
      // Add instance URL
      instanceUrl: tokenData.instance_url,
      apiVersion: 'v61.0',
    };

    // Update the existing integration record
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        status: 'active',
        config: updatedConfig,
        credentials: updatedCredentials,
        last_sync_at: new Date().toISOString(),
        updated_by: stateData.user_id,
      })
      .eq('business_id', stateData.business_id)
      .eq('name', 'Salesforce')
      .eq('type', 'crm');

    if (updateError) {
      console.error('Failed to update Salesforce integration:', updateError);
      console.error('Update data:', {
        status: 'active',
        config: updatedConfig,
        credentials: '***REDACTED***',
      });

      // Pass more detailed error info
      const errorDetail = encodeURIComponent(
        updateError.message || 'Unknown database error',
      );
      return NextResponse.redirect(
        new URL(
          `/home/integrations?error=save_failed&error_description=${errorDetail}`,
          request.url,
        ),
      );
    }

    // If no rows were updated, it means the integration doesn't exist
    // This shouldn't happen if the authorize flow worked correctly
    const { count } = await supabase
      .from('integrations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', stateData.business_id)
      .eq('name', 'Salesforce')
      .eq('type', 'crm');

    if (!count || count === 0) {
      console.error(
        'Integration record not found after update. This should not happen.',
      );
      return NextResponse.redirect(
        new URL(
          '/home/integrations?error=save_failed&error_description=Integration+record+not+found',
          request.url,
        ),
      );
    }

    // Create success redirect response without manually copying cookies
    // Supabase client will handle session cookies automatically
    return NextResponse.redirect(
      new URL('/home/integrations?success=salesforce_connected', request.url),
    );
  } catch (error) {
    console.error('Salesforce callback error:', error);

    // Create error redirect response without manually copying cookies
    // Supabase client will handle session cookies automatically
    return NextResponse.redirect(
      new URL('/home/integrations?error=internal_error', request.url),
    );
  }
}
