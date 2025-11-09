'use client';

import { useEffect, useState } from 'react';

import { Mic, Play } from 'lucide-react';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import { AgentVoiceSettings } from './agent-voice-settings';

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  optimize_streaming_latency?: number;
}

interface AgentVoiceProps {
  agent: {
    id: string;
    voice_id?: string | null;
    voice_type?: string | null;
    voice_settings?: VoiceSettings | null;
    elevenlabs_agent_id?: string | null;
  };
  voices: Array<{
    voice_id: string;
    name: string;
  }>;
  onSaveField: (fieldName: string, value: string | unknown) => Promise<void>;
  onVoiceUpdate: (fieldName: string, value: string | unknown) => void;
}

// Voice type selection removed - always uses AI Generated
// const voiceTypes = [
//   { value: 'ai_generated', label: 'AI Generated' },
//   // { value: 'custom', label: 'Custom Voice' }, // Temporarily disabled
// ];

export function AgentVoice({
  agent,
  voices,
  onSaveField,
  onVoiceUpdate,
}: AgentVoiceProps) {
  const supabase = useSupabase();
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const [lastPlayedTime, setLastPlayedTime] = useState<number>(0);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(
    null,
  );

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio]);

  // Function to get cached voice sample URL
  const getCachedVoiceSample = async (voiceId: string) => {
    try {
      // Try to get a cached sample from the audio bucket
      const { data: signedUrl, error } = await supabase.storage
        .from('audio')
        .createSignedUrl(`samples/${voiceId}_sample.mp3`, 3600);

      if (signedUrl && !error) {
        return signedUrl.signedUrl;
      }

      // If no cached sample exists, return null (don't log error for missing files)
      return null;
    } catch (error) {
      // If there's an actual error (not just missing file), log it
      console.error('Error getting cached sample:', error);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Selection with Inline Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>AI Voice Selection</CardTitle>
              <CardDescription>
                Choose from available voices and preview instantly
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Selection Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1 space-y-2">
              <Select
                value={agent.voice_id || ''}
                onValueChange={(voiceId) => {
                  if (agent?.elevenlabs_agent_id) {
                    onVoiceUpdate('voice_id', voiceId);
                  } else {
                    onSaveField('voice_id', voiceId);
                  }
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.length === 0 ? (
                    <SelectItem value="no-voices" disabled>
                      No voices available
                    </SelectItem>
                  ) : (
                    voices.map((voice) => (
                      <SelectItem key={voice.voice_id} value={voice.voice_id}>
                        {voice.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="default"
              size="lg"
              className="h-12 sm:w-40"
              disabled={!agent.voice_id || isPlayingPreview || isLoadingSample}
              onClick={async () => {
                // Prevent spam - enforce 2 second cooldown
                const now = Date.now();
                if (now - lastPlayedTime < 2000) {
                  toast.error('Please wait before playing again');
                  return;
                }

                // Stop any currently playing audio
                if (currentAudio) {
                  currentAudio.pause();
                  currentAudio.currentTime = 0;
                  setCurrentAudio(null);
                }

                setIsLoadingSample(true);
                setIsPlayingPreview(false);

                try {
                  const voiceId = agent.voice_id;
                  if (!voiceId) {
                    toast.error('No voice selected for preview');
                    return;
                  }

                  let cachedUrl = await getCachedVoiceSample(voiceId);
                  if (!cachedUrl) {
                    toast.info('No cached sample. Generating sample...');
                    const resp = await fetch('/api/elevenlabs/test-voice', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ voice_id: voiceId }),
                    });
                    if (!resp.ok) {
                      const msg = await resp.text();
                      throw new Error(msg || 'Failed to generate sample');
                    }
                    const result = await resp.json();
                    cachedUrl =
                      result?.data?.audio_url_signed ||
                      result?.data?.audio_url ||
                      null;
                    if (!cachedUrl) {
                      throw new Error('No audio URL returned');
                    }
                  }

                  const audio = new Audio(cachedUrl);
                  setCurrentAudio(audio);
                  setIsLoadingSample(false);
                  setIsPlayingPreview(true);
                  setLastPlayedTime(now);

                  audio.onended = () => {
                    setIsPlayingPreview(false);
                    setCurrentAudio(null);
                  };
                  audio.onerror = () => {
                    setIsPlayingPreview(false);
                    setCurrentAudio(null);
                    toast.error('Failed to play voice preview.');
                  };

                  await audio.play();
                  toast.success('Playing voice preview...');
                } catch (error) {
                  console.error('Voice preview error:', error);
                  setIsLoadingSample(false);
                  setIsPlayingPreview(false);
                  setCurrentAudio(null);
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : 'Failed to play voice preview.',
                  );
                }
              }}
            >
              {isLoadingSample ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  Loading...
                </>
              ) : isPlayingPreview ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  Playing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Preview
                </>
              )}
            </Button>
          </div>

          {/* Error or Help Text */}
          {voices.length === 0 ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-destructive text-xs font-medium">
                ⚠️ No voices found. Please check your ElevenLabs API
                configuration.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              Your selection is saved to the agent and used across campaigns.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Voice Settings Controls */}
      <AgentVoiceSettings
        agent={agent}
        onSaveField={onSaveField}
        onVoiceUpdate={onVoiceUpdate}
      />
    </div>
  );
}
