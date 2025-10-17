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

    // Handle OAuth errors
    if (error) {
      const errorDescription = searchParams.get('error_description') || '';
      console.error('Salesforce OAuth error:', error, errorDescription);

      // Map common Salesforce errors to user-friendly messages
      let errorMessage = 'oauth_error';
      if (error === 'access_denied') {
        errorMessage = 'access_denied';
      } else if (error === 'redirect_uri_mismatch') {
        errorMessage = 'redirect_uri_mismatch';
      } else if (errorDescription.includes('invalid_client_id')) {
        errorMessage = 'invalid_client_id';
      }

      return NextResponse.redirect(
        new URL(`/home/integrations?error=${errorMessage}&error_description=${encodeURIComponent(errorDescription)}`, request.url)
      );
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

    const supabase = getSupabaseServerClient();

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
      status: 'connected',
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
      return NextResponse.redirect(
        new URL('/home/integrations?error=save_failed', request.url)
      );
    }

    return NextResponse.redirect(
      new URL('/home/integrations?success=salesforce_connected', request.url)
    );
  } catch (error) {
    console.error('Salesforce callback error:', error);
    return NextResponse.redirect(
      new URL('/home/integrations?error=internal_error', request.url)
    );
  }
}