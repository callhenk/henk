'use client';

import { useState } from 'react';

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

export function AgentConversationSettings({
  agent,
  onSaveField,
}: AgentConversationSettingsProps) {
  const [retentionPeriod, setRetentionPeriod] = useState(
    agent.retention_period_days?.toString() || '90',
  );
  const [turnTimeout, setTurnTimeout] = useState(
    agent.turn_timeout?.toString() || '7',
  );
  const [eagerness, setEagerness] = useState(agent.eagerness || 'normal');
  const [silenceTimeout, setSilenceTimeout] = useState(
    agent.silence_end_call_timeout?.toString() || '-1',
  );
  const [maxDuration, setMaxDuration] = useState(
    agent.max_conversation_duration?.toString() || '600',
  );

  const handleRetentionPeriodChange = () => {
    const value = parseInt(retentionPeriod, 10);
    if (!isNaN(value)) {
      onSaveField('retention_period_days', value);
    }
  };

  const handleTurnTimeoutChange = () => {
    const value = parseInt(turnTimeout, 10);
    if (!isNaN(value)) {
      onSaveField('turn_timeout', value);
    }
  };

  const handleEagernessChange = (value: string) => {
    setEagerness(value);
    onSaveField('eagerness', value);
  };

  const handleSilenceTimeoutChange = () => {
    const value = parseInt(silenceTimeout, 10);
    if (!isNaN(value)) {
      onSaveField('silence_end_call_timeout', value);
    }
  };

  const handleMaxDurationChange = () => {
    const value = parseInt(maxDuration, 10);
    if (!isNaN(value)) {
      onSaveField('max_conversation_duration', value);
    }
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
            <div className="flex gap-2">
              <Input
                id="retention-period"
                type="number"
                value={retentionPeriod}
                onChange={(e) => setRetentionPeriod(e.target.value)}
                className="max-w-[200px]"
                placeholder="90"
              />
              <Button
                variant="outline"
                onClick={handleRetentionPeriodChange}
                size="sm"
              >
                Save
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">days</p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <p className="text-muted-foreground text-sm">
            Fine-tune conversation behavior and timing
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Turn Timeout */}
          <div className="space-y-2">
            <Label htmlFor="turn-timeout">Turn timeout</Label>
            <p className="text-muted-foreground text-xs">
              The maximum number of seconds since the user last spoke. If
              exceeded, the agent will respond and force a turn. A value of -1
              means the agent will never timeout and always wait for a response
              from the user.
            </p>
            <div className="flex gap-2">
              <Input
                id="turn-timeout"
                type="number"
                value={turnTimeout}
                onChange={(e) => setTurnTimeout(e.target.value)}
                className="max-w-[200px]"
                placeholder="7"
              />
              <Button
                variant="outline"
                onClick={handleTurnTimeoutChange}
                size="sm"
              >
                Save
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">seconds</p>
          </div>

          {/* Eagerness */}
          <div className="space-y-2">
            <Label htmlFor="eagerness">Eagerness</Label>
            <p className="text-muted-foreground text-xs">
              Controls how eager the agent is to respond. High eagerness means
              the agent responds quickly, while low eagerness means the agent
              waits longer to ensure the user has finished speaking.
            </p>
            <Select value={eagerness} onValueChange={handleEagernessChange}>
              <SelectTrigger id="eagerness" className="max-w-[200px]">
                <SelectValue placeholder="Select eagerness" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Silence End Call Timeout */}
          <div className="space-y-2">
            <Label htmlFor="silence-timeout">Silence end call timeout</Label>
            <p className="text-muted-foreground text-xs">
              The maximum number of seconds since the user last spoke. If
              exceeded, the call will terminate. A value of -1 means there is no
              fixed cutoff.
            </p>
            <div className="flex gap-2">
              <Input
                id="silence-timeout"
                type="number"
                value={silenceTimeout}
                onChange={(e) => setSilenceTimeout(e.target.value)}
                className="max-w-[200px]"
                placeholder="-1"
              />
              <Button
                variant="outline"
                onClick={handleSilenceTimeoutChange}
                size="sm"
              >
                Save
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">seconds</p>
          </div>

          {/* Max Conversation Duration */}
          <div className="space-y-2">
            <Label htmlFor="max-duration">Max conversation duration</Label>
            <p className="text-muted-foreground text-xs">
              The maximum number of seconds that a conversation can last.
            </p>
            <div className="flex gap-2">
              <Input
                id="max-duration"
                type="number"
                value={maxDuration}
                onChange={(e) => setMaxDuration(e.target.value)}
                className="max-w-[200px]"
                placeholder="600"
              />
              <Button
                variant="outline"
                onClick={handleMaxDurationChange}
                size="sm"
              >
                Save
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">seconds</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
