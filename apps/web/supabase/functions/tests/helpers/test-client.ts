/**
 * Test client for edge functions
 * Provides helpers for testing edge functions locally
 */

export interface TestConfig {
  functionsUrl: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export interface FunctionResponse<T = unknown> {
  data: T | null;
  error: Error | null;
  status: number;
  headers: Headers;
}

/**
 * Default test configuration for local development
 */
export const DEFAULT_TEST_CONFIG: TestConfig = {
  functionsUrl: 'http://localhost:54321/functions/v1',
  anonKey: Deno.env.get('SUPABASE_ANON_KEY') || 'test-anon-key',
  serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
};

/**
 * Test client for calling edge functions
 */
export class EdgeFunctionTestClient {
  constructor(private config: TestConfig = DEFAULT_TEST_CONFIG) {}

  /**
   * Call an edge function
   */
  async invoke<T = unknown>(
    functionName: string,
    options: {
      body?: Record<string, unknown>;
      headers?: Record<string, string>;
      useServiceRole?: boolean;
    } = {},
  ): Promise<FunctionResponse<T>> {
    const { body, headers = {}, useServiceRole = false } = options;

    const authKey = useServiceRole
      ? this.config.serviceRoleKey
      : this.config.anonKey;

    try {
      const response = await fetch(
        `${this.config.functionsUrl}/${functionName}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authKey}`,
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
        },
      );

      let data: T | null = null;
      const contentType = response.headers.get('content-type');

      if (contentType?.includes('application/json')) {
        data = (await response.json()) as T;
      } else {
        // Consume the body to prevent resource leak
        await response.body?.cancel();
      }

      return {
        data,
        error: null,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 0,
        headers: new Headers(),
      };
    }
  }

  /**
   * Helper to assert successful response
   */
  assertSuccess<T>(response: FunctionResponse<T>): asserts response is {
    data: T;
    error: null;
    status: number;
    headers: Headers;
  } {
    if (response.error) {
      throw new Error(`Request failed: ${response.error.message}`);
    }
    if (response.status >= 400) {
      throw new Error(
        `Request failed with status ${response.status}: ${JSON.stringify(response.data)}`,
      );
    }
  }

  /**
   * Helper to assert error response
   */
  assertError(response: FunctionResponse<unknown>): void {
    if (!response.error && response.status < 400) {
      throw new Error('Expected error response but got success');
    }
  }
}

/**
 * Create a test client instance
 */
export function createTestClient(
  config?: Partial<TestConfig>,
): EdgeFunctionTestClient {
  return new EdgeFunctionTestClient({
    ...DEFAULT_TEST_CONFIG,
    ...config,
  });
}
