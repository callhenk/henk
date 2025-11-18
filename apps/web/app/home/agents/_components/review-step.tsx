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
        <h3 className="text-xl font-bold sm:text-2xl">Review Your Agent</h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Make sure everything looks correct before creation
        </p>
      </div>

      <div className="animate-in fade-in space-y-2 duration-300 sm:space-y-3">
        {/* Agent Type */}
        <div className="border-border from-background to-muted/30 hover:border-primary/20 rounded-xl border-2 bg-gradient-to-br p-3 transition-colors duration-200 sm:p-5">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Agent Type
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl">
              {agentType ? AGENT_TYPES[agentType].icon : '❓'}
            </span>
            <p className="text-sm font-bold sm:text-lg">
              {agentType ? AGENT_TYPES[agentType].name : 'Not selected'}
            </p>
          </div>
        </div>

        {/* Use Case */}
        <div className="border-border from-background to-muted/30 hover:border-primary/20 rounded-xl border-2 bg-gradient-to-br p-3 transition-colors duration-200 sm:p-5">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Use Case
          </p>
          <p className="text-sm font-bold sm:text-lg">
            {useCase || '(Not selected)'}
          </p>
        </div>

        {/* Industry */}
        <div className="border-border from-background to-muted/30 hover:border-primary/20 rounded-xl border-2 bg-gradient-to-br p-3 transition-colors duration-200 sm:p-5">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Industry
          </p>
          <p className="text-sm font-bold sm:text-lg">
            {industry || '(Not selected)'}
          </p>
        </div>

        {/* Agent Name */}
        <div className="border-border from-background to-muted/30 hover:border-primary/20 rounded-xl border-2 bg-gradient-to-br p-3 transition-colors duration-200 sm:p-5">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Agent Name
          </p>
          <p className="text-sm font-bold sm:text-lg">
            {name || '(Not provided)'}
          </p>
        </div>

        {/* Context Prompt */}
        <div className="border-border from-background to-muted/30 hover:border-primary/20 rounded-xl border-2 bg-gradient-to-br p-3 transition-colors duration-200 sm:p-5">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Context Prompt
          </p>
          <p className="text-foreground line-clamp-3 text-xs font-semibold whitespace-pre-wrap sm:line-clamp-none sm:text-base">
            {contextPrompt || '(Not provided)'}
          </p>
        </div>

        {/* Starting Message */}
        <div className="border-border from-background to-muted/30 hover:border-primary/20 rounded-xl border-2 bg-gradient-to-br p-3 transition-colors duration-200 sm:p-5">
          <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wider uppercase">
            Starting Message
          </p>
          <p className="text-foreground line-clamp-2 text-xs font-semibold sm:line-clamp-none sm:text-base">
            {startingMessage || '(Not provided)'}
          </p>
        </div>
      </div>

      <div className="bg-primary/5 border-primary/10 rounded-lg border p-3 sm:p-4">
        <p className="text-primary/80 text-xs font-medium sm:text-sm">
          ✨ You can customize advanced settings and voice configuration after
          creation
        </p>
      </div>
    </div>
  );
}
