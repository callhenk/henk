'use client';

import { useState } from 'react';

import { Check, Loader2, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Switch } from '@kit/ui/switch';
import { Textarea } from '@kit/ui/textarea';

interface TransferRule {
  agent_id: string;
  condition: string;
  delay_ms?: number;
  transfer_message?: string;
  enable_transferred_agent_first_message?: boolean;
}

interface TransferRulesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAgentId: string;
  availableAgents: Array<{ id: string; name: string }>;
  transferRules: { transfers: TransferRule[] };
  onSave: (transferRules: { transfers: TransferRule[] }) => Promise<void>;
}

export function TransferRulesDialog({
  open,
  onOpenChange,
  currentAgentId,
  availableAgents,
  transferRules,
  onSave,
}: TransferRulesDialogProps) {
  const [rules, setRules] = useState<TransferRule[]>(
    transferRules.transfers || [],
  );
  const [isSaving, setIsSaving] = useState(false);

  // Filter out the current agent from available agents
  const filteredAgents = availableAgents.filter(
    (agent) => agent.id !== currentAgentId,
  );

  const handleAddRule = () => {
    if (filteredAgents.length === 0) {
      toast.error('No other agents available to transfer to');
      return;
    }

    const newRule: TransferRule = {
      agent_id: filteredAgents[0]?.id || '',
      condition: '',
      delay_ms: 0,
      transfer_message: '',
      enable_transferred_agent_first_message: true,
    };

    setRules([...rules, newRule]);
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleUpdateRule = (
    index: number,
    field: keyof TransferRule,
    value: string | number | boolean,
  ) => {
    const updatedRules = [...rules];
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: value,
    };
    setRules(updatedRules);
  };

  const handleSave = async () => {
    // Validate rules
    const invalidRules = rules.filter(
      (rule) => !rule.agent_id || !rule.condition.trim(),
    );

    if (invalidRules.length > 0) {
      toast.error('Please fill in all required fields (agent and condition)');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ transfers: rules });
      toast.success('Transfer rules saved successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save transfer rules:', error);
      toast.error('Failed to save transfer rules. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original rules
    setRules(transferRules.transfers || []);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configure Transfer Rules</DialogTitle>
          <DialogDescription>
            Define the conditions for transferring conversations to different
            agents. Each rule specifies when and how the transfer should occur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {rules.length === 0 ? (
            <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
              <p className="mb-2 text-sm">No transfer rules configured</p>
              <p className="text-xs">
                Click &quot;Add Rule&quot; to create your first transfer rule
              </p>
            </div>
          ) : (
            rules.map((rule, index) => (
              <div
                key={index}
                className="space-y-4 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Rule {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveRule(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {/* Target Agent */}
                  <div className="space-y-2">
                    <Label htmlFor={`agent-${index}`}>
                      Target Agent <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={rule.agent_id}
                      onValueChange={(value) =>
                        handleUpdateRule(index, 'agent_id', value)
                      }
                    >
                      <SelectTrigger id={`agent-${index}`}>
                        <SelectValue placeholder="Select an agent" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredAgents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Condition */}
                  <div className="space-y-2">
                    <Label htmlFor={`condition-${index}`}>
                      Condition <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id={`condition-${index}`}
                      placeholder="e.g., User asks about billing or payment issues"
                      value={rule.condition}
                      onChange={(e) =>
                        handleUpdateRule(index, 'condition', e.target.value)
                      }
                      rows={2}
                    />
                    <p className="text-muted-foreground text-xs">
                      Describe when this transfer should occur in natural
                      language
                    </p>
                  </div>

                  {/* Transfer Message */}
                  <div className="space-y-2">
                    <Label htmlFor={`message-${index}`}>
                      Transfer Message (optional)
                    </Label>
                    <Input
                      id={`message-${index}`}
                      placeholder="e.g., Let me connect you with our billing specialist"
                      value={rule.transfer_message || ''}
                      onChange={(e) =>
                        handleUpdateRule(
                          index,
                          'transfer_message',
                          e.target.value,
                        )
                      }
                    />
                    <p className="text-muted-foreground text-xs">
                      Message to play before transferring
                    </p>
                  </div>

                  {/* Delay */}
                  <div className="space-y-2">
                    <Label htmlFor={`delay-${index}`}>
                      Delay before transfer (ms)
                    </Label>
                    <Input
                      id={`delay-${index}`}
                      type="number"
                      min="0"
                      step="100"
                      value={rule.delay_ms || 0}
                      onChange={(e) =>
                        handleUpdateRule(
                          index,
                          'delay_ms',
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <p className="text-muted-foreground text-xs">
                      Milliseconds to wait before initiating transfer (0 for
                      immediate)
                    </p>
                  </div>

                  {/* Enable First Message */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={`first-message-${index}`}>
                        Enable first message
                      </Label>
                      <p className="text-muted-foreground text-xs">
                        Allow transferred agent to speak its initial greeting
                      </p>
                    </div>
                    <Switch
                      id={`first-message-${index}`}
                      checked={
                        rule.enable_transferred_agent_first_message ?? true
                      }
                      onCheckedChange={(checked) =>
                        handleUpdateRule(
                          index,
                          'enable_transferred_agent_first_message',
                          checked,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))
          )}

          {filteredAgents.length > 0 && (
            <Button
              variant="outline"
              onClick={handleAddRule}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          )}

          {filteredAgents.length === 0 && (
            <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-center">
              <p className="text-sm">
                No other agents available. Create additional agents to enable
                transfer rules.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Rules
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
