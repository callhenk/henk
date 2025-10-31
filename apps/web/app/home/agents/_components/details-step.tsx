'use client';

import { Checkbox } from '@kit/ui/checkbox';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

interface DetailsStepProps {
  name: string;
  onNameChange: (name: string) => void;
  onNameEdited?: () => void;
  goal: string;
  onGoalChange: (goal: string) => void;
  onGoalEdited?: () => void;
  website: string;
  onWebsiteChange: (website: string) => void;
  chatOnly: boolean;
  onChatOnlyChange: (chatOnly: boolean) => void;
}

export function DetailsStep({
  name,
  onNameChange,
  onNameEdited,
  goal,
  onGoalChange,
  onGoalEdited,
  website,
  onWebsiteChange,
  chatOnly,
  onChatOnlyChange,
}: DetailsStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold">Agent Details</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Tell us about your agent
        </p>
      </div>

      <div className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
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

        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-semibold">
            Main Goal <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="What is the primary goal of this agent? (e.g., &apos;Help customers with product orders&apos;)"
            className="min-h-[80px] sm:min-h-[100px] text-sm sm:text-base resize-none"
            value={goal}
            onChange={(e) => {
              onGoalChange(e.target.value);
              onGoalEdited?.();
            }}
          />
          <p className="text-xs text-muted-foreground">
            This helps set the agent&apos;s purpose and behavior
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-semibold">
            Website <span className="text-muted-foreground">(Optional)</span>
          </label>
          <Input
            placeholder="https://example.com"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className="h-10 sm:h-11 text-sm sm:text-base"
          />
          <p className="text-xs text-muted-foreground">
            The website where this agent will be deployed
          </p>
        </div>

        <div className="rounded-xl border-2 border-border hover:border-primary/30 transition-colors p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <Checkbox
              id="chat-only"
              checked={chatOnly}
              onCheckedChange={(checked) => onChatOnlyChange(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="chat-only" className="text-xs sm:text-sm font-semibold cursor-pointer block">
                Chat Only Mode
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Disable voice calls and use text-only interactions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
