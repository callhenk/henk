/**
 * Default ElevenLabs voice IDs for demo agents
 * These are pre-made voices available in ElevenLabs
 */

export const DEFAULT_VOICES = {
  // Feminine voices - using ElevenLabs premade voices
  feminine: '21m00Tcm4TlvDq8ikWAM', // Rachel - warm, friendly female voice
  // Masculine voices - using ElevenLabs premade voices
  masculine: 'pNInz6obpgDQGcFmaJgB', // Adam - confident, friendly male voice
} as const;

export type VoiceGender = 'feminine' | 'masculine';

/**
 * Get the default voice ID for a given gender
 */
export function getDefaultVoiceId(gender: VoiceGender): string {
  return DEFAULT_VOICES[gender];
}
