'use client';

import { useState } from 'react';

import { Mic, Play, Volume2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Button } from '@kit/ui/button';
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
    <div className="mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50">
          <Volume2 className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Voice & Tone
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Choose and customize your agent&apos;s voice to create engaging,
          personalized conversations.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column - Voice Selection */}
        <div className="space-y-6">
          {/* Voice Selection */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <Volume2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    AI Voice Selection
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose from available AI voices for your agent
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
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
                <SelectTrigger className="border-gray-200 focus:border-purple-500 focus:ring-purple-500">
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
          </div>

          {/* Voice Preview */}
          {agent.voice_id && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <Play className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Voice Preview
                    </h3>
                    <p className="text-sm text-gray-600">
                      Listen to your selected voice
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 shadow-sm">
                      <Volume2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Cached Sample Audio
                      </p>
                      <p className="text-xs text-gray-600">
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
                    className="flex items-center gap-2 border-green-200 px-4 hover:bg-green-50"
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

                <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                    <span>Cached sample available</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Voice Type */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Volume2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Voice Type
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose between AI-generated or custom voice
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
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
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
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
          </div>
        </div>

        {/* Right Column - Custom Voice Recording */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <Mic className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Record Custom Voice
                  </h3>
                  <p className="text-sm text-gray-600">
                    Record a 30-second sample for voice cloning
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
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
                <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <p className="text-xs text-green-700">
                    ✓ Recording saved. You can preview or record again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
