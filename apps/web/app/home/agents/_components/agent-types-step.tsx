'use client';

import { Check } from 'lucide-react';

const AGENT_TYPES = {
  blank: {
    name: 'Blank Agent',
    description: 'Build from scratch with full customization',
    icon: '📝',
    systemPrompt: 'You are a helpful AI assistant. Be concise and friendly in your responses.',
  },
  personal_assistant: {
    name: 'Personal Assistant',
    description: 'Manage schedules, tasks, and personal information',
    icon: '👤',
    systemPrompt: 'You are a personal assistant helping with scheduling, reminders, and task management. Be organized and proactive.',
  },
  business_agent: {
    name: 'Business Agent',
    description: 'Handle customer interactions and business operations',
    icon: '💼',
    systemPrompt: 'You are a professional business agent. Represent the company professionally and help resolve customer inquiries efficiently.',
  },
};

interface AgentTypesStepProps {
  selectedType: keyof typeof AGENT_TYPES | null;
  onSelectType: (type: keyof typeof AGENT_TYPES) => void;
}

export function AgentTypesStep({ selectedType, onSelectType }: AgentTypesStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose Agent Type</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Select a template to get started, or build from scratch
        </p>
      </div>
      <div className="grid gap-3">
        {(Object.entries(AGENT_TYPES) as Array<[keyof typeof AGENT_TYPES, typeof AGENT_TYPES.blank]>).map(([key, template]) => (
          <button
            key={key}
            onClick={() => onSelectType(key)}
            className={`rounded-lg border-2 p-4 text-left transition ${
              selectedType === key
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl mt-1">{template.icon}</span>
              <div className="flex-1">
                <div className="font-semibold text-base">{template.name}</div>
                <div className="text-muted-foreground text-sm">
                  {template.description}
                </div>
              </div>
              {selectedType === key && (
                <Check className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { AGENT_TYPES };
