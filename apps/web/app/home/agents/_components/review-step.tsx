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
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold">Review Your Agent</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Make sure everything looks correct before creation
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {/* Agent Type */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agent Type</p>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">{agentType ? AGENT_TYPES[agentType].icon : '❓'}</span>
            <p className="font-bold text-sm sm:text-lg">
              {agentType ? AGENT_TYPES[agentType].name : 'Not selected'}
            </p>
          </div>
        </div>

        {/* Use Case */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Use Case</p>
          <p className="font-bold text-sm sm:text-lg">{useCase || '(Not selected)'}</p>
        </div>

        {/* Industry */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Industry</p>
          <p className="font-bold text-sm sm:text-lg">{industry || '(Not selected)'}</p>
        </div>

        {/* Agent Name */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agent Name</p>
          <p className="font-bold text-sm sm:text-lg">{name || '(Not provided)'}</p>
        </div>

        {/* Main Goal */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Main Goal</p>
          <p className="font-semibold text-xs sm:text-base text-foreground line-clamp-2 sm:line-clamp-none">{goal || '(Not provided)'}</p>
        </div>

        {/* Website - Conditional */}
        {website && (
          <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Website</p>
            <p className="font-bold text-sm sm:text-lg text-primary truncate">{website}</p>
          </div>
        )}

        {/* Chat Mode - Conditional */}
        {chatOnly && (
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 p-3 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/10">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-2">Mode</p>
            <p className="font-bold text-sm sm:text-lg text-blue-900 dark:text-blue-100">Chat Only (No Voice Calls)</p>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-primary/80 font-medium">
          ✨ You can customize advanced settings and voice configuration after creation
        </p>
      </div>
    </div>
  );
}
