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

/**
 * Rate limiting configuration for prompt generation endpoint
 * More generous than agent creation since it's less resource-intensive
 */
export const PROMPT_GENERATION_RATE_LIMITS = {
  /** Max prompt generations per IP per minute */
  PER_MINUTE: 10,
  /** Max prompt generations per IP per hour */
  PER_HOUR: 50,
  /** Global max prompt generations per minute (prevents DDoS) */
  GLOBAL_PER_MINUTE: 200,
} as const;
