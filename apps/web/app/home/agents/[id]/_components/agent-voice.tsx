'use client';

import { useEffect, useState } from 'react';

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
  // { value: 'custom', label: 'Custom Voice' }, // Temporarily disabled
];

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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>AI Voice Selection</CardTitle>
              <CardDescription>
                Choose from available AI voices for your agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <p className="text-muted-foreground text-xs">
                Your selection is saved to the agent and used across campaigns.
              </p>
            </CardContent>
          </Card>

          {agent.voice_id && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle>Voice Preview</CardTitle>
                <CardDescription>Listen to your selected voice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg border p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                        <Volume2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
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
                      disabled={isPlayingPreview || isLoadingSample}
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
                            toast.info(
                              'No cached sample. Generating sample...',
                            );
                            const resp = await fetch(
                              '/api/elevenlabs/test-voice',
                              {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ voice_id: voiceId }),
                              },
                            );
                            if (!resp.ok) {
                              const msg = await resp.text();
                              throw new Error(
                                msg || 'Failed to generate sample',
                              );
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
                          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                          <span>Loading...</span>
                        </>
                      ) : isPlayingPreview ? (
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
                      <div className="bg-muted-foreground h-1.5 w-1.5 rounded-full"></div>
                      <span>Cached sample available</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Voice Type</CardTitle>
              <CardDescription>
                Select your agent's voice type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
              {/* <p className="text-muted-foreground text-xs">
                Custom voices require a valid 30s sample recording.
              </p> */}
            </CardContent>
          </Card>
        </div>

        {/* Custom Voice Recording - temporarily disabled */}
        {/* <div className="lg:col-span-1">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Record Custom Voice</CardTitle>
              <CardDescription>
                Record a 30-second sample for voice cloning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full"
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
                  className="w-full"
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
                      Preview Recording
                    </>
                  )}
                </Button>
              </div>
              {recordedAudio && (
                <div className="rounded-lg border p-3">
                  <p className="text-xs">
                    ✓ Recording saved. You can preview or record again.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div> */}
      </div>
    </div>
  );
}
