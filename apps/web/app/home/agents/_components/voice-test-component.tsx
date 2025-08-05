'use client';

import { useState } from 'react';

import { toast } from 'sonner';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useVoiceTestMutation } from '@kit/supabase/hooks/voices/use-voice-mutations';
import { useVoices } from '@kit/supabase/hooks/voices/use-voices';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';

export function VoiceTestComponent() {
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [testText, setTestText] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const supabase = useSupabase();
  const {
    data: voices,
    isLoading: voicesLoading,
    error: voicesError,
  } = useVoices();
  const voiceTestMutation = useVoiceTestMutation();

  const handleTestVoice = async () => {
    if (!selectedVoice || !testText.trim()) {
      toast.error('Please select a voice and enter test text.');
      return;
    }

    // Debug logging
    console.log('Testing voice with:', {
      voice_id: selectedVoice,
      sample_text: testText,
    });

    try {
      const result = await voiceTestMutation.mutateAsync({
        voice_id: selectedVoice,
        sample_text: testText,
      });

      console.log('Generated audio URL:', result.audio_url);

      // Extract the file path from the public URL
      const url = new URL(result.audio_url);
      const pathMatch = url.pathname.match(
        /\/storage\/v1\/object\/public\/audio\/(.+)/,
      );

      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        console.log('Extracted file path:', filePath);

        // Get authenticated URL - the file should be accessible since it's in the user's folder
        const { data: signedUrl, error: signedUrlError } =
          await supabase.storage.from('audio').createSignedUrl(filePath, 3600); // 1 hour expiry

        if (signedUrlError) {
          console.error('Signed URL error:', signedUrlError);
          toast.error('Failed to generate authenticated audio URL');
        } else if (signedUrl) {
          console.log('Authenticated URL:', signedUrl.signedUrl);
          setAudioUrl(signedUrl.signedUrl);
          toast.success(`Generated audio for voice: ${result.voice_name}`);
        } else {
          console.error('Failed to create signed URL');
          toast.error('Failed to generate authenticated audio URL');
        }
      } else {
        console.error(
          'Could not extract file path from URL:',
          result.audio_url,
        );
        toast.error('Invalid audio URL format');
      }
    } catch (error) {
      console.error('Voice test error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handlePlayAudio = async () => {
    if (!audioUrl) return;

    try {
      setIsPlaying(true);

      // Create a new Audio object
      const audio = new Audio();

      // Set up event listeners
      audio.onloadstart = () => {
        console.log('Audio loading started');
      };

      audio.oncanplay = () => {
        console.log('Audio can play');
      };

      audio.onended = () => {
        console.log('Audio playback ended');
        setIsPlaying(false);
      };

      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        setIsPlaying(false);
        toast.error('Failed to play the generated audio. Please try again.');
      };

      // Set the audio source
      audio.src = audioUrl;

      // Try to play the audio
      await audio.play();

      toast.success('Playing generated audio...');
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsPlaying(false);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          toast.error(
            'Audio playback blocked. Please click the play button again.',
          );
        } else {
          toast.error(`Failed to play audio: ${error.message}`);
        }
      } else {
        toast.error('Failed to play the generated audio.');
      }
    }
  };

  if (voicesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Voice Testing</CardTitle>
          <CardDescription>Test AI voice generation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            Error loading voices: {voicesError.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Voice Testing</CardTitle>
        <CardDescription>
          Test AI voice generation with your own text
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        <div className="space-y-2">
          <Label htmlFor="voice-select">Select Voice</Label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger id="voice-select">
              <SelectValue placeholder="Choose a voice..." />
            </SelectTrigger>
            <SelectContent>
              {voicesLoading ? (
                <SelectItem value="loading" disabled>
                  Loading voices...
                </SelectItem>
              ) : (
                voices?.map((voice) => (
                  <SelectItem key={voice.voice_id} value={voice.voice_id}>
                    {voice.name} - {voice.description}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Test Text Input */}
        <div className="space-y-2">
          <Label htmlFor="test-text">Test Text</Label>
          <Textarea
            id="test-text"
            placeholder="Enter text to test the voice..."
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={4}
          />
        </div>

        {/* Test Button */}
        <Button
          onClick={handleTestVoice}
          disabled={
            !selectedVoice ||
            !testText.trim() ||
            voiceTestMutation.isPending ||
            voicesLoading
          }
          className="w-full"
        >
          {voiceTestMutation.isPending ? 'Testing Voice...' : 'Test Voice'}
        </Button>

        {/* Audio Player */}
        {audioUrl && (
          <div className="space-y-2">
            <Label>Generated Audio</Label>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePlayAudio}
                disabled={isPlaying}
                variant="outline"
                size="sm"
              >
                {isPlaying ? 'Playing...' : 'Play Audio'}
              </Button>
              <span className="text-muted-foreground text-sm">
                Click to play the generated audio
              </span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {voiceTestMutation.error && (
          <div className="text-sm text-red-500">
            Error: {voiceTestMutation.error.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
