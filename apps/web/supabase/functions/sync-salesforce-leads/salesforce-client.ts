// Salesforce API client with retry logic and error handling
import { needsTokenRefresh, refreshToken } from './token-manager.ts';
import type { Integration, SalesforceQueryResponse } from './types.ts';

/**
 * Salesforce API client
 */
export class SalesforceClient {
  private integration: Integration;
  private credentials: Integration['credentials'];
  private supabase: any;

  constructor(integration: Integration, supabase: any) {
    this.integration = integration;
    this.credentials = integration.credentials;
    this.supabase = supabase;
  }

  /**
   * Executes a SOQL query against Salesforce
   * @param soql SOQL query string
   * @returns Query response with records
   */
  async query(soql: string): Promise<SalesforceQueryResponse> {
    const { config } = this.integration;
    const queryUrl = `${config.instanceUrl}/services/data/${config.apiVersion}/query?q=${encodeURIComponent(soql)}`;

    console.log(
      `[sf-client] executing SOQL query integration_id=${this.integration.id} queryLength=${soql.length}`,
    );

    try {
      let response = await this.fetchWithRetry(queryUrl, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      // Handle token refresh if needed
      if (needsTokenRefresh(response)) {
        console.log(
          `[sf-client] access token expired, refreshing integration_id=${this.integration.id}`,
        );

        const refreshedCredentials = await refreshToken(
          this.integration,
          this.supabase,
        );
        this.credentials = {
          ...this.credentials,
          ...refreshedCredentials,
        };

        // Retry with new token
        response = await this.fetchWithRetry(queryUrl, {
          method: 'GET',
          headers: this.getHeaders(),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Salesforce query failed: ${response.status} ${errorText}`,
        );
      }

      const data: SalesforceQueryResponse = await response.json();

      console.log(
        `[sf-client] query successful integration_id=${this.integration.id} totalSize=${data.totalSize} recordsReturned=${data.records.length}`,
      );

      return data;
    } catch (error) {
      console.error(
        `[sf-client] query exception integration_id=${this.integration.id}`,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  /**
   * Fetches data with automatic retry logic
   * @param url URL to fetch
   * @param options Fetch options
   * @param maxRetries Maximum number of retries
   * @returns Fetch response
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 3,
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Handle rate limiting (429)
        if (response.status === 429) {
          const retryAfter =
            parseInt(response.headers.get('Retry-After') || '60') * 1000;

          console.log(
            `[sf-client] rate limit hit integration_id=${this.integration.id} retryAfter=${retryAfter}ms attempt=${attempt + 1}`,
          );

          await this.sleep(retryAfter);
          continue;
        }

        // Handle server errors (500-599) with exponential backoff
        if (response.status >= 500 && response.status < 600) {
          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 1000;

            console.log(
              `[sf-client] server error, retrying integration_id=${this.integration.id} status=${response.status} delay=${delay}ms attempt=${attempt + 1}`,
            );

            await this.sleep(delay);
            continue;
          }
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;

          console.log(
            `[sf-client] network error, retrying integration_id=${this.integration.id} error=${lastError.message} delay=${delay}ms attempt=${attempt + 1}`,
          );

          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error('Failed after retries');
  }

  /**
   * Constructs authorization headers for Salesforce API
   * @returns Headers object
   */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `${this.credentials.tokenType} ${this.credentials.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Sleep utility for retry delays
   * @param ms Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
