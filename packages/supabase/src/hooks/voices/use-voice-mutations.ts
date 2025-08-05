import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  GenerateSpeechRequest,
  GenerateSpeechResponse,
  VoiceTestRequest,
  VoiceTestResponse,
} from './use-voices';

export function useVoiceTestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: VoiceTestRequest,
    ): Promise<VoiceTestResponse> => {
      const response = await fetch('/api/voice/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to test voice: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to test voice');
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate voice-related queries
      queryClient.invalidateQueries({ queryKey: ['voices'] });
    },
  });
}

export function useGenerateSpeechMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: GenerateSpeechRequest,
    ): Promise<GenerateSpeechResponse> => {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate speech: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate speech');
      }

      return result.data;
    },
    onSuccess: () => {
      // Invalidate voice-related queries
      queryClient.invalidateQueries({ queryKey: ['voices'] });
    },
  });
}
