'use client';

import { useState } from 'react';

import { Sparkles } from 'lucide-react';

import { Json } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';
import { toast } from 'sonner';

import { EnhancedKnowledgeBase } from './enhanced-knowledge-base';
import { FAQEditor } from './faq-editor';

interface AgentKnowledgeProps {
  agent: {
    id: string;
    name?: string;
    elevenlabs_agent_id?: string | null;
    organization_info?: string | null;
    donor_context?: string | null;
    context_prompt?: string | null;
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

  // State for generation - separate descriptions for each field
  const [startingMessageDescription, setStartingMessageDescription] = useState('');
  const [contextPromptDescription, setContextPromptDescription] = useState('');
  const [generatingField, setGeneratingField] = useState<'context' | 'starting' | null>(null);

  // Check if there are unsaved changes for each field
  const hasOrganizationChanges =
    organizationInfo !== (agent?.organization_info || '');
  const hasDonorContextChanges = donorContext !== (agent?.donor_context || '');
  const hasStartingMessageChanges =
    startingMessage !== (agent?.starting_message || '');

  // Generate context prompt or starting message using AI
  const generatePrompt = async (
    fieldType: 'context_prompt' | 'starting_message',
    description: string,
  ) => {
    if (!description.trim()) {
      toast.error('Please describe what you want to generate');
      return;
    }

    setGeneratingField(fieldType === 'context_prompt' ? 'context' : 'starting');

    try {
      const response = await fetch('/api/agents/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          fieldType,
          agentName: agent?.name,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate prompt');
      }

      const result = await response.json();

      if (fieldType === 'context_prompt' && result.data?.contextPrompt) {
        setDonorContext(result.data.contextPrompt);
        toast.success('Context prompt generated! Review and save when ready.');
      } else if (fieldType === 'starting_message' && result.data?.startingMessage) {
        setStartingMessage(result.data.startingMessage);
        toast.success('Starting message generated! Review and save when ready.');
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate prompt',
      );
    } finally {
      setGeneratingField(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Organization Information */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">Organization Information</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Background context to personalize calls
              </p>
            </div>
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
                  {savingField === 'organization_info' ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          {/* Starting Message with AI Generation */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Starting Message</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Initial message when starting a call
              </p>
            </div>

            {/* Dynamic Variables Info */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900 space-y-3 rounded-lg border p-4">
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                  <span className="text-xs font-bold">i</span>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs font-medium">Dynamic Variables</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Variables like <code className="bg-muted rounded px-1 py-0.5 text-xs">{'{{donor_name}}'}</code> in your message will be replaced with actual values when the conversation starts.
                  </p>
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium">Available variables:</p>
                    <div className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <code className="bg-muted rounded px-1 py-0.5">{'{{donor_name}}'}</code>
                      <code className="bg-muted rounded px-1 py-0.5">{'{{campaign_name}}'}</code>
                      <code className="bg-muted rounded px-1 py-0.5">{'{{company}}'}</code>
                      <code className="bg-muted rounded px-1 py-0.5">{'{{attempt_no}}'}</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Generation */}
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 opacity-70" />
                <span className="text-xs font-medium opacity-70">
                  AI Generate
                </span>
              </div>
              <Input
                value={startingMessageDescription}
                onChange={(e) => setStartingMessageDescription(e.target.value)}
                placeholder="Describe what you want (e.g., friendly greeting for support calls)"
                className="bg-background"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  generatePrompt('starting_message', startingMessageDescription)
                }
                disabled={
                  generatingField === 'starting' ||
                  !startingMessageDescription.trim()
                }
                className="h-8 w-full text-xs"
              >
                {generatingField === 'starting' ? (
                  'Generating...'
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3 w-3" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {/* Manual Input */}
            <div className="space-y-2">
              <Textarea
                value={startingMessage}
                onChange={(e) => setStartingMessage(e.target.value)}
                className="min-h-[100px] resize-y"
                placeholder="Or enter manually..."
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
                    {savingField === 'starting_message' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Context Prompt with AI Generation */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">Context Prompt</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Instructions that guide the agent&apos;s behavior
              </p>
            </div>

            {/* AI Generation */}
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 opacity-70" />
                <span className="text-xs font-medium opacity-70">
                  AI Generate
                </span>
              </div>
              <Input
                value={contextPromptDescription}
                onChange={(e) => setContextPromptDescription(e.target.value)}
                placeholder="Describe the role (e.g., empathetic support agent for complaints)"
                className="bg-background"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  generatePrompt('context_prompt', contextPromptDescription)
                }
                disabled={
                  generatingField === 'context' ||
                  !contextPromptDescription.trim()
                }
                className="h-8 w-full text-xs"
              >
                {generatingField === 'context' ? (
                  'Generating...'
                ) : (
                  <>
                    <Sparkles className="mr-1.5 h-3 w-3" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {/* Manual Input */}
            <div className="space-y-2">
              <Textarea
                value={donorContext}
                onChange={(e) => setDonorContext(e.target.value)}
                className="min-h-[120px] resize-y"
                placeholder="Or enter manually..."
              />
              {hasDonorContextChanges && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => onSaveField('donor_context', donorContext)}
                    disabled={savingField === 'donor_context'}
                  >
                    {savingField === 'donor_context' ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* FAQs */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">Frequently Asked Questions</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Common questions and responses for handling objections
              </p>
            </div>
            <div className="rounded-lg border p-4">
              <FAQEditor
                value={faqs}
                agentId={agent.id}
                onSaveField={onSaveField}
                onSaveSuccess={() => {
                  onSaveSuccess('FAQs saved successfully!');
                }}
              />
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">Knowledge Base</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Upload documents to enhance agent responses
              </p>
            </div>
            <div className="rounded-lg border p-4">
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
