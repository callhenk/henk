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
