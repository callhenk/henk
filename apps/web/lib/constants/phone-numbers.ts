/**
 * Phone number constants for the application
 *
 * IMPORTANT: These should be moved to environment variables in production
 */

/**
 * Default phone number ID used for agent assignments
 * This represents the primary outbound caller ID for ElevenLabs agents
 *
 * @deprecated Move to environment variable: NEXT_PUBLIC_DEFAULT_PHONE_NUMBER_ID
 */
export const DEFAULT_PHONE_NUMBER_ID = process.env.NEXT_PUBLIC_DEFAULT_PHONE_NUMBER_ID || 'phnum_5301k1ge5gxvejpvsdvw7ey565pc';

/**
 * Test phone numbers for development/testing
 *
 * @deprecated Move to environment variable: NEXT_PUBLIC_TEST_PHONE_NUMBERS
 */
export const TEST_PHONE_NUMBERS = (process.env.NEXT_PUBLIC_TEST_PHONE_NUMBERS?.split(',') || [
  '+12025550125',
  '+14155550142'
]).filter(Boolean);

/**
 * E.164 phone number validation regex
 * Matches: +[country code][number] where total length is 7-15 digits after +
 * Examples: +14155551234, +442071234567
 */
export const E164_REGEX = /^\+[1-9]\d{6,14}$/;

/**
 * Maximum length for phone number display (for masking)
 */
export const PHONE_DISPLAY_VISIBLE_DIGITS = 2;
