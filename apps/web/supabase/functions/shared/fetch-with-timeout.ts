// Fetch with timeout utility
// Prevents hanging requests by enforcing a timeout

/**
 * Fetch with timeout
 * @param url URL to fetch
 * @param options Fetch options
 * @param timeoutMs Timeout in milliseconds (default: 30000ms = 30s)
 * @returns Fetch response
 * @throws Error if timeout is reached
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms: ${url}`);
    }
    throw error;
  }
}

/**
 * Default timeout values for different operations
 */
export const TIMEOUTS = {
  // Short timeout for quick API calls
  SHORT: 10000, // 10 seconds
  // Medium timeout for most API calls
  MEDIUM: 30000, // 30 seconds
  // Long timeout for heavy operations (file uploads, large queries)
  LONG: 60000, // 60 seconds
  // Extra long timeout for very heavy operations
  EXTRA_LONG: 120000, // 2 minutes
};
