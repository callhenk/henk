'use client';

import { useRef, useState } from 'react';

import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Spinner } from '@kit/ui/spinner';
import { Textarea } from '@kit/ui/textarea';

interface DetailsStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onNameEdited?: () => void;
  contextPrompt: string;
  onContextPromptChange: (contextPrompt: string) => void;
  firstMessage?: string;
  onFirstMessageChange?: (firstMessage: string) => void;
  enableAiGeneration?: boolean;
  agentName?: string;
  industry?: string;
}

export function DetailsStep({
  name,
  onNameChange,
  onNameEdited,
  contextPrompt,
  onContextPromptChange,
  firstMessage,
  onFirstMessageChange,
  enableAiGeneration = false,
  agentName,
  industry,
}: DetailsStepProps) {
  const [aiDescription, setAiDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingChars, setGeneratingChars] = useState(0);
  const [generatingWords, setGeneratingWords] = useState(0);
  const [generatingField, setGeneratingField] = useState<
    'context' | 'message' | null
  >(null);

  const contextPromptRef = useRef<HTMLTextAreaElement>(null);
  const firstMessageRef = useRef<HTMLTextAreaElement>(null);

  const handleGeneratePrompt = async () => {
    if (!aiDescription.trim()) {
      toast.error('Please describe what you want your agent to do');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/agents/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: aiDescription.trim(),
          fieldType: 'both',
          agentName: name || agentName || 'AI Agent',
          industry: industry || 'non profit',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate prompts');
      }

      // Check if streaming is supported
      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        // Stream the response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let contextPromptBuffer = '';
        let startingMessageBuffer = '';
        let buffer = '';

        if (!reader) {
          throw new Error('Stream not available');
        }

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');

          // Keep the last incomplete chunk in the buffer
          buffer = lines.pop() || '';

          for (const message of lines) {
            if (!message.trim()) continue;

            const eventMatch = message.match(/event: (.+)\n/);
            const dataMatch = message.match(/data: (.+)/);

            if (eventMatch?.[1] && dataMatch?.[1]) {
              const event = eventMatch[1];
              const data = JSON.parse(dataMatch[1]);

              if (event === 'context_prompt_start') {
                setGeneratingField('context');
                setGeneratingChars(0);
                setGeneratingWords(0);
              } else if (event === 'context_prompt_chunk' && data.chunk) {
                contextPromptBuffer += data.chunk;
                onContextPromptChange(contextPromptBuffer);
                setGeneratingChars(contextPromptBuffer.length);
                setGeneratingWords(
                  contextPromptBuffer.trim().split(/\s+/).filter(Boolean)
                    .length,
                );
                // Auto-scroll context prompt textarea
                if (contextPromptRef.current) {
                  contextPromptRef.current.scrollTop =
                    contextPromptRef.current.scrollHeight;
                }
              } else if (event === 'context_prompt_complete') {
                setGeneratingField(null);
              } else if (event === 'starting_message_start') {
                setGeneratingField('message');
                setGeneratingChars(0);
                setGeneratingWords(0);
              } else if (event === 'starting_message_chunk' && data.chunk) {
                startingMessageBuffer += data.chunk;
                if (onFirstMessageChange) {
                  onFirstMessageChange(startingMessageBuffer);
                }
                setGeneratingChars(startingMessageBuffer.length);
                setGeneratingWords(
                  startingMessageBuffer.trim().split(/\s+/).filter(Boolean)
                    .length,
                );
                // Auto-scroll first message textarea
                if (firstMessageRef.current) {
                  firstMessageRef.current.scrollTop =
                    firstMessageRef.current.scrollHeight;
                }
              } else if (event === 'starting_message_complete') {
                setGeneratingField(null);
              }
            }
          }
        }

        setAiDescription('');
      } else {
        // Fallback to non-streaming response
        const data = await response.json();

        if (data.contextPrompt) {
          onContextPromptChange(data.contextPrompt);
        }
        if (data.startingMessage && onFirstMessageChange) {
          onFirstMessageChange(data.startingMessage);
        }

        setAiDescription('');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate prompts',
      );
    } finally {
      setIsGenerating(false);
      setGeneratingField(null);
      setGeneratingChars(0);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl font-bold sm:text-2xl">Agent Details</h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Review and customize your agent&apos;s configuration
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="animate-in fade-in space-y-2 duration-300">
          <label className="block text-xs font-semibold sm:text-sm">
            Agent Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g., Sarah, Support Bot"
            value={name}
            onChange={(e) => {
              onNameChange(e.target.value);
              onNameEdited?.();
            }}
            className="h-10 text-sm sm:h-11 sm:text-base"
          />
          <p className="text-muted-foreground text-xs">
            Choose a friendly, memorable name for your agent
          </p>
        </div>

        {enableAiGeneration && (
          <div className="animate-in fade-in space-y-3 rounded-lg border bg-gray-50 p-4 transition-all duration-300 sm:p-5 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <div className="bg-primary flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-110">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-50">
                Generate with AI
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-md bg-white p-3 dark:bg-gray-900/50">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Example:
                </p>
                <p className="mt-1 text-sm text-gray-700 italic dark:text-gray-300">
                  &quot;You&apos;re {name || 'Sarah'}, calling donors for
                  Helping Hands Charity to invite them to the Annual Fundraising
                  Gala.&quot;
                </p>
              </div>

              <Textarea
                placeholder="Describe your agent's role and purpose..."
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                className="min-h-[90px] resize-y text-sm transition-all focus:ring-2"
                rows={4}
              />

              <Button
                type="button"
                onClick={handleGeneratePrompt}
                disabled={isGenerating || !aiDescription.trim()}
                className="h-10 w-full transition-all hover:scale-[1.02]"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Prompts
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {onFirstMessageChange && (
          <div className="animate-in fade-in space-y-2 duration-300">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold sm:text-sm">
                First Message
              </label>
              {isGenerating && generatingField === 'message' && (
                <span className="text-primary animate-in fade-in flex items-center gap-2 text-xs font-medium">
                  <Spinner className="h-3 w-3" />
                  <span className="flex items-center gap-1.5">
                    <span className="font-mono">{generatingWords}</span> words
                    <span className="text-muted-foreground">·</span>
                    <span className="font-mono">{generatingChars}</span> chars
                  </span>
                </span>
              )}
            </div>
            <Textarea
              ref={firstMessageRef}
              placeholder="e.g., Hello! How can I help you today?"
              value={firstMessage || ''}
              onChange={(e) => {
                onFirstMessageChange(e.target.value);
              }}
              className="min-h-[80px] resize-y text-sm sm:text-base"
              rows={3}
            />
            <p className="text-muted-foreground text-xs">
              The agent&apos;s opening greeting when the call starts
            </p>
          </div>
        )}

        <div className="animate-in fade-in space-y-2 duration-300">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold sm:text-sm">
              Context Prompt <span className="text-destructive">*</span>
            </label>
            {isGenerating && generatingField === 'context' && (
              <span className="text-primary animate-in fade-in flex items-center gap-2 text-xs font-medium">
                <Spinner className="h-3 w-3" />
                <span className="flex items-center gap-1.5">
                  <span className="font-mono">{generatingWords}</span> words
                  <span className="text-muted-foreground">·</span>
                  <span className="font-mono">{generatingChars}</span> chars
                </span>
              </span>
            )}
          </div>
          <Textarea
            ref={contextPromptRef}
            placeholder="Describe the agent's purpose, behavior, and context. This guides how the agent responds to users."
            className="min-h-[250px] resize-y text-sm sm:min-h-[300px] sm:text-base"
            value={contextPrompt}
            onChange={(e) => {
              onContextPromptChange(e.target.value);
            }}
          />
          <p className="text-muted-foreground text-xs">
            The prompt or context that guides the agent&apos;s responses
          </p>
        </div>
      </div>
    </div>
  );
}
