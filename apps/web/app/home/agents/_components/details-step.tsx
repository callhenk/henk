'use client';

import { useState } from 'react';

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

      const data = await response.json();

      if (data.contextPrompt) {
        onContextPromptChange(data.contextPrompt);
      }
      if (data.startingMessage && onFirstMessageChange) {
        onFirstMessageChange(data.startingMessage);
      }

      toast.success('Prompts generated successfully!');
      setAiDescription('');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to generate prompts',
      );
    } finally {
      setIsGenerating(false);
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
          <div className="animate-in fade-in space-y-3 rounded-lg border p-4 sm:p-5">
            <div className="flex items-start gap-2">
              <Sparkles className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Generate with AI</p>
                  <p className="text-muted-foreground text-xs">
                    Describe what you want your agent to do, and AI will
                    generate the context prompt and first message for you.
                  </p>
                </div>

                <p className="text-muted-foreground text-xs italic">
                  Example: &quot;Your name is {name || 'Sarah'} and you work for
                  Helping Hands Charity. You&apos;re calling donors to invite
                  them to the Annual Fundraising Gala event.&quot;
                </p>

                <Textarea
                  placeholder="Describe your agent's role and purpose..."
                  value={aiDescription}
                  onChange={(e) => setAiDescription(e.target.value)}
                  className="min-h-[100px] resize-y text-sm"
                  rows={4}
                />

                <Button
                  type="button"
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating || !aiDescription.trim()}
                  className="w-full"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Spinner className="mr-2 h-3 w-3" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-3 w-3" />
                      Generate Prompts
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {onFirstMessageChange && (
          <div className="animate-in fade-in space-y-2 duration-300">
            <label className="block text-xs font-semibold sm:text-sm">
              First Message
            </label>
            <Textarea
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
          <label className="block text-xs font-semibold sm:text-sm">
            Context Prompt <span className="text-destructive">*</span>
          </label>
          <Textarea
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
