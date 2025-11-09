/**
 * Default ElevenLabs voice IDs for demo agents
 * These are pre-made voices available in ElevenLabs
 */

export const DEFAULT_VOICES = {
  // Feminine voices
  feminine: '56bWURjYFHyYyVf490Dp', // Warm, friendly female voice
  // Masculine voices
  masculine: 'XrExE9yKIg1WjnnlVkGX', // Adam - confident, friendly male voice
} as const;

export type VoiceGender = 'feminine' | 'masculine';

/**
 * Get the default voice ID for a given gender
 */
export function getDefaultVoiceId(gender: VoiceGender): string {
  return DEFAULT_VOICES[gender];
}
