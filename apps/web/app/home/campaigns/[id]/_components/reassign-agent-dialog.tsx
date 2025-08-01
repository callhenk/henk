'use client';

import { useState } from 'react';

import { Check, Users } from 'lucide-react';

import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { useUpdateCampaign } from '@kit/supabase/hooks/campaigns/use-campaign-mutations';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';

import { StatusBadge } from '~/components/shared';

interface ReassignAgentDialogProps {
  campaignId: string;
  currentAgentId?: string;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function ReassignAgentDialog({
  campaignId,
  currentAgentId,
  onSuccess,
  trigger,
}: ReassignAgentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: agents = [], isLoading } = useAgents();
  const updateCampaignMutation = useUpdateCampaign();

  const handleReassign = async () => {
    if (!selectedAgentId) return;

    setIsUpdating(true);
    try {
      await updateCampaignMutation.mutateAsync({
        id: campaignId,
        agent_id: selectedAgentId,
      });

      setIsOpen(false);
      setSelectedAgentId(null);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to reassign agent:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const availableAgents = agents.filter((agent) => agent.status === 'active');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Users className="mr-2 h-4 w-4" />
            Reassign Agent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reassign Agent</DialogTitle>
          <DialogDescription>
            Select a new agent to handle this campaign. Only active agents are
            shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground">Loading agents...</p>
              </div>
            </div>
          ) : availableAgents.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Users className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">
                  No active agents available
                </p>
                <p className="text-muted-foreground text-sm">
                  Create an agent first to assign to this campaign
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {availableAgents.map((agent) => (
                <div
                  key={agent.id}
                  className={`hover:bg-muted flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                    selectedAgentId === agent.id
                      ? 'border-primary bg-primary/5'
                      : ''
                  }`}
                  onClick={() => setSelectedAgentId(agent.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                      <Users className="text-primary h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">{agent.name}</div>
                      <div className="text-muted-foreground text-sm">
                        {agent.description || 'No description'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={agent.status} />
                    {selectedAgentId === agent.id && (
                      <Check className="text-primary h-4 w-4" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {availableAgents.length > 0 && (
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReassign}
                disabled={!selectedAgentId || isUpdating}
              >
                {isUpdating ? 'Reassigning...' : 'Reassign Agent'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
