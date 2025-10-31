'use client';

import { Checkbox } from '@kit/ui/checkbox';
import { Input } from '@kit/ui/input';
import { Textarea } from '@kit/ui/textarea';

interface DetailsStepProps {
  name: string;
  onNameChange: (name: string) => void;
  goal: string;
  onGoalChange: (goal: string) => void;
  website: string;
  onWebsiteChange: (website: string) => void;
  chatOnly: boolean;
  onChatOnlyChange: (chatOnly: boolean) => void;
}

export function DetailsStep({
  name,
  onNameChange,
  goal,
  onGoalChange,
  website,
  onWebsiteChange,
  chatOnly,
  onChatOnlyChange,
}: DetailsStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Agent Details</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Tell us about your agent
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Agent Name *
        </label>
        <Input
          placeholder="e.g., Sarah, Support Bot"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Main Goal *
        </label>
        <Textarea
          placeholder="What is the primary goal of this agent?"
          className="min-h-[80px]"
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Website (Optional)
        </label>
        <Input
          placeholder="https://example.com"
          value={website}
          onChange={(e) => onWebsiteChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2 rounded-lg border p-3">
        <Checkbox
          id="chat-only"
          checked={chatOnly}
          onCheckedChange={(checked) => onChatOnlyChange(checked as boolean)}
        />
        <label htmlFor="chat-only" className="text-sm font-medium cursor-pointer">
          Chat only (disable voice calls)
        </label>
      </div>
    </div>
  );
}
