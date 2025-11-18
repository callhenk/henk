// Token manager: Handle OAuth token refresh for Salesforce
import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

import type {
  Integration,
  RefreshedCredentials,
  TokenRefreshResponse,
} from './types.ts';

/**
 * Refreshes an expired Salesforce access token
 * @param integration Integration record with credentials
 * @param supabase Supabase client for updating credentials
 * @returns Refreshed credentials
 */
export async function refreshToken(
  integration: Integration,
  supabase: SupabaseClient,
): Promise<RefreshedCredentials> {
  const { credentials, config } = integration;

  // Get client credentials (prefer database, fallback to env vars)
  const clientId = credentials.clientId || Deno.env.get('SALESFORCE_CLIENT_ID');
  const clientSecret =
    credentials.clientSecret || Deno.env.get('SALESFORCE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing client credentials for token refresh');
  }

  console.log(
    `[token-manager] refreshing access token integration_id=${integration.id} business_id=${integration.business_id}`,
  );

  // Determine token URL based on environment
  const environment = config.env || 'production';
  const loginUrl =
    environment === 'sandbox'
      ? 'https://test.salesforce.com'
      : 'https://login.salesforce.com';
  const tokenUrl = `${loginUrl}/services/oauth2/token`;

  const tokenParams = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: credentials.refreshToken,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[token-manager] refresh failed integration_id=${integration.id} status=${response.status}`,
        errorText,
      );
      throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
    }

    const tokenData: TokenRefreshResponse = await response.json();

    // Update integration with new tokens
    const updatedCredentials = {
      ...credentials,
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      // Salesforce may return a new refresh token
      refreshToken: tokenData.refresh_token || credentials.refreshToken,
    };

    // Save updated credentials to database
    const { error: updateError } = await supabase
      .from('integrations')
      .update({
        credentials: updatedCredentials,
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    if (updateError) {
      console.error(
        `[token-manager] failed to update credentials integration_id=${integration.id}`,
        updateError.message,
      );
      throw new Error(`Failed to update credentials: ${updateError.message}`);
    }

    console.log(
      `[token-manager] token refreshed successfully integration_id=${integration.id} business_id=${integration.business_id}`,
    );

    return {
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      refreshToken: tokenData.refresh_token || credentials.refreshToken,
    };
  } catch (error) {
    console.error(
      `[token-manager] refresh exception integration_id=${integration.id}`,
      error instanceof Error ? error.message : 'Unknown error',
    );
    throw error;
  }
}

/**
 * Validates if an access token is still valid
 * Note: Salesforce tokens don't have an expires_at field,
 * so we rely on 401 responses to trigger refresh
 * @param credentials Integration credentials
 * @returns true (tokens are assumed valid until proven otherwise)
 */
export function isTokenValid(credentials: Integration['credentials']): boolean {
  // Salesforce doesn't provide token expiration info in the OAuth response
  // We assume the token is valid until we get a 401
  return !!(credentials.accessToken && credentials.refreshToken);
}

/**
 * Handles Salesforce API errors and determines if token refresh is needed
 * @param response Fetch response from Salesforce API
 * @returns true if token needs refresh, false otherwise
 */
export function needsTokenRefresh(response: Response): boolean {
  // 401 Unauthorized means the token is expired or invalid
  return response.status === 401;
}
