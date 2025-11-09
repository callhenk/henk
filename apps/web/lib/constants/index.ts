/**
 * Centralized exports for application constants
 */

// Phone number constants
export {
  DEFAULT_PHONE_NUMBER_ID,
  TEST_PHONE_NUMBERS,
  E164_REGEX,
  PHONE_DISPLAY_VISIBLE_DIGITS,
} from './phone-numbers';

// Time constants
export {
  MILLISECONDS_PER_SECOND,
  SECONDS_PER_MINUTE,
  MINUTES_PER_HOUR,
  HOURS_PER_DAY,
  MILLISECONDS_PER_MINUTE,
  MILLISECONDS_PER_HOUR,
  MILLISECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_DAY,
  AUTOSAVE_DELAY_MS,
  SUCCESS_MESSAGE_DURATION_MS,
  DEFAULT_POLLING_INTERVAL_MS,
} from './time';

// Demo constants
export { DEMO_RATE_LIMITS, PROMPT_GENERATION_RATE_LIMITS } from './demo';

// Voice constants
export { DEFAULT_VOICES, getDefaultVoiceId, type VoiceGender } from './voices';
