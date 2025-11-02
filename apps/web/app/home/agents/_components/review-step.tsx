'use client';

import { AGENT_TYPES } from './agent-types-step';

interface ReviewStepProps {
  agentType: keyof typeof AGENT_TYPES | null;
  useCase: string | null;
  industry: string | null;
  name: string;
  contextPrompt: string;
  startingMessage: string;
}

export function ReviewStep({
  agentType,
  useCase,
  industry,
  name,
  contextPrompt,
  startingMessage,
}: ReviewStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold">Review Your Agent</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Make sure everything looks correct before creation
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3 animate-in fade-in duration-300">
        {/* Agent Type */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agent Type</p>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">{agentType ? AGENT_TYPES[agentType].icon : '❓'}</span>
            <p className="font-bold text-sm sm:text-lg">
              {agentType ? AGENT_TYPES[agentType].name : 'Not selected'}
            </p>
          </div>
        </div>

        {/* Use Case */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Use Case</p>
          <p className="font-bold text-sm sm:text-lg">{useCase || '(Not selected)'}</p>
        </div>

        {/* Industry */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Industry</p>
          <p className="font-bold text-sm sm:text-lg">{industry || '(Not selected)'}</p>
        </div>

        {/* Agent Name */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agent Name</p>
          <p className="font-bold text-sm sm:text-lg">{name || '(Not provided)'}</p>
        </div>

        {/* Context Prompt */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Context Prompt</p>
          <p className="font-semibold text-xs sm:text-base text-foreground whitespace-pre-wrap line-clamp-3 sm:line-clamp-none">{contextPrompt || '(Not provided)'}</p>
        </div>

        {/* Starting Message */}
        <div className="rounded-xl border-2 border-border p-3 sm:p-5 bg-gradient-to-br from-background to-muted/30 hover:border-primary/20 transition-colors duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Starting Message</p>
          <p className="font-semibold text-xs sm:text-base text-foreground line-clamp-2 sm:line-clamp-none">{startingMessage || '(Not provided)'}</p>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-primary/80 font-medium">
          ✨ You can customize advanced settings and voice configuration after creation
        </p>
      </div>
    </div>
  );
}
