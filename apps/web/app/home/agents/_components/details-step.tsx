'use client';

import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

interface DetailsStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onNameEdited?: () => void;
  contextPrompt: string;
  onContextPromptChange: (contextPrompt: string) => void;
  firstMessage?: string;
  onFirstMessageChange?: (firstMessage: string) => void;
}

export function DetailsStep({
  name,
  onNameChange,
  onNameEdited,
  contextPrompt,
  onContextPromptChange,
  firstMessage,
  onFirstMessageChange,
}: DetailsStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold">Agent Details</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review and customize your agent&apos;s configuration
        </p>
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

        {onFirstMessageChange && (
          <div className="space-y-2 animate-in fade-in duration-300">
            <label className="block text-xs sm:text-sm font-semibold">
              First Message
            </label>
            <Input
              placeholder="e.g., Hello! How can I help you today?"
              value={firstMessage || ''}
              onChange={(e) => {
                onFirstMessageChange(e.target.value);
              }}
              className="h-10 sm:h-11 text-sm sm:text-base"
            />
            <p className="text-xs text-muted-foreground">
              The agent&apos;s opening greeting when the call starts
            </p>
          </div>
        )}

        <div className="space-y-2 animate-in fade-in duration-300">
          <label className="block text-xs sm:text-sm font-semibold">
            Context Prompt <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="Describe the agent's purpose, behavior, and context. This guides how the agent responds to users."
            className="min-h-[250px] sm:min-h-[300px] text-sm sm:text-base resize-y"
            value={contextPrompt}
            onChange={(e) => {
              onContextPromptChange(e.target.value);
            }}
          />
          <p className="text-xs text-muted-foreground">
            The prompt or context that guides the agent&apos;s responses
          </p>
        </div>
      </div>
    </div>
  );
}
