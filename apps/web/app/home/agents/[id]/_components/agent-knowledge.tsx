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
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50">
          <BookOpen className="h-8 w-8 text-gray-600" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Agent Knowledge
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Configure your agent&apos;s knowledge base and conversation settings
          to create personalized, intelligent interactions.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Organization Info
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {organizationInfo ? organizationInfo.length : 0}
              </p>
              <p className="text-xs text-gray-500">characters</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-50">
              <BookOpen className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Starting Message
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {startingMessage ? startingMessage.length : 0}
              </p>
              <p className="text-xs text-gray-500">characters</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Context Prompt
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {donorContext ? donorContext.length : 0}
              </p>
              <p className="text-xs text-gray-500">characters</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50">
              <BookOpen className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Left Column - Core Settings */}
        <div className="space-y-4 lg:space-y-6">
          {/* Organization Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                  <BookOpen className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Organization Information
                  </h3>
                  <p className="text-sm text-gray-600">
                    Give the AI agent useful background to personalize calls
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Textarea
                value={organizationInfo}
                onChange={(e) => setOrganizationInfo(e.target.value)}
                className="min-h-[120px] resize-y border-gray-200 focus:border-blue-500 focus:ring-blue-500"
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
                    className="bg-blue-600 hover:bg-blue-700"
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
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Starting Message
                  </h3>
                  <p className="text-sm text-gray-600">
                    The initial message the agent uses when starting a call
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Textarea
                value={startingMessage}
                onChange={(e) => setStartingMessage(e.target.value)}
                className="min-h-[100px] resize-y border-gray-200 focus:border-green-500 focus:ring-green-500"
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
                    className="bg-green-600 hover:bg-green-700"
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
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Context Prompt
                  </h3>
                  <p className="text-sm text-gray-600">
                    The prompt or context that guides the agent&apos;s responses
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Textarea
                value={donorContext}
                onChange={(e) => setDonorContext(e.target.value)}
                className="min-h-[120px] resize-y border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                placeholder="Enter the prompt or context for the agent..."
              />
              {hasDonorContextChanges && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => onSaveField('donor_context', donorContext)}
                    disabled={savingField === 'donor_context'}
                    className="bg-purple-600 hover:bg-purple-700"
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
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                  <BookOpen className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Frequently Asked Questions
                  </h3>
                  <p className="text-sm text-gray-600">
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
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                  <BookOpen className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    ElevenLabs Knowledge Base
                  </h3>
                  <p className="text-sm text-gray-600">
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
