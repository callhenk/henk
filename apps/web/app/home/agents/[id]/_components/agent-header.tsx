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
        return (
          <Badge className="bg-green-100 text-green-800 transition-colors hover:bg-green-200">
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge className="bg-gray-100 text-gray-800 transition-colors hover:bg-gray-200">
            Inactive
          </Badge>
        );
      case 'agent_paused':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 transition-colors hover:bg-yellow-200">
            Paused
          </Badge>
        );
      case 'training':
        return (
          <Badge className="bg-blue-100 text-blue-800 transition-colors hover:bg-blue-200">
            Training
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="hover:bg-muted transition-colors">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            size="sm"
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Agents</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-slate-50">
                <Phone className="h-6 w-6 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  {editingName ? (
                    <div className="flex w-full items-center space-x-2">
                      <Input
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        className="h-8 flex-1 border-gray-200 text-lg font-bold focus:border-gray-500 focus:ring-gray-500 sm:text-2xl"
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
                        className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                      >
                        ✓
                      </Button>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center space-x-2">
                      <h1 className="truncate text-lg font-bold text-gray-900 sm:text-2xl">
                        {agentName}
                      </h1>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="h-6 w-6 flex-shrink-0 p-0 text-gray-500 hover:text-gray-700"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-gray-600">
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
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800"
            size="sm"
          >
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Start Voice Chat</span>
            <span className="sm:hidden">Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
