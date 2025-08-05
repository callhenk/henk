import { useQuery } from '@tanstack/react-query';

export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
}

export interface VoiceTestRequest {
  voice_id: string;
  sample_text: string;
}

export interface VoiceTestResponse {
  testId: string;
  voice_id: string;
  sample_text: string;
  audio_url: string;
  duration_seconds: number;
  file_size_bytes: number;
  voice_name: string;
  status: string;
  timestamp: string;
}

export interface GenerateSpeechRequest {
  text: string;
  voice_id: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
  };
}

export interface GenerateSpeechResponse {
  audio_url: string;
  file_size_bytes: number;
  duration_seconds: number;
  voice_name: string;
}

export function useVoices() {
  return useQuery({
    queryKey: ['voices'],
    queryFn: async (): Promise<Voice[]> => {
      const response = await fetch('/api/voice/voices');

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch voices');
      }

      return result.data || [];
    },
  });
}

// Note: These functions are now handled by useVoiceTestMutation and useGenerateSpeechMutation
// in the use-voice-mutations.ts file instead of useQuery
