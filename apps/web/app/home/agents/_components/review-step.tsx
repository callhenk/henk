'use client';

import { AGENT_TYPES } from './agent-types-step';

interface ReviewStepProps {
  agentType: keyof typeof AGENT_TYPES | null;
  useCase: string | null;
  industry: string | null;
  name: string;
  goal: string;
  website: string;
  chatOnly: boolean;
}

export function ReviewStep({
  agentType,
  useCase,
  industry,
  name,
  goal,
  website,
  chatOnly,
}: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Review Your Agent</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Make sure everything looks correct before creation
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-muted-foreground text-xs font-medium mb-1">AGENT TYPE</p>
          <p className="font-semibold text-base">
            {agentType ? AGENT_TYPES[agentType].name : 'Not selected'}
          </p>
        </div>

        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-muted-foreground text-xs font-medium mb-1">USE CASE</p>
          <p className="font-semibold text-base">{useCase || 'Not selected'}</p>
        </div>

        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-muted-foreground text-xs font-medium mb-1">INDUSTRY</p>
          <p className="font-semibold text-base">{industry || 'Not selected'}</p>
        </div>

        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-muted-foreground text-xs font-medium mb-1">AGENT NAME</p>
          <p className="font-semibold text-base">{name}</p>
        </div>

        <div className="rounded-lg border p-4 bg-muted/50">
          <p className="text-muted-foreground text-xs font-medium mb-1">MAIN GOAL</p>
          <p className="font-semibold text-base">{goal}</p>
        </div>

        {website && (
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-muted-foreground text-xs font-medium mb-1">WEBSITE</p>
            <p className="font-semibold text-base">{website}</p>
          </div>
        )}

        {chatOnly && (
          <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950">
            <p className="text-muted-foreground text-xs font-medium mb-1">MODE</p>
            <p className="font-semibold text-base">Chat Only (No Voice Calls)</p>
          </div>
        )}
      </div>

      <p className="text-muted-foreground text-xs mt-4">
        You can customize advanced settings and voice after creation
      </p>
    </div>
  );
}
