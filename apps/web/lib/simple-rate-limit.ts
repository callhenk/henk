/**
 * Simple in-memory rate limiter for demo endpoints
 * Resets on server restart, which is acceptable for demo use cases
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class SimpleRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof window === 'undefined') {
      // Only run cleanup on server
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Check if a request is allowed based on rate limits
   * @param identifier - Unique identifier (e.g., IP address)
   * @param limit - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns { allowed: boolean, remaining: number, resetAt: number }
   */
  check(
    identifier: string,
    limit: number,
    windowMs: number,
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const record = this.store.get(identifier);

    // No record or expired - create new one
    if (!record || now > record.resetAt) {
      const resetAt = now + windowMs;
      this.store.set(identifier, { count: 1, resetAt });
      return { allowed: true, remaining: limit - 1, resetAt };
    }

    // Record exists and not expired
    if (record.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: record.resetAt };
    }

    // Increment count
    record.count += 1;
    this.store.set(identifier, record);

    return {
      allowed: true,
      remaining: limit - record.count,
      resetAt: record.resetAt,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  /**
   * Get current count for an identifier
   */
  getCount(identifier: string): number {
    const record = this.store.get(identifier);
    if (!record || Date.now() > record.resetAt) {
      return 0;
    }
    return record.count;
  }

  /**
   * Cleanup method to be called on shutdown
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new SimpleRateLimiter();

export default rateLimiter;

/**
 * Helper function to get client IP from request
 */
export function getClientIp(request: Request): string {
  // Try various headers in order of preference
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'cf-connecting-ip', // Cloudflare
    'x-vercel-forwarded-for', // Vercel
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can be a comma-separated list
      const ip = value.split(',')[0]?.trim();
      if (ip) return ip;
    }
  }

  // Fallback
  return 'unknown';
}
