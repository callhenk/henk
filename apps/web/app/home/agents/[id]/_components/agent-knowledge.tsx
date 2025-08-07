'use client';

import { useState } from 'react';

import { BookOpen, Phone } from 'lucide-react';

import { Json } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
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
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Give the AI agent useful background to personalize calls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={organizationInfo}
            onChange={(e) => setOrganizationInfo(e.target.value)}
            className="min-h-[150px] resize-none sm:min-h-[200px]"
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Starting Message
          </CardTitle>
          <CardDescription>
            The initial message the agent uses when starting a call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={startingMessage}
            onChange={(e) => setStartingMessage(e.target.value)}
            className="min-h-[120px] resize-none sm:min-h-[150px]"
            placeholder="Enter the starting message for the agent (e.g., 'Hello, this is [Agent Name] calling from [Organization]. How are you today?')"
          />
          {hasStartingMessageChanges && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => onSaveField('starting_message', startingMessage)}
                disabled={savingField === 'starting_message'}
              >
                {savingField === 'starting_message'
                  ? 'Saving...'
                  : 'Save Starting Message'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prompt</CardTitle>
          <CardDescription>
            The prompt or context that guides the agent&apos;s responses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={donorContext}
            onChange={(e) => setDonorContext(e.target.value)}
            className="min-h-[150px] resize-none sm:min-h-[200px]"
            placeholder="Enter the prompt or context for the agent."
          />
          {hasDonorContextChanges && (
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => onSaveField('donor_context', donorContext)}
                disabled={savingField === 'donor_context'}
              >
                {savingField === 'donor_context' ? 'Saving...' : 'Save Prompt'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Add common questions and responses to help your agent handle
            objections effectively
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FAQEditor
            value={faqs}
            agentId={agent.id}
            onSaveSuccess={() => {
              onSaveSuccess('FAQs saved successfully!');
            }}
          />
        </CardContent>
      </Card>

      <EnhancedKnowledgeBase
        _agentId={agent.id}
        elevenlabsAgentId={agent?.elevenlabs_agent_id || undefined}
      />
    </div>
  );
}
