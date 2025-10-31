'use client';

import { Check } from 'lucide-react';

const USE_CASES = {
  customer_support: {
    category: 'Customer Support',
    icon: '🎯',
    uses: ['FAQ Handling', 'Complaint Resolution', 'Order Tracking', 'Technical Support'],
  },
  outbound_sales: {
    category: 'Outbound Sales',
    icon: '📞',
    uses: ['Lead Qualification', 'Sales Calls', 'Product Demos', 'Appointment Setting'],
  },
  learning_development: {
    category: 'Learning & Development',
    icon: '📚',
    uses: ['Online Tutoring', 'Course Q&A', 'Skill Training', 'Assessment Assistance'],
  },
  hr_recruiting: {
    category: 'HR & Recruiting',
    icon: '👥',
    uses: ['Interview Scheduling', 'Candidate Screening', 'Onboarding Support', 'Benefits Q&A'],
  },
  healthcare: {
    category: 'Healthcare',
    icon: '⚕️',
    uses: ['Appointment Scheduling', 'Patient Intake', 'Health Info', 'Symptom Triage'],
  },
  finance_banking: {
    category: 'Finance & Banking',
    icon: '💰',
    uses: ['Account Inquiries', 'Transaction Support', 'Loan Information', 'Financial Advice'],
  },
};

interface UseCaseStepProps {
  selectedUseCase: string | null;
  onSelectUseCase: (useCase: string) => void;
}

export function UseCaseStep({ selectedUseCase, onSelectUseCase }: UseCaseStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">What will this agent do?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Select the primary use case for your agent
        </p>
      </div>
      <div className="grid gap-3">
        {(Object.entries(USE_CASES) as Array<[string, typeof USE_CASES.customer_support]>).map(([key, useCaseGroup]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <span className="text-xl">{useCaseGroup.icon}</span>
              <h4 className="font-semibold text-sm">{useCaseGroup.category}</h4>
            </div>
            <div className="space-y-2 pl-11">
              {useCaseGroup.uses.map((u) => (
                <button
                  key={u}
                  onClick={() => onSelectUseCase(u)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition ${
                    selectedUseCase === u
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{u}</span>
                    {selectedUseCase === u && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { USE_CASES };
