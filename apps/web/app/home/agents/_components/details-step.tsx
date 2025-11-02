'use client';

import { Sparkles } from 'lucide-react';

import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

interface DetailsStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onNameEdited?: () => void;
  contextPrompt: string;
  onContextPromptChange: (contextPrompt: string) => void;
  startingMessage: string;
  onStartingMessageChange: (startingMessage: string) => void;
}

export function DetailsStep({
  name,
  onNameChange,
  onNameEdited,
  contextPrompt,
  onContextPromptChange,
  startingMessage,
  onStartingMessageChange,
}: DetailsStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold">Agent Details</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review and customize your agent&apos;s configuration
        </p>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-primary/5 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs text-primary font-medium">
            AI-generated prompts based on your selections
          </span>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="space-y-2 animate-in fade-in duration-300">
          <label className="block text-xs sm:text-sm font-semibold">
            Agent Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g., Sarah, Support Bot"
            value={name}
            onChange={(e) => {
              onNameChange(e.target.value);
              onNameEdited?.();
            }}
            className="h-10 sm:h-11 text-sm sm:text-base"
          />
          <p className="text-xs text-muted-foreground">
            Choose a friendly, memorable name for your agent
          </p>
        </div>

        <div className="space-y-2 animate-in fade-in duration-300">
          <label className="block text-xs sm:text-sm font-semibold">
            Context Prompt <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="Describe the agent's purpose, behavior, and context. This guides how the agent responds to users."
            className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base resize-none"
            value={contextPrompt}
            onChange={(e) => {
              onContextPromptChange(e.target.value);
            }}
          />
          <p className="text-xs text-muted-foreground">
            The prompt or context that guides the agent&apos;s responses
          </p>
        </div>

        <div className="space-y-2 animate-in fade-in duration-300">
          <label className="block text-xs sm:text-sm font-semibold">
            Starting Message <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="e.g., 'Hi there! How can I help you today?'"
            className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-none"
            value={startingMessage}
            onChange={(e) => {
              onStartingMessageChange(e.target.value);
            }}
          />
          <p className="text-xs text-muted-foreground">
            The initial message the agent uses when starting a call
          </p>
        </div>
      </div>
    </div>
  );
}
