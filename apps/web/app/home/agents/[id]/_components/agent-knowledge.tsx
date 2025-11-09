'use client';

import { useRef, useState } from 'react';

import {
  Building2,
  ChevronDown,
  ChevronUp,
  Database,
  FileText,
  HelpCircle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

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
  const [generatingChars, setGeneratingChars] = useState(0);
  const [generatingWords, setGeneratingWords] = useState(0);
  const [showSaveReminder, setShowSaveReminder] = useState(false);

  // State for collapsible sections
  const [showDynamicVariables, setShowDynamicVariables] = useState(false);

  // Ref for auto-scrolling
  const donorContextRef = useRef<HTMLTextAreaElement>(null);

  // Check if there are unsaved changes for each field
  const hasOrganizationChanges =
    organizationInfo !== (agent?.organization_info || '');
  const hasDonorContextChanges = donorContext !== (agent?.donor_context || '');
  const hasStartingMessageChanges =
    startingMessage !== (agent?.starting_message || '');

  // Generate context prompt using AI with streaming
  const generatePrompt = async (
    fieldType: 'context_prompt',
    description: string,
  ) => {
    if (!description.trim()) {
      toast.error('Please describe what you want to generate');
      return;
    }

    setGeneratingField('context');
    setGeneratingChars(0);
    setGeneratingWords(0);
    setDonorContext(''); // Clear existing content

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

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete events (events are separated by double newlines)
        const events = buffer.split('\n\n');
        // Keep the last potentially incomplete event in the buffer
        buffer = events.pop() || '';

        for (const event of events) {
          if (!event.trim()) continue;

          const lines = event.split('\n');
          let eventType = '';
          let eventData: Record<string, string> | null = null;

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                eventData = JSON.parse(line.substring(6)) as Record<
                  string,
                  string
                >;
              } catch (e) {
                console.error('Failed to parse event data:', e);
              }
            }
          }

          // Handle different event types
          if (eventType === 'context_prompt_chunk' && eventData?.chunk) {
            // Update content immediately as chunks arrive
            accumulatedContent += eventData.chunk;
            setDonorContext(accumulatedContent);
            setGeneratingChars(accumulatedContent.length);
            setGeneratingWords(
              accumulatedContent.trim().split(/\s+/).filter(Boolean).length,
            );
            // Auto-scroll to bottom
            if (donorContextRef.current) {
              donorContextRef.current.scrollTop =
                donorContextRef.current.scrollHeight;
            }
          } else if (
            eventType === 'context_prompt_complete' &&
            eventData?.content
          ) {
            // Set final content (in case of any discrepancies)
            setDonorContext(eventData.content);
            setShowSaveReminder(true);
            toast.success('✨ Context prompt generated successfully!', {
              description:
                'Please review the content and click "Save Changes" below to apply it.',
              duration: 6000,
            });
          } else if (eventType === 'error') {
            throw new Error(eventData?.error || 'Generation failed');
          }
        }
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate prompt',
      );
      // Don't clear the content if we got partial results
    } finally {
      setGeneratingField(null);
      setGeneratingChars(0);
      setGeneratingWords(0);
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
                <Building2 className="text-primary h-4 w-4" />
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
                <MessageSquare className="text-primary h-4 w-4" />
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
                  className="hover:bg-muted/50 flex w-full items-center justify-between p-3 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                      <span className="text-xs font-bold">i</span>
                    </div>
                    <span className="text-xs font-medium">
                      Dynamic Variables Available
                    </span>
                  </div>
                  {showDynamicVariables ? (
                    <ChevronUp className="text-muted-foreground h-4 w-4" />
                  ) : (
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                  )}
                </button>

                {showDynamicVariables && (
                  <div className="bg-muted/20 space-y-3 border-t p-4 pt-4">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Variables like{' '}
                      <code className="bg-background rounded px-1.5 py-0.5 font-mono text-xs">
                        {'{{donor_name}}'}
                      </code>{' '}
                      will be replaced with actual values during calls.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium">
                        Available variables:
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <code className="bg-background rounded px-2 py-1.5 font-mono text-xs">
                          {'{{donor_name}}'}
                        </code>
                        <code className="bg-background rounded px-2 py-1.5 font-mono text-xs">
                          {'{{campaign_name}}'}
                        </code>
                        <code className="bg-background rounded px-2 py-1.5 font-mono text-xs">
                          {'{{company}}'}
                        </code>
                        <code className="bg-background rounded px-2 py-1.5 font-mono text-xs">
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
                <FileText className="text-primary h-4 w-4" />
                <CardTitle className="text-base">Context Prompt</CardTitle>
              </div>
              <CardDescription>
                Detailed instructions that guide your agent&apos;s personality,
                tone, and behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Generation */}
              <div className="border-primary/20 from-primary/5 to-primary/10 space-y-3 rounded-lg border bg-gradient-to-br p-4">
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 rounded-full p-1">
                    <Sparkles className="text-primary h-3.5 w-3.5" />
                  </div>
                  <span className="text-primary text-sm font-medium">
                    AI Generate Prompt
                  </span>
                </div>
                <div className="bg-background/50 space-y-2 rounded-md p-3">
                  <p className="text-muted-foreground text-xs font-medium">
                    Examples:
                  </p>
                  <p className="text-muted-foreground text-xs italic">
                    &ldquo;Empathetic fundraising specialist who builds rapport
                    with donors, handles objections gracefully, and focuses on
                    the mission impact&rdquo;
                  </p>
                  <p className="text-muted-foreground text-xs italic">
                    &ldquo;Your name is Sarah and you work for Green Earth
                    Foundation. You&apos;re calling donors to invite them to the
                    annual gala fundraiser&rdquo;
                  </p>
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
                  {generatingField === 'context' ? (
                    <span className="text-primary animate-in fade-in flex items-center gap-2 text-xs font-medium">
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="flex items-center gap-1.5">
                        <span className="font-mono">{generatingWords}</span>{' '}
                        words
                        <span className="text-muted-foreground">·</span>
                        <span className="font-mono">
                          {generatingChars}
                        </span>{' '}
                        chars
                      </span>
                    </span>
                  ) : donorContext ? (
                    <span className="text-muted-foreground text-xs">
                      {donorContext.trim().split(/\s+/).filter(Boolean).length}{' '}
                      words · {donorContext.length} chars
                    </span>
                  ) : null}
                </div>
                <Textarea
                  ref={donorContextRef}
                  value={donorContext}
                  onChange={(e) => {
                    setDonorContext(e.target.value);
                    setShowSaveReminder(false);
                  }}
                  className="min-h-[300px] resize-y font-mono text-sm sm:min-h-[350px]"
                  placeholder="Or write your own prompt..."
                />
                {showSaveReminder && hasDonorContextChanges && (
                  <div className="animate-in fade-in slide-in-from-top-2 border-primary bg-primary/10 rounded-lg border-2 p-4 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="bg-primary/20 mt-0.5 rounded-full p-1">
                        <Sparkles className="text-primary h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-primary font-semibold">
                          Generated content ready to save!
                        </h4>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Your AI-generated context prompt is ready. Click the
                          button below to save it to your agent.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {hasDonorContextChanges && (
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => {
                        onSaveField('donor_context', donorContext);
                        setShowSaveReminder(false);
                      }}
                      disabled={savingField === 'donor_context'}
                      className={
                        showSaveReminder
                          ? 'ring-primary animate-pulse ring-2 ring-offset-2'
                          : ''
                      }
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
                <HelpCircle className="text-primary h-4 w-4" />
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
                <Database className="text-primary h-4 w-4" />
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
