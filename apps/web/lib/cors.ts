/**
 * CORS Configuration
 * Provides secure CORS headers for API routes
 */

const allowedOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'https://app.callhenk.com',
  'https://callhenk.com',
  // Add production domains here
].filter(Boolean);

/**
 * Get CORS headers based on the request origin
 * Only allows requests from whitelisted origins
 */
export function getCorsHeaders(origin: string | null) {
  // Check if origin is in the allowed list
  const isAllowed = origin && allowedOrigins.includes(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed
      ? origin
      : (allowedOrigins[0] ?? 'http://localhost:3000'),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, x-captcha-token, x-correlation-id',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Creates a CORS response for preflight OPTIONS requests
 */
export function createCorsPreflightResponse(origin: string | null) {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}
