'use client';

import { useState } from 'react';

import { Phone, PlayCircle, SkipForward, Voicemail } from 'lucide-react';

import { Card, CardContent, CardHeader } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Switch } from '@kit/ui/switch';

interface AgentToolsProps {
  agent: {
    id: string;
    name: string;
  };
  onSaveField: (fieldName: string, value: string) => Promise<void>;
}

interface ToolConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

export function AgentTools({ agent, onSaveField }: AgentToolsProps) {
  // Initialize tools state from agent configuration
  // TODO: These should be stored in the database
  const [tools, setTools] = useState<ToolConfig[]>([
    {
      id: 'end_call',
      label: 'End call',
      description: 'Gives agent the ability to end the call with the user.',
      icon: Phone,
      enabled: false,
    },
    {
      id: 'skip_turn',
      label: 'Skip turn',
      description:
        'Agent will skip its turn if user explicitly indicates they need a moment.',
      icon: SkipForward,
      enabled: false,
    },
    {
      id: 'play_keypad_tone',
      label: 'Play keypad touch tone',
      description:
        'Gives agent the ability to play keypad touch tones during a phone call.',
      icon: PlayCircle,
      enabled: false,
    },
    {
      id: 'voicemail_detection',
      label: 'Voicemail detection',
      description:
        'Allows agent to detect voicemail systems and optionally leave a message.',
      icon: Voicemail,
      enabled: false,
    },
  ]);

  const handleToggleTool = async (toolId: string) => {
    const updatedTools = tools.map((tool) =>
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool,
    );
    setTools(updatedTools);

    // TODO: Save to database
    // const enabledTools = updatedTools
    //   .filter((t) => t.enabled)
    //   .map((t) => t.id);
    // await onSaveField('enabled_tools', JSON.stringify(enabledTools));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Tools</h2>
        <p className="text-muted-foreground text-sm">
          Let the agent perform specific actions.
        </p>
      </div>

      <Card className="glass-panel">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="flex items-center justify-between border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Icon className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <Label
                        htmlFor={tool.id}
                        className="cursor-pointer text-base font-medium"
                      >
                        {tool.label}
                      </Label>
                      <p className="text-muted-foreground text-sm">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={tool.id}
                    checked={tool.enabled}
                    onCheckedChange={() => handleToggleTool(tool.id)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Tools Section - Disabled for now */}
      {/* <Card className="glass-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Custom tools</h3>
              <p className="text-muted-foreground text-sm">
                Provide the agent with custom tools it can use to help users.
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add tool
            </Button>
          </div>
        </CardHeader>
      </Card> */}
    </div>
  );
}
