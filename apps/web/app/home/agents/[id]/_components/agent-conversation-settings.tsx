'use client';

import { useEffect, useState } from 'react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

interface AgentConversationSettingsProps {
  agent: {
    id: string;
    retention_period_days: number | null;
    turn_timeout: number | null;
    eagerness: string | null;
    silence_end_call_timeout: number | null;
    max_conversation_duration: number | null;
  };
  onSaveField: (fieldName: string, value: unknown) => void;
}

type FieldName =
  | 'retention_period_days'
  | 'turn_timeout'
  | 'eagerness'
  | 'silence_end_call_timeout'
  | 'max_conversation_duration';

interface FieldState<T = string | number> {
  value: T;
  originalValue: T;
  hasChanges: boolean;
}

const DEFAULT_VALUES = {
  retention_period_days: 90,
  turn_timeout: 7,
  eagerness: 'normal' as const,
  silence_end_call_timeout: -1,
  max_conversation_duration: 600,
};

export function AgentConversationSettings({
  agent,
  onSaveField,
}: AgentConversationSettingsProps) {
  // Initialize state with original values
  const [retentionPeriod, setRetentionPeriod] = useState<FieldState<string>>({
    value: (agent.retention_period_days ?? DEFAULT_VALUES.retention_period_days).toString(),
    originalValue: (agent.retention_period_days ?? DEFAULT_VALUES.retention_period_days).toString(),
    hasChanges: false,
  });

  const [turnTimeout, setTurnTimeout] = useState<FieldState<string>>({
    value: (agent.turn_timeout ?? DEFAULT_VALUES.turn_timeout).toString(),
    originalValue: (agent.turn_timeout ?? DEFAULT_VALUES.turn_timeout).toString(),
    hasChanges: false,
  });

  const [eagerness, setEagerness] = useState<FieldState<string>>({
    value: agent.eagerness || DEFAULT_VALUES.eagerness,
    originalValue: agent.eagerness || DEFAULT_VALUES.eagerness,
    hasChanges: false,
  });

  const [silenceTimeout, setSilenceTimeout] = useState<FieldState<string>>({
    value: (agent.silence_end_call_timeout ?? DEFAULT_VALUES.silence_end_call_timeout).toString(),
    originalValue: (agent.silence_end_call_timeout ?? DEFAULT_VALUES.silence_end_call_timeout).toString(),
    hasChanges: false,
  });

  const [maxDuration, setMaxDuration] = useState<FieldState<string>>({
    value: (agent.max_conversation_duration ?? DEFAULT_VALUES.max_conversation_duration).toString(),
    originalValue: (agent.max_conversation_duration ?? DEFAULT_VALUES.max_conversation_duration).toString(),
    hasChanges: false,
  });

  // Update hasChanges when values change
  useEffect(() => {
    setRetentionPeriod((prev) => ({
      ...prev,
      hasChanges: prev.value !== prev.originalValue,
    }));
  }, [retentionPeriod.value]);

  useEffect(() => {
    setTurnTimeout((prev) => ({
      ...prev,
      hasChanges: prev.value !== prev.originalValue,
    }));
  }, [turnTimeout.value]);

  useEffect(() => {
    setEagerness((prev) => ({
      ...prev,
      hasChanges: prev.value !== prev.originalValue,
    }));
  }, [eagerness.value]);

  useEffect(() => {
    setSilenceTimeout((prev) => ({
      ...prev,
      hasChanges: prev.value !== prev.originalValue,
    }));
  }, [silenceTimeout.value]);

  useEffect(() => {
    setMaxDuration((prev) => ({
      ...prev,
      hasChanges: prev.value !== prev.originalValue,
    }));
  }, [maxDuration.value]);

  // Save handlers
  const handleSave = (fieldName: FieldName, value: string, setState: React.Dispatch<React.SetStateAction<FieldState<string>>>) => {
    const numValue = parseInt(value, 10);
    if (isNaN(numValue)) return;

    onSaveField(fieldName, numValue);
    setState((prev) => ({
      ...prev,
      originalValue: value,
      hasChanges: false,
    }));
  };

  const handleEagernessChange = (value: string) => {
    setEagerness((prev) => ({ ...prev, value }));
  };

  const handleEagernessSave = () => {
    onSaveField('eagerness', eagerness.value);
    setEagerness((prev) => ({
      ...prev,
      originalValue: prev.value,
      hasChanges: false,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Privacy Settings */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <p className="text-muted-foreground text-sm">
            Manage data retention and privacy preferences
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention-period">
              Conversations Retention Period
            </Label>
            <p className="text-muted-foreground text-xs">
              Number of days to retain conversation data before automatic
              deletion
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="retention-period"
                type="number"
                value={retentionPeriod.value}
                onChange={(e) =>
                  setRetentionPeriod((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                className="max-w-[200px]"
                placeholder="90"
                min="1"
              />
              <span className="text-muted-foreground text-sm">days</span>
              {retentionPeriod.hasChanges && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleSave('retention_period_days', retentionPeriod.value, setRetentionPeriod)
                  }
                  size="sm"
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <p className="text-muted-foreground text-sm">
            Fine-tune conversation behavior and timing (synced with ElevenLabs)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Turn Timeout */}
          <div className="space-y-2">
            <Label htmlFor="turn-timeout">Turn timeout</Label>
            <p className="text-muted-foreground text-xs">
              Maximum seconds of silence before agent responds (1-30 seconds, or
              -1 for no timeout)
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="turn-timeout"
                type="number"
                value={turnTimeout.value}
                onChange={(e) =>
                  setTurnTimeout((prev) => ({ ...prev, value: e.target.value }))
                }
                className="max-w-[200px]"
                placeholder="7"
                min="-1"
                max="30"
              />
              <span className="text-muted-foreground text-sm">seconds</span>
              {turnTimeout.hasChanges && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleSave('turn_timeout', turnTimeout.value, setTurnTimeout)
                  }
                  size="sm"
                >
                  Save
                </Button>
              )}
            </div>
          </div>

          {/* Eagerness */}
          <div className="space-y-2">
            <Label htmlFor="eagerness">Turn eagerness</Label>
            <p className="text-muted-foreground text-xs">
              How quickly the agent responds: Eager (fast), Normal (balanced),
              Patient (waits longer)
            </p>
            <div className="flex items-center gap-2">
              <Select value={eagerness.value} onValueChange={handleEagernessChange}>
                <SelectTrigger id="eagerness" className="max-w-[200px]">
                  <SelectValue placeholder="Select eagerness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eager">Eager (Fast)</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="patient">Patient (Slow)</SelectItem>
                </SelectContent>
              </Select>
              {eagerness.hasChanges && (
                <Button
                  variant="outline"
                  onClick={handleEagernessSave}
                  size="sm"
                >
                  Save
                </Button>
              )}
            </div>
          </div>

          {/* Silence End Call Timeout */}
          <div className="space-y-2">
            <Label htmlFor="silence-timeout">Silence end call timeout</Label>
            <p className="text-muted-foreground text-xs">
              Maximum seconds of silence before call ends (-1 for no cutoff)
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="silence-timeout"
                type="number"
                value={silenceTimeout.value}
                onChange={(e) =>
                  setSilenceTimeout((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                className="max-w-[200px]"
                placeholder="-1"
                min="-1"
              />
              <span className="text-muted-foreground text-sm">seconds</span>
              {silenceTimeout.hasChanges && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleSave('silence_end_call_timeout', silenceTimeout.value, setSilenceTimeout)
                  }
                  size="sm"
                >
                  Save
                </Button>
              )}
            </div>
          </div>

          {/* Max Conversation Duration */}
          <div className="space-y-2">
            <Label htmlFor="max-duration">Max conversation duration</Label>
            <p className="text-muted-foreground text-xs">
              Maximum call length in seconds
            </p>
            <div className="flex items-center gap-2">
              <Input
                id="max-duration"
                type="number"
                value={maxDuration.value}
                onChange={(e) =>
                  setMaxDuration((prev) => ({ ...prev, value: e.target.value }))
                }
                className="max-w-[200px]"
                placeholder="600"
                min="1"
              />
              <span className="text-muted-foreground text-sm">seconds</span>
              {maxDuration.hasChanges && (
                <Button
                  variant="outline"
                  onClick={() =>
                    handleSave('max_conversation_duration', maxDuration.value, setMaxDuration)
                  }
                  size="sm"
                >
                  Save
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
