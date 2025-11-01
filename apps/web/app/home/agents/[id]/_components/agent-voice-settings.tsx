'use client';

import { useEffect, useState } from 'react';

import { HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Slider } from '@kit/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';

interface VoiceSettings {
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  optimize_streaming_latency?: number;
}

interface AgentVoiceSettingsProps {
  agent: {
    id: string;
    voice_settings?: VoiceSettings | null;
    elevenlabs_agent_id?: string | null;
  };
  onSaveField: (fieldName: string, value: unknown) => Promise<void>;
  onVoiceUpdate?: (fieldName: string, value: unknown) => void;
}

export function AgentVoiceSettings({
  agent,
  onSaveField,
  onVoiceUpdate,
}: AgentVoiceSettingsProps) {
  // Initialize with defaults from ElevenLabs API
  const defaultSettings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true,
    optimize_streaming_latency: 0,
  };

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    ...defaultSettings,
    ...(agent.voice_settings || {}),
  });

  // Update local state when agent changes
  useEffect(() => {
    setVoiceSettings({
      ...defaultSettings,
      ...(agent.voice_settings || {}),
    });
  }, [agent.voice_settings]);

  const handleSettingChange = async (key: keyof VoiceSettings, value: number | boolean) => {
    const updatedSettings = {
      ...voiceSettings,
      [key]: value,
    };

    setVoiceSettings(updatedSettings);

    try {
      if (agent?.elevenlabs_agent_id && onVoiceUpdate) {
        // For ElevenLabs conversational AI agents, use the update handler
        onVoiceUpdate('voice_settings', updatedSettings);
      } else {
        // For regular agents, save directly
        await onSaveField('voice_settings', updatedSettings);
      }
    } catch (error) {
      console.error('Error updating voice settings:', error);
      toast.error('Failed to update voice settings');
    }
  };

  // Convert latency optimization (0-4) to use_speaker_boost
  // Higher latency optimization = lower use_speaker_boost
  const latencyToBoost = (latency: number): boolean => {
    return latency < 2;
  };

  const boostToLatency = (boost: boolean): number => {
    return boost ? 0 : 4;
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle>Voice Settings</CardTitle>
        <CardDescription>
          Fine-tune voice characteristics for optimal performance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Optimize Streaming Latency */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="latency">Optimize streaming latency</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="text-muted-foreground h-4 w-4 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Configure latency optimizations for speech generation. Latency can be
                      optimized at the cost of quality. Higher values reduce latency but may
                      affect voice quality.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-muted-foreground text-sm">
              {voiceSettings.optimize_streaming_latency || 0}
            </span>
          </div>
          <Slider
            id="latency"
            min={0}
            max={4}
            step={1}
            value={[voiceSettings.optimize_streaming_latency || 0]}
            onValueChange={([value]) => handleSettingChange('optimize_streaming_latency', value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Best Quality</span>
            <span>Lowest Latency</span>
          </div>
        </div>

        {/* Stability */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="stability">Stability</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="text-muted-foreground h-4 w-4 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Higher values make speech more consistent, but it can also make it sound
                      monotone. Lower values make speech more expressive with broader emotional
                      range. Recommended: 0.4 - 0.6
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-muted-foreground text-sm">
              {(voiceSettings.stability || 0.5).toFixed(2)}
            </span>
          </div>
          <Slider
            id="stability"
            min={0}
            max={1}
            step={0.01}
            value={[voiceSettings.stability || 0.5]}
            onValueChange={([value]) => handleSettingChange('stability', value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>More Variable</span>
            <span>More Stable</span>
          </div>
        </div>

        {/* Similarity Boost */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="similarity">Similarity</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="text-muted-foreground h-4 w-4 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Higher values boost the overall clarity and consistency of the voice. Very
                      high values may lead to artifacts. Adjusting this value to find the right
                      balance is recommended. Recommended: 0.7 - 0.8
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-muted-foreground text-sm">
              {(voiceSettings.similarity_boost || 0.75).toFixed(2)}
            </span>
          </div>
          <Slider
            id="similarity"
            min={0}
            max={1}
            step={0.01}
            value={[voiceSettings.similarity_boost || 0.75]}
            onValueChange={([value]) => handleSettingChange('similarity_boost', value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {/* Style Exaggeration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label htmlFor="style">Style Exaggeration</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="text-muted-foreground h-4 w-4 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Amplifies the style of the original speaker. Higher values may increase
                      latency. Recommended to keep at 0 unless specific stylization is needed.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-muted-foreground text-sm">
              {(voiceSettings.style || 0).toFixed(2)}
            </span>
          </div>
          <Slider
            id="style"
            min={0}
            max={1}
            step={0.01}
            value={[voiceSettings.style || 0]}
            onValueChange={([value]) => handleSettingChange('style', value)}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>None</span>
            <span>Maximum</span>
          </div>
        </div>

        {/* Speaker Boost Toggle */}
        <div className="bg-muted/50 rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="speaker-boost" className="font-medium">
                  Speaker Boost
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="text-muted-foreground h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>
                        Boosts similarity to the original speaker, but requires slightly higher
                        computational load which increases latency. Recommended to keep enabled
                        unless latency is critical.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-muted-foreground text-xs">
                Enhances voice similarity at the cost of latency
              </p>
            </div>
            <button
              id="speaker-boost"
              type="button"
              role="switch"
              aria-checked={voiceSettings.use_speaker_boost ?? true}
              onClick={() =>
                handleSettingChange('use_speaker_boost', !(voiceSettings.use_speaker_boost ?? true))
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                voiceSettings.use_speaker_boost ?? true ? 'bg-primary' : 'bg-muted'
              }`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  voiceSettings.use_speaker_boost ?? true ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3">
          <p className="text-xs text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Start with default values (Stability: 0.5, Similarity: 0.75) and
            adjust based on your needs. Higher stability for consistent tone, lower for more
            emotion.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
