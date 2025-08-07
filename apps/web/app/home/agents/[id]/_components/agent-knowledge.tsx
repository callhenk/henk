'use client';

import { useState } from 'react';

import { BookOpen, Phone } from 'lucide-react';

import { Json } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import { Textarea } from '@kit/ui/textarea';

import { EnhancedKnowledgeBase } from './enhanced-knowledge-base';
import { FAQEditor } from './faq-editor';

interface AgentKnowledgeProps {
  agent: {
    id: string;
    elevenlabs_agent_id?: string | null;
    organization_info?: string | null;
    donor_context?: string | null;
    starting_message?: string | null;
    faqs?: Json;
  };
  onSaveField: (fieldName: string, value: string) => Promise<void>;
  savingField: string | null;
  onSaveSuccess: (message: string) => void;
}

export function AgentKnowledge({
  agent,
  onSaveField,
  savingField,
  onSaveSuccess,
}: AgentKnowledgeProps) {
  const [organizationInfo, setOrganizationInfo] = useState(
    agent.organization_info || '',
  );
  const [donorContext, setDonorContext] = useState(agent.donor_context || '');
  const [startingMessage, setStartingMessage] = useState(
    agent.starting_message || '',
  );
  const [faqs, _setFaqs] = useState(() => {
    if (agent.faqs) {
      try {
        return JSON.stringify(agent.faqs, null, 2);
      } catch {
        return '';
      }
    }
    return '';
  });

  // Check if there are unsaved changes for each field
  const hasOrganizationChanges =
    organizationInfo !== (agent?.organization_info || '');
  const hasDonorContextChanges = donorContext !== (agent?.donor_context || '');
  const hasStartingMessageChanges =
    startingMessage !== (agent?.starting_message || '');

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="bg-muted mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
          <BookOpen className="h-8 w-8" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Agent Knowledge
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
          Configure your agent&apos;s knowledge base and conversation settings
          to create personalized, intelligent interactions.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Organization Info
              </p>
              <p className="text-2xl font-bold">
                {organizationInfo ? organizationInfo.length : 0}
              </p>
              <p className="text-muted-foreground text-xs">characters</p>
            </div>
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Starting Message
              </p>
              <p className="text-2xl font-bold">
                {startingMessage ? startingMessage.length : 0}
              </p>
              <p className="text-muted-foreground text-xs">characters</p>
            </div>
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
              <Phone className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Context Prompt
              </p>
              <p className="text-2xl font-bold">
                {donorContext ? donorContext.length : 0}
              </p>
              <p className="text-muted-foreground text-xs">characters</p>
            </div>
            <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Left Column - Core Settings */}
        <div className="space-y-4 lg:space-y-6">
          {/* Organization Information */}
          <div className="rounded-xl border p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Organization Information
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Give the AI agent useful background to personalize calls
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Textarea
                value={organizationInfo}
                onChange={(e) => setOrganizationInfo(e.target.value)}
                className="min-h-[120px] resize-y"
                placeholder="Enter organization information..."
              />
              {hasOrganizationChanges && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      onSaveField('organization_info', organizationInfo)
                    }
                    disabled={savingField === 'organization_info'}
                  >
                    {savingField === 'organization_info'
                      ? 'Saving...'
                      : 'Save Organization Info'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Starting Message */}
          <div className="rounded-xl border p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Starting Message</h3>
                  <p className="text-muted-foreground text-sm">
                    The initial message the agent uses when starting a call
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Textarea
                value={startingMessage}
                onChange={(e) => setStartingMessage(e.target.value)}
                className="min-h-[100px] resize-y"
                placeholder="Enter the starting message for the agent..."
              />
              {hasStartingMessageChanges && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() =>
                      onSaveField('starting_message', startingMessage)
                    }
                    disabled={savingField === 'starting_message'}
                  >
                    {savingField === 'starting_message'
                      ? 'Saving...'
                      : 'Save Starting Message'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Context Prompt */}
          <div className="rounded-xl border p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Context Prompt</h3>
                  <p className="text-muted-foreground text-sm">
                    The prompt or context that guides the agent&apos;s responses
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Textarea
                value={donorContext}
                onChange={(e) => setDonorContext(e.target.value)}
                className="min-h-[120px] resize-y"
                placeholder="Enter the prompt or context for the agent..."
              />
              {hasDonorContextChanges && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => onSaveField('donor_context', donorContext)}
                    disabled={savingField === 'donor_context'}
                  >
                    {savingField === 'donor_context'
                      ? 'Saving...'
                      : 'Save Prompt'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Advanced Features */}
        <div className="space-y-4 lg:space-y-6">
          {/* FAQs */}
          <div className="rounded-xl border p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Add common questions and responses to help your agent handle
                    objections
                  </p>
                </div>
              </div>
            </div>
            <div>
              <FAQEditor
                value={faqs}
                agentId={agent.id}
                onSaveSuccess={() => {
                  onSaveSuccess('FAQs saved successfully!');
                }}
              />
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="rounded-xl border p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    ElevenLabs Knowledge Base
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Upload documents and link them to your agent for enhanced
                    responses
                  </p>
                </div>
              </div>
            </div>
            <div>
              <EnhancedKnowledgeBase
                _agentId={agent.id}
                elevenlabsAgentId={agent?.elevenlabs_agent_id || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
