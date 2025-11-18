'use client';

import { Check } from 'lucide-react';

const AGENT_TYPES = {
  blank: {
    name: 'Blank Agent',
    description: 'Build from scratch with full customization',
    icon: '📝',
    systemPrompt:
      'You are a helpful AI assistant. Be concise and friendly in your responses.',
    contextPrompt:
      "You are a versatile AI assistant designed to help with various tasks. Be helpful, concise, and adapt to the user's needs.",
    defaultAgentName: '',
    defaultGoal: '',
    startingMessage: 'Hi there! How can I help you today?',
  },
  personal_assistant: {
    name: 'Personal Assistant',
    description: 'Manage schedules, tasks, and personal information',
    icon: '👤',
    systemPrompt:
      'You are a personal assistant helping with scheduling, reminders, and task management. Be organized and proactive.',
    contextPrompt:
      'You are a dedicated personal assistant focused on helping users manage their daily schedules, tasks, and reminders. Your goal is to keep users organized and productive by proactively suggesting optimal time management strategies and ensuring nothing falls through the cracks.',
    defaultAgentName: 'Assistant',
    defaultGoal:
      'Help manage schedules, tasks, reminders, and personal information with organized and proactive support.',
    startingMessage:
      "Hello! I'm your personal assistant. I'm here to help you manage your schedule, tasks, and reminders. What can I help you with today?",
  },
  business_agent: {
    name: 'Business Agent',
    description: 'Handle customer interactions and business operations',
    icon: '💼',
    systemPrompt:
      'You are a professional business agent. Represent the company professionally and help resolve customer inquiries efficiently.',
    contextPrompt:
      'You are a professional business support agent representing the company. Your role is to handle customer inquiries, resolve issues efficiently, and maintain a high level of professionalism. Always prioritize customer satisfaction while adhering to company policies and guidelines.',
    defaultAgentName: 'Support Agent',
    defaultGoal:
      'Handle customer interactions, answer inquiries, and provide professional business support.',
    startingMessage: 'Thank you for contacting us! How can I assist you today?',
  },
};

interface AgentTypesStepProps {
  selectedType: keyof typeof AGENT_TYPES | null;
  onSelectType: (type: keyof typeof AGENT_TYPES) => void;
}

export function AgentTypesStep({
  selectedType,
  onSelectType,
}: AgentTypesStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl font-bold sm:text-2xl">Choose Agent Type</h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          Select a template to get started, or build from scratch
        </p>
      </div>
      <div className="grid gap-3 sm:gap-4">
        {(
          Object.entries(AGENT_TYPES) as Array<
            [keyof typeof AGENT_TYPES, typeof AGENT_TYPES.blank]
          >
        ).map(([key, template]) => (
          <button
            key={key}
            onClick={() => onSelectType(key)}
            className={`group relative rounded-xl border-2 p-4 text-left transition-colors duration-200 sm:p-5 ${
              selectedType === key
                ? 'border-primary from-primary/10 to-primary/5 shadow-primary/20 bg-gradient-to-br shadow-lg'
                : 'border-border hover:border-primary/30 hover:shadow-primary/10 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className={`flex-shrink-0 rounded-lg p-2 transition-colors duration-200 sm:p-3 ${
                  selectedType === key
                    ? 'bg-primary/20'
                    : 'bg-muted group-hover:bg-primary/10'
                }`}
              >
                <span className="text-3xl sm:text-4xl">{template.icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold sm:text-lg">
                  {template.name}
                </div>
                <div className="text-muted-foreground mt-1 text-xs sm:text-sm">
                  {template.description}
                </div>
              </div>
              {selectedType === key && (
                <div className="animate-in fade-in flex flex-shrink-0 items-center justify-center duration-200">
                  <div className="bg-primary flex h-6 w-6 items-center justify-center rounded-full">
                    <Check className="text-primary-foreground h-4 w-4" />
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
