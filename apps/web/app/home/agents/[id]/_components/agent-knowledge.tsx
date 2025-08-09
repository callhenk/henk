'use client';

import { useState } from 'react';

// Icons intentionally unused after layout refactor
// import { BookOpen, Phone } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>
                Give the AI agent useful background to personalize calls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Starting Message</CardTitle>
              <CardDescription>
                The initial message the agent uses when starting a call
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Context Prompt</CardTitle>
              <CardDescription>
                The prompt or context that guides the agent&apos;s responses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>
                Add common questions and responses to help your agent handle
                objections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FAQEditor
                value={faqs}
                agentId={agent.id}
                onSaveSuccess={() => {
                  onSaveSuccess('FAQs saved successfully!');
                }}
              />
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>ElevenLabs Knowledge Base</CardTitle>
              <CardDescription>
                Upload documents and link them to your agent for enhanced
                responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedKnowledgeBase
                _agentId={agent.id}
                elevenlabsAgentId={agent?.elevenlabs_agent_id || undefined}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
