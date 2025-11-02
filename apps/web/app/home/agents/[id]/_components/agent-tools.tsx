'use client';

import { useState } from 'react';

import { ArrowRightLeft, Check, Loader2, Phone, PlayCircle, Settings, SkipForward, Voicemail, X } from 'lucide-react';
import { toast } from 'sonner';

import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Label } from '@kit/ui/label';
import { Switch } from '@kit/ui/switch';

import { TransferRulesDialog } from './transfer-rules-dialog';

// Field name constant
const ENABLED_TOOLS_FIELD = 'enabled_tools';

// Tool ID constants
const TOOL_IDS = {
  END_CALL: 'end_call',
  SKIP_TURN: 'skip_turn',
  TRANSFER_TO_AGENT: 'transfer_to_agent',
  PLAY_KEYPAD_TONE: 'play_keypad_tone',
  VOICEMAIL_DETECTION: 'voicemail_detection',
} as const;

interface AgentToolsProps {
  agent: {
    id: string;
    name: string;
    business_id: string;
    enabled_tools?: unknown;
    transfer_rules?: unknown;
  };
  onSaveField: (fieldName: string, value: unknown) => Promise<void>;
}

interface ToolConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
}

export function AgentTools({ agent, onSaveField }: AgentToolsProps) {
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);

  // Fetch all agents for the transfer rules dialog
  const { data: allAgents = [] } = useAgents();

  // Initialize tools configuration
  const getInitialTools = (): ToolConfig[] => {
    const enabledToolIds = Array.isArray(agent.enabled_tools)
      ? agent.enabled_tools
      : [];

    return [
      {
        id: TOOL_IDS.END_CALL,
        label: 'End call',
        description: 'Gives agent the ability to end the call with the user.',
        icon: Phone,
        enabled: enabledToolIds.includes(TOOL_IDS.END_CALL),
      },
      {
        id: TOOL_IDS.SKIP_TURN,
        label: 'Skip turn',
        description:
          'Agent will skip its turn if user explicitly indicates they need a moment.',
        icon: SkipForward,
        enabled: enabledToolIds.includes(TOOL_IDS.SKIP_TURN),
      },
      {
        id: TOOL_IDS.TRANSFER_TO_AGENT,
        label: 'Transfer to agent',
        description:
          'Gives agent the ability to transfer the call to another agent based on specific conditions.',
        icon: ArrowRightLeft,
        enabled: enabledToolIds.includes(TOOL_IDS.TRANSFER_TO_AGENT),
      },
      {
        id: TOOL_IDS.PLAY_KEYPAD_TONE,
        label: 'Play keypad touch tone',
        description:
          'Gives agent the ability to play keypad touch tones during a phone call.',
        icon: PlayCircle,
        enabled: enabledToolIds.includes(TOOL_IDS.PLAY_KEYPAD_TONE),
      },
      {
        id: TOOL_IDS.VOICEMAIL_DETECTION,
        label: 'Voicemail detection',
        description:
          'Allows agent to detect voicemail systems and optionally leave a message.',
        icon: Voicemail,
        enabled: enabledToolIds.includes(TOOL_IDS.VOICEMAIL_DETECTION),
      },
    ];
  };

  const [tools, setTools] = useState<ToolConfig[]>(getInitialTools);
  const [originalTools, setOriginalTools] = useState<ToolConfig[]>(getInitialTools);
  const [isSaving, setIsSaving] = useState(false);

  // Check if there are unsaved changes
  const hasChanges = tools.some(
    (tool, index) => tool.enabled !== originalTools[index]?.enabled,
  );

  const handleToggleTool = (toolId: string) => {
    const updatedTools = tools.map((tool) =>
      tool.id === toolId ? { ...tool, enabled: !tool.enabled } : tool,
    );
    setTools(updatedTools);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save enabled tools to database
      const enabledTools = tools
        .filter((t) => t.enabled)
        .map((t) => t.id);

      await onSaveField(ENABLED_TOOLS_FIELD, enabledTools);

      // Update original tools to match current state
      setOriginalTools([...tools]);

      toast.success('Tool settings saved successfully');
    } catch (error) {
      console.error('Failed to save tool settings:', error);
      toast.error('Failed to save tool settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset tools to original state
    setTools([...originalTools]);
    toast.info('Changes discarded');
  };

  const handleSaveTransferRules = async (transferRules: {
    transfers: Array<{
      agent_id: string;
      condition: string;
      delay_ms?: number;
      transfer_message?: string;
      enable_transferred_agent_first_message?: boolean;
    }>;
  }) => {
    console.log('Saving transfer rules:', JSON.stringify(transferRules, null, 2));
    console.log('Agent ID:', agent.id);
    try {
      await onSaveField('transfer_rules', transferRules);
      console.log('Transfer rules saved successfully');
    } catch (error) {
      console.error('Error saving transfer rules:', error);
      throw error; // Re-throw to let the dialog handle it
    }
  };

  // Get transfer rules from agent
  const transferRules =
    typeof agent.transfer_rules === 'object' && agent.transfer_rules !== null
      ? (agent.transfer_rules as {
          transfers: Array<{
            agent_id: string;
            condition: string;
            delay_ms?: number;
            transfer_message?: string;
            enable_transferred_agent_first_message?: boolean;
          }>;
        })
      : { transfers: [] };

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
              const isTransferTool = tool.id === TOOL_IDS.TRANSFER_TO_AGENT;

              return (
                <div
                  key={tool.id}
                  className="flex items-center justify-between border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      <Icon className="text-muted-foreground h-5 w-5" />
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <Label
                        htmlFor={tool.id}
                        className="cursor-pointer text-base font-medium"
                      >
                        {tool.label}
                      </Label>
                      <p className="text-muted-foreground text-sm">
                        {tool.description}
                      </p>
                      {isTransferTool && tool.enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsTransferDialogOpen(true)}
                          className="mt-2"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Configure Transfer Rules
                        </Button>
                      )}
                    </div>
                  </div>
                  <Switch
                    id={tool.id}
                    checked={tool.enabled}
                    onCheckedChange={() => handleToggleTool(tool.id)}
                    disabled={isSaving}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>

        {/* Save/Cancel Actions */}
        {hasChanges && (
          <CardContent className="border-t bg-muted/50 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-sm">
                You have unsaved changes
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
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

      {/* Transfer Rules Dialog */}
      <TransferRulesDialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        currentAgentId={agent.id}
        availableAgents={
          allAgents?.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })) || []
        }
        transferRules={transferRules}
        onSave={handleSaveTransferRules}
      />
    </div>
  );
}
