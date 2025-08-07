'use client';

import { useState } from 'react';

import { Mic, Play, Volume2 } from 'lucide-react';
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

interface AgentVoiceProps {
  agent: {
    id: string;
    voice_id?: string | null;
    voice_type?: string | null;
    elevenlabs_agent_id?: string | null;
  };
  voices: Array<{
    voice_id: string;
    name: string;
  }>;
  onSaveField: (fieldName: string, value: string) => Promise<void>;
  onVoiceUpdate: (fieldName: string, value: string) => void;
}

const voiceTypes = [
  { value: 'ai_generated', label: 'AI Generated' },
  { value: 'custom', label: 'Custom Voice' },
];

export function AgentVoice({
  agent,
  voices,
  onSaveField,
  onVoiceUpdate,
}: AgentVoiceProps) {
  const supabase = useSupabase();
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

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

  // Custom voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setRecordedAudio(blob);
        stream.getTracks().forEach((track) => track.stop());
        toast.success('Recording completed!');
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      const timer = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 30) {
            stopRecording();
            clearInterval(timer);
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

      toast.info('Recording started... Speak clearly for 30 seconds');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error(
        'Failed to start recording. Please check microphone permissions.',
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
    setRecordingTime(0);
  };

  const playRecording = () => {
    if (!recordedAudio) {
      toast.error('No recording available to play');
      return;
    }

    const audio = new Audio(URL.createObjectURL(recordedAudio));
    setIsPlayingRecording(true);

    audio.onended = () => setIsPlayingRecording(false);
    audio.onerror = () => {
      setIsPlayingRecording(false);
      toast.error('Failed to play recording.');
    };

    audio.play().catch((error) => {
      console.error('Failed to play recording:', error);
      setIsPlayingRecording(false);
      toast.error('Failed to play recording.');
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Voice Configuration
        </CardTitle>
        <CardDescription>
          Customize how your agent sounds and speaks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">AI Voice</label>
          <div className="flex items-center gap-2">
            <Select
              value={agent.voice_id || ''}
              onValueChange={(voiceId) => {
                // Show confirmation for voice updates
                if (agent?.elevenlabs_agent_id) {
                  onVoiceUpdate('voice_id', voiceId);
                } else {
                  // If no ElevenLabs agent, update directly
                  onSaveField('voice_id', voiceId);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a voice" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-muted-foreground text-xs">
            Choose from available AI voices for your agent
          </p>
        </div>

        {/* Voice Preview */}
        {agent.voice_id && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Voice Preview</label>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-muted-foreground text-xs">
                  Using Cached Sample
                </span>
              </div>
            </div>

            <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 shadow-sm">
                    <Volume2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Cached Sample Audio
                    </p>
                    <p className="text-muted-foreground text-xs">
                      &ldquo;Hello, this is a voice preview.&rdquo;
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPlayingPreview}
                  onClick={async () => {
                    try {
                      const voiceId = agent.voice_id;

                      if (!voiceId) {
                        toast.error('No voice selected for preview');
                        return;
                      }

                      // First try to get a cached sample
                      const cachedUrl = await getCachedVoiceSample(voiceId);

                      if (cachedUrl) {
                        // Play cached sample
                        const audio = new Audio(cachedUrl);
                        setIsPlayingPreview(true);

                        audio.onended = () => setIsPlayingPreview(false);
                        audio.onerror = () => {
                          setIsPlayingPreview(false);
                          toast.error('Failed to play voice preview.');
                        };

                        await audio.play();
                        toast.success('Playing cached voice preview...');
                        return;
                      }

                      // If no cached sample exists, show message instead of generating
                      toast.info(
                        'No cached sample available. Please generate a voice sample first.',
                      );
                    } catch (error) {
                      console.error('Voice preview error:', error);
                      toast.error('Failed to play voice preview.');
                    }
                  }}
                  className="flex items-center gap-2 px-4"
                >
                  {isPlayingPreview ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                      <span>Playing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Play Sample</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                  <span>Cached sample available</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Voice Type</label>
          <Select
            value={agent.voice_type || 'ai_generated'}
            onValueChange={async (voiceType) => {
              try {
                await onSaveField('voice_type', voiceType);
                toast.success('Voice type updated successfully');
              } catch {
                toast.error('Failed to update voice type');
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select voice type" />
            </SelectTrigger>
            <SelectContent>
              {voiceTypes.map((voice) => (
                <SelectItem key={voice.value} value={voice.value}>
                  {voice.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Record Custom Voice */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Record Custom Voice</label>
            <p className="text-muted-foreground mt-1 text-sm">
              Record a 30-second sample for voice cloning
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isPlayingRecording}
            >
              {isRecording ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  Recording... ({30 - recordingTime}s)
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  {recordedAudio ? 'Record Again' : 'Start Recording'}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={playRecording}
              disabled={!recordedAudio || isPlayingRecording || isRecording}
            >
              {isPlayingRecording ? (
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
          {recordedAudio && (
            <div className="mt-2 text-xs text-green-600">
              ✓ Recording saved. You can preview or record again.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
