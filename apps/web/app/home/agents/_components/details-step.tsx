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
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Agent Details</h3>
        <p className="text-muted-foreground">
          Tell us about your agent
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold">
            Agent Name <span className="text-destructive">*</span>
          </label>
          <Input
            placeholder="e.g., Sarah, Support Bot"
            value={name}
            onChange={(e) => {
              onNameChange(e.target.value);
              onNameEdited?.();
            }}
            className="h-11 text-base"
          />
          <p className="text-xs text-muted-foreground">
            Choose a friendly, memorable name for your agent
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">
            Main Goal <span className="text-destructive">*</span>
          </label>
          <Textarea
            placeholder="What is the primary goal of this agent? (e.g., 'Help customers with product orders')"
            className="min-h-[100px] text-base resize-none"
            value={goal}
            onChange={(e) => {
              onGoalChange(e.target.value);
              onGoalEdited?.();
            }}
          />
          <p className="text-xs text-muted-foreground">
            This helps set the agent's purpose and behavior
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold">
            Website <span className="text-muted-foreground">(Optional)</span>
          </label>
          <Input
            placeholder="https://example.com"
            value={website}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className="h-11 text-base"
          />
          <p className="text-xs text-muted-foreground">
            The website where this agent will be deployed
          </p>
        </div>

        <div className="rounded-xl border-2 border-border hover:border-primary/30 transition-colors p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="chat-only"
              checked={chatOnly}
              onCheckedChange={(checked) => onChatOnlyChange(checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="chat-only" className="text-sm font-semibold cursor-pointer block">
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
