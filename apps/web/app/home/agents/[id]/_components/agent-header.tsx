'use client';

import { useState } from 'react';

import { ArrowLeft, Edit, Phone } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';

interface AgentHeaderProps {
  agent: {
    id: string;
    name: string;
    description?: string | null;
    status: string;
  };
  onBack: () => void;
  onTalkToAgent: () => void;
  onSaveField: (fieldName: string, value: string) => Promise<void>;
}

export function AgentHeader({
  agent,
  onBack,
  onTalkToAgent,
  onSaveField,
}: AgentHeaderProps) {
  const [editingName, setEditingName] = useState(false);
  const [agentName, setAgentName] = useState(agent.name || '');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'agent_paused':
        return <Badge variant="outline">Paused</Badge>;
      case 'training':
        return <Badge variant="default">Training</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="bg-card/60 supports-[backdrop-filter]:bg-card/60 rounded-xl border p-6 backdrop-blur">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            size="sm"
            aria-label="Back to agents"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Agents</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-3">
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                <Phone className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  {editingName ? (
                    <div className="flex w-full items-center gap-2">
                      <label htmlFor="agent-name-input" className="sr-only">
                        Agent name
                      </label>
                      <Input
                        id="agent-name-input"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="h-8 flex-1 text-lg font-bold sm:text-2xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (agentName.trim() && agentName !== agent.name) {
                              onSaveField('name', agentName.trim());
                            }
                            setEditingName(false);
                          } else if (e.key === 'Escape') {
                            setAgentName(agent.name || '');
                            setEditingName(false);
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => {
                            if (agentName.trim() && agentName !== agent.name) {
                              onSaveField('name', agentName.trim());
                            }
                            setEditingName(false);
                          }}
                          disabled={
                            !agentName.trim() || agentName === agent.name
                          }
                          aria-label="Save name"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAgentName(agent.name || '');
                            setEditingName(false);
                          }}
                          aria-label="Cancel editing name"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center space-x-2">
                      <h1
                        className="truncate text-lg font-bold sm:text-2xl"
                        title={agentName}
                      >
                        {agentName}
                      </h1>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="h-6 w-6 flex-shrink-0 p-0"
                        aria-label="Edit agent name"
                        title="Edit name"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {agent.description || 'AI Agent'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(agent.status)}
          <Button
            onClick={onTalkToAgent}
            size="sm"
            variant="default"
            aria-label="Start voice chat with agent"
          >
            <Phone className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Start Voice Chat</span>
            <span className="sm:hidden">Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
