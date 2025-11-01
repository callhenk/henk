'use client';

import { useEffect, useState } from 'react';

import { HelpCircle, RotateCcw, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
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

// Default settings from ElevenLabs API
const DEFAULT_SETTINGS: VoiceSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
  optimize_streaming_latency: 0,
};

export function AgentVoiceSettings({
  agent,
  onSaveField,
  onVoiceUpdate,
}: AgentVoiceSettingsProps) {
  const defaultSettings = DEFAULT_SETTINGS;

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    ...defaultSettings,
    ...(agent.voice_settings || {}),
  });

  const [originalSettings, setOriginalSettings] = useState<VoiceSettings>({
    ...defaultSettings,
    ...(agent.voice_settings || {}),
  });

  const [isSaving, setIsSaving] = useState(false);

  // Check if settings have changed
  const hasChanges = JSON.stringify(voiceSettings) !== JSON.stringify(originalSettings);

  // Update local state when agent changes
  useEffect(() => {
    const newSettings = {
      ...DEFAULT_SETTINGS,
      ...(agent.voice_settings || {}),
    };
    setVoiceSettings(newSettings);
    setOriginalSettings(newSettings);
  }, [agent.voice_settings]);

  const handleSettingChange = (key: keyof VoiceSettings, value: number | boolean) => {
    setVoiceSettings({
      ...voiceSettings,
      [key]: value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (agent?.elevenlabs_agent_id && onVoiceUpdate) {
        // For ElevenLabs conversational AI agents, use the update handler
        // This will trigger the confirmation dialog
        // Don't update originalSettings here - wait for agent.voice_settings to change
        onVoiceUpdate('voice_settings', voiceSettings);
      } else {
        // For regular agents, save directly
        await onSaveField('voice_settings', voiceSettings);
        setOriginalSettings(voiceSettings);
        toast.success('Voice settings saved successfully');
      }
    } catch (error) {
      console.error('Error updating voice settings:', error);
      toast.error('Failed to update voice settings');
    } finally {
      // Keep isSaving true for ElevenLabs agents until confirmation dialog is handled
      if (!agent?.elevenlabs_agent_id) {
        setIsSaving(false);
      }
    }
  };

  // Reset isSaving when settings change or when voiceSettings is reset (dialog cancelled)
  useEffect(() => {
    if (isSaving && agent?.elevenlabs_agent_id) {
      // Check if the settings in the database match what we're trying to save
      const currentSettings = {
        ...DEFAULT_SETTINGS,
        ...(agent.voice_settings || {}),
      };

      // Reset if settings were saved successfully
      if (JSON.stringify(currentSettings) === JSON.stringify(voiceSettings)) {
        setIsSaving(false);
      }

      // Reset if we're back to original (dialog was cancelled and parent reset the state)
      if (JSON.stringify(voiceSettings) === JSON.stringify(originalSettings)) {
        setIsSaving(false);
      }
    }
  }, [agent.voice_settings, voiceSettings, originalSettings, isSaving, agent?.elevenlabs_agent_id]);

  const handleReset = () => {
    setVoiceSettings(originalSettings);
    toast.info('Changes discarded');
  };

  // Convert latency optimization (0-4) to use_speaker_boost
  // Higher latency optimization = lower use_speaker_boost
  // These functions are reserved for future use when we add more advanced latency controls
  const _latencyToBoost = (latency: number): boolean => {
    return latency < 2;
  };

  const _boostToLatency = (boost: boolean): number => {
    return boost ? 0 : 4;
  };

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>
              Fine-tune voice characteristics for optimal performance
            </CardDescription>
          </div>
          {hasChanges && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
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
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">Optimize Streaming Latency</p>
                      <p>
                        Controls the trade-off between response speed and audio quality. Higher
                        values prioritize faster audio generation at the expense of quality.
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>0 (Best Quality):</strong> Highest quality, slower response</li>
                        <li>• <strong>1-2:</strong> Balanced quality and speed</li>
                        <li>• <strong>3-4 (Lowest Latency):</strong> Fastest response, lower quality</li>
                      </ul>
                      <p className="text-xs italic">
                        Recommended: Start at 0 for best quality, increase if calls feel laggy
                      </p>
                    </div>
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
            disabled={isSaving}
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
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">Stability</p>
                      <p>
                        Controls the consistency and predictability of the voice. This determines
                        how much the AI will vary its tone, pitch, and delivery.
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Low (0-0.3):</strong> Very expressive, emotional, variable</li>
                        <li>• <strong>Medium (0.4-0.6):</strong> Balanced, natural conversation</li>
                        <li>• <strong>High (0.7-1.0):</strong> Consistent, professional, monotone</li>
                      </ul>
                      <p className="text-xs italic">
                        Recommended: 0.4-0.6 for natural conversations, 0.7+ for formal calls
                      </p>
                    </div>
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
            disabled={isSaving}
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
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">Similarity</p>
                      <p>
                        Controls how closely the AI voice matches the original voice sample. Higher
                        values make the voice sound more like the reference voice.
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>Low (0-0.5):</strong> More generic, less like original voice</li>
                        <li>• <strong>Medium (0.6-0.8):</strong> Good balance of clarity and similarity</li>
                        <li>• <strong>High (0.9-1.0):</strong> Maximum similarity, may cause artifacts</li>
                      </ul>
                      <p className="text-xs italic">
                        Recommended: 0.7-0.8 for optimal clarity without audio artifacts
                      </p>
                    </div>
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
            disabled={isSaving}
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
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">Style Exaggeration</p>
                      <p>
                        Enhances and amplifies the unique speaking style and characteristics of the
                        original voice. Use sparingly as it may increase latency.
                      </p>
                      <ul className="space-y-1 text-xs">
                        <li>• <strong>0 (None):</strong> Natural voice without style enhancement</li>
                        <li>• <strong>0.1-0.3:</strong> Subtle style enhancement</li>
                        <li>• <strong>0.4-1.0:</strong> Strong style exaggeration, higher latency</li>
                      </ul>
                      <p className="text-xs italic">
                        Recommended: Keep at 0 for most use cases, use only for dramatic effect
                      </p>
                    </div>
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
            disabled={isSaving}
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
                    <TooltipContent className="max-w-sm">
                      <div className="space-y-2">
                        <p className="font-semibold">Speaker Boost</p>
                        <p>
                          Applies additional processing to make the voice sound more like the original
                          speaker. Requires more computational power, which adds slight latency.
                        </p>
                        <ul className="space-y-1 text-xs">
                          <li>• <strong>Enabled:</strong> Better voice similarity, +50-100ms latency</li>
                          <li>• <strong>Disabled:</strong> Faster response, less accurate to original voice</li>
                        </ul>
                        <p className="text-xs italic">
                          Recommended: Keep enabled unless call speed is more important than voice accuracy
                        </p>
                      </div>
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
              disabled={isSaving}
              onClick={() =>
                handleSettingChange('use_speaker_boost', !(voiceSettings.use_speaker_boost ?? true))
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                isSaving ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              } ${
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

        {hasChanges && (
          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs text-amber-900 dark:text-amber-100">
              <strong>Unsaved Changes:</strong> You have unsaved changes. Click &ldquo;Save Changes&rdquo; to
              apply them.
            </p>
          </div>
        )}

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
