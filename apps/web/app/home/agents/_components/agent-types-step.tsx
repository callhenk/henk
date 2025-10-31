'use client';

import { Check } from 'lucide-react';

const AGENT_TYPES = {
  blank: {
    name: 'Blank Agent',
    description: 'Build from scratch with full customization',
    icon: '📝',
    systemPrompt: 'You are a helpful AI assistant. Be concise and friendly in your responses.',
    defaultAgentName: '',
    defaultGoal: '',
  },
  personal_assistant: {
    name: 'Personal Assistant',
    description: 'Manage schedules, tasks, and personal information',
    icon: '👤',
    systemPrompt: 'You are a personal assistant helping with scheduling, reminders, and task management. Be organized and proactive.',
    defaultAgentName: 'Assistant',
    defaultGoal: 'Help manage schedules, tasks, reminders, and personal information with organized and proactive support.',
  },
  business_agent: {
    name: 'Business Agent',
    description: 'Handle customer interactions and business operations',
    icon: '💼',
    systemPrompt: 'You are a professional business agent. Represent the company professionally and help resolve customer inquiries efficiently.',
    defaultAgentName: 'Support Agent',
    defaultGoal: 'Handle customer interactions, answer inquiries, and provide professional business support.',
  },
};

interface AgentTypesStepProps {
  selectedType: keyof typeof AGENT_TYPES | null;
  onSelectType: (type: keyof typeof AGENT_TYPES) => void;
}

export function AgentTypesStep({ selectedType, onSelectType }: AgentTypesStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold">Choose Agent Type</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          Select a template to get started, or build from scratch
        </p>
      </div>
      <div className="grid gap-3 sm:gap-4">
        {(Object.entries(AGENT_TYPES) as Array<[keyof typeof AGENT_TYPES, typeof AGENT_TYPES.blank]>).map(([key, template]) => (
          <button
            key={key}
            onClick={() => onSelectType(key)}
            className={`relative group rounded-xl border-2 p-4 sm:p-5 text-left transition-all duration-300 ${
              selectedType === key
                ? 'border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/30 hover:shadow-md hover:shadow-primary/10'
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`flex-shrink-0 rounded-lg p-2 sm:p-3 transition-all duration-300 ${
                selectedType === key
                  ? 'bg-primary/20'
                  : 'bg-muted group-hover:bg-primary/10'
              }`}>
                <span className="text-3xl sm:text-4xl">{template.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base sm:text-lg">{template.name}</div>
                <div className="text-muted-foreground text-xs sm:text-sm mt-1">
                  {template.description}
                </div>
              </div>
              {selectedType === key && (
                <div className="flex-shrink-0 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { AGENT_TYPES };
