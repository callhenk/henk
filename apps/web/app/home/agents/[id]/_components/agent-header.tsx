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
    <div className="rounded-xl border p-6 shadow-sm">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} size="sm">
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
                    <div className="flex w-full items-center space-x-2">
                      <Input
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="h-8 flex-1 text-lg font-bold sm:text-2xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onSaveField('name', agentName);
                            setEditingName(false);
                          } else if (e.key === 'Escape') {
                            setAgentName(agent.name || '');
                            setEditingName(false);
                          }
                        }}
                        onBlur={() => {
                          onSaveField('name', agentName);
                          setEditingName(false);
                        }}
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onSaveField('name', agentName);
                          setEditingName(false);
                        }}
                        className="h-6 w-6 p-0"
                      >
                        ✓
                      </Button>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center space-x-2">
                      <h1 className="truncate text-lg font-bold sm:text-2xl">
                        {agentName}
                      </h1>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="h-6 w-6 flex-shrink-0 p-0"
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
          <Button onClick={onTalkToAgent} size="sm" variant="default">
            <Phone className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Start Voice Chat</span>
            <span className="sm:hidden">Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
