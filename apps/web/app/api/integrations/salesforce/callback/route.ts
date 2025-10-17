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
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[Salesforce Callback] Session error:', sessionError);
    }

    // Verify user is still authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('[Salesforce Callback] User not authenticated:', authError);
      console.log('[Salesforce Callback] Session data:', { hasSession: !!session });

      // If there's an error param, still try to redirect to integrations page
      // The middleware might let them through if cookies are still valid
      if (error) {
        const errorDescription = searchParams.get('error_description') || '';
        return NextResponse.redirect(
          new URL(`/home/integrations?error=oauth_error&error_description=${encodeURIComponent(errorDescription || 'Authentication failed')}`, request.url)
        );
      }

      // Otherwise, redirect to sign in
      return NextResponse.redirect(
        new URL(`/auth/sign-in?next=/home/integrations&error=session_expired`, request.url)
      );
    }

    // Handle OAuth errors (but user is authenticated)
    if (error) {
      const errorDescription = searchParams.get('error_description') || '';
      console.error('[Salesforce Callback] Salesforce OAuth error:', error, errorDescription);

      // Map common Salesforce errors to user-friendly messages
      let errorMessage = 'oauth_error';
      if (error === 'access_denied') {
        errorMessage = 'access_denied';
      } else if (error === 'redirect_uri_mismatch') {
        errorMessage = 'redirect_uri_mismatch';
      } else if (errorDescription.includes('invalid_client_id')) {
        errorMessage = 'invalid_client_id';
      }

      // Create redirect response that preserves session
      const redirectResponse = NextResponse.redirect(
        new URL(`/home/integrations?error=${errorMessage}&error_description=${encodeURIComponent(errorDescription)}`, request.url)
      );

      // Copy session cookies from request to response to maintain auth
      const cookies = request.cookies.getAll();
      cookies.forEach(cookie => {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });
      });

      return redirectResponse;
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/home/integrations?error=missing_parameters', request.url)
      );
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString());
    } catch {
      return NextResponse.redirect(
        new URL('/home/integrations?error=invalid_state', request.url)
      );
    }

    // Exchange code for tokens
    const clientId = process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    const redirectUri = process.env.SALESFORCE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(
        new URL('/home/integrations?error=configuration_error', request.url)
      );
    }

    const tokenUrl = 'https://login.salesforce.com/services/oauth2/token';
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
      console.error('Salesforce token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(
        new URL('/home/integrations?error=token_exchange_failed', request.url)
      );
    }

    const tokenData = await tokenResponse.json();

    // Store integration in database
    const integrationData = {
      id: crypto.randomUUID(),
      business_id: stateData.business_id,
      name: 'Salesforce',
      description: 'Import contacts from Salesforce to create targeted campaigns.',
      type: 'crm',
      status: 'active', // Valid values: 'active' | 'inactive' | 'error'
      config: {
        instanceUrl: tokenData.instance_url,
        apiVersion: 'v61.0',
      },
      credentials: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenType: tokenData.token_type,
      },
      last_sync_at: new Date().toISOString(),
      created_by: stateData.user_id,
      updated_by: stateData.user_id,
    };

    const { error: insertError } = await supabase
      .from('integrations')
      .insert(integrationData);

    if (insertError) {
      console.error('Failed to save Salesforce integration:', insertError);
      console.error('Integration data:', JSON.stringify(integrationData, null, 2));

      // Pass more detailed error info
      const errorDetail = encodeURIComponent(insertError.message || 'Unknown database error');
      return NextResponse.redirect(
        new URL(`/home/integrations?error=save_failed&error_description=${errorDetail}`, request.url)
      );
    }

    // Create success redirect response that preserves session
    const successResponse = NextResponse.redirect(
      new URL('/home/integrations?success=salesforce_connected', request.url)
    );

    // Copy session cookies from request to response to maintain auth
    const cookies = request.cookies.getAll();
    cookies.forEach(cookie => {
      successResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    });

    return successResponse;
  } catch (error) {
    console.error('Salesforce callback error:', error);

    // Create error redirect response that preserves session
    const errorResponse = NextResponse.redirect(
      new URL('/home/integrations?error=internal_error', request.url)
    );

    // Copy session cookies from request to response to maintain auth
    const cookies = request.cookies.getAll();
    cookies.forEach(cookie => {
      errorResponse.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    });

    return errorResponse;
  }
}