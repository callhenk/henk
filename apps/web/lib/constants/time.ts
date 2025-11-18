/**
 * Time-related constants for consistent calculations across the application
 */

/**
 * Time conversion constants
 */
export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const MINUTES_PER_HOUR = 60;
export const HOURS_PER_DAY = 24;

/**
 * Derived time constants
 */
export const MILLISECONDS_PER_MINUTE =
  MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;
export const MILLISECONDS_PER_HOUR = MILLISECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const MILLISECONDS_PER_DAY = MILLISECONDS_PER_HOUR * HOURS_PER_DAY;

export const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * MINUTES_PER_HOUR;
export const SECONDS_PER_DAY = SECONDS_PER_HOUR * HOURS_PER_DAY;

/**
 * Default autosave delay in milliseconds
 */
export const AUTOSAVE_DELAY_MS = 500;

/**
 * Default success message display duration in milliseconds
 */
export const SUCCESS_MESSAGE_DURATION_MS = 3000;

/**
 * Default polling interval for real-time updates in milliseconds
 */
export const DEFAULT_POLLING_INTERVAL_MS = 5000;
