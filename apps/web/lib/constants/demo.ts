/**
 * Constants for public demo functionality
 */

/**
 * Rate limiting configuration for public demo endpoints
 */
export const DEMO_RATE_LIMITS = {
  /** Max agents created per IP per hour */
  PER_HOUR: 5,
  /** Max agents created per IP per day */
  PER_DAY: 20,
  /** Global max agents per hour (prevents DDoS) */
  GLOBAL_PER_HOUR: 100,
} as const;
