'use client';

import { useState } from 'react';

import {
  Sparkles,
  Building2,
  MessageSquare,
  FileText,
  HelpCircle,
  Database,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Json } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
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

  // State for generation - context prompt description
  const [contextPromptDescription, setContextPromptDescription] = useState('');
  const [generatingField, setGeneratingField] = useState<'context' | null>(
    null,
  );

  // State for collapsible sections
  const [showDynamicVariables, setShowDynamicVariables] = useState(false);

  // Check if there are unsaved changes for each field
  const hasOrganizationChanges =
    organizationInfo !== (agent?.organization_info || '');
  const hasDonorContextChanges = donorContext !== (agent?.donor_context || '');
  const hasStartingMessageChanges =
    startingMessage !== (agent?.starting_message || '');

  // Generate context prompt using AI
  const generatePrompt = async (
    fieldType: 'context_prompt',
    description: string,
  ) => {
    if (!description.trim()) {
      toast.error('Please describe what you want to generate');
      return;
    }

    setGeneratingField('context');

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

      if (result.data?.contextPrompt) {
        setDonorContext(result.data.contextPrompt);
        toast.success('Context prompt generated! Review and save when ready.');
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Organization Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">
                  Organization Information
                </CardTitle>
              </div>
              <CardDescription>
                Background context to personalize calls and provide
                organizational details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={organizationInfo}
                onChange={(e) => setOrganizationInfo(e.target.value)}
                className="min-h-[120px] resize-y"
                placeholder="e.g., We are a non-profit focused on environmental conservation with 20 years of experience..."
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
                      : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Starting Message */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Starting Message</CardTitle>
              </div>
              <CardDescription>
                The first thing your agent says when starting a call
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dynamic Variables Info - Collapsible */}
              <div className="overflow-hidden rounded-lg border">
                <button
                  onClick={() => setShowDynamicVariables(!showDynamicVariables)}
                  className="flex w-full items-center justify-between p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full">
                      <span className="text-xs font-bold">i</span>
                    </div>
                    <span className="text-xs font-medium">
                      Dynamic Variables Available
                    </span>
                  </div>
                  {showDynamicVariables ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {showDynamicVariables && (
                  <div className="space-y-3 border-t bg-muted/20 p-4 pt-4">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Variables like{' '}
                      <code className="rounded bg-background px-1.5 py-0.5 font-mono text-xs">
                        {'{{donor_name}}'}
                      </code>{' '}
                      will be replaced with actual values during calls.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Available variables:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <code className="rounded bg-background px-2 py-1.5 font-mono text-xs">
                          {'{{donor_name}}'}
                        </code>
                        <code className="rounded bg-background px-2 py-1.5 font-mono text-xs">
                          {'{{campaign_name}}'}
                        </code>
                        <code className="rounded bg-background px-2 py-1.5 font-mono text-xs">
                          {'{{company}}'}
                        </code>
                        <code className="rounded bg-background px-2 py-1.5 font-mono text-xs">
                          {'{{attempt_no}}'}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="space-y-3">
                <Textarea
                  value={startingMessage}
                  onChange={(e) => setStartingMessage(e.target.value)}
                  className="min-h-[100px] resize-y"
                  placeholder="e.g., Hello {{donor_name}}, this is Sarah calling from {{company}}..."
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
                        : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Context Prompt with AI Generation */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Context Prompt</CardTitle>
              </div>
              <CardDescription>
                Detailed instructions that guide your agent&apos;s personality,
                tone, and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Generation */}
              <div className="space-y-3 rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-1">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-primary">
                    AI Generate Prompt
                  </span>
                </div>
                <Input
                  value={contextPromptDescription}
                  onChange={(e) => setContextPromptDescription(e.target.value)}
                  placeholder="Describe your ideal agent (e.g., empathetic support specialist for donor relations)"
                  className="border-primary/20 bg-background"
                />
                <Button
                  variant="default"
                  size="sm"
                  onClick={() =>
                    generatePrompt('context_prompt', contextPromptDescription)
                  }
                  disabled={
                    generatingField === 'context' ||
                    !contextPromptDescription.trim()
                  }
                  className="w-full"
                >
                  {generatingField === 'context' ? (
                    <>
                      <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-3.5 w-3.5" />
                      Generate Context Prompt
                    </>
                  )}
                </Button>
              </div>

              {/* Manual Input */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Prompt Content</label>
                  {donorContext && (
                    <span className="text-xs text-muted-foreground">
                      {donorContext.length} characters
                    </span>
                  )}
                </div>
                <Textarea
                  value={donorContext}
                  onChange={(e) => setDonorContext(e.target.value)}
                  className="min-h-[300px] resize-y font-mono text-sm sm:min-h-[350px]"
                  placeholder="Or write your own prompt..."
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
                        : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* FAQs */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">
                  Frequently Asked Questions
                </CardTitle>
              </div>
              <CardDescription>
                Common questions and prepared responses for handling objections
                effectively
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FAQEditor
                value={faqs}
                agentId={agent.id}
                onSaveField={onSaveField}
                onSaveSuccess={() => {
                  onSaveSuccess('FAQs saved successfully!');
                }}
              />
            </CardContent>
          </Card>

          {/* Knowledge Base */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Knowledge Base</CardTitle>
              </div>
              <CardDescription>
                Upload documents and resources to enhance your agent&apos;s
                knowledge and responses
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
