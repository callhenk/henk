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
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">What will this agent do?</h3>
        <p className="text-muted-foreground">
          Select the primary use case for your agent
        </p>
      </div>
      <div className="space-y-6">
        {(Object.entries(USE_CASES) as Array<[string, typeof USE_CASES.customer_support]>).map(([key, useCaseGroup]) => (
          <div key={key} className="space-y-3">
            <div className="flex items-center gap-3 px-3 py-2">
              <span className="text-2xl">{useCaseGroup.icon}</span>
              <h4 className="font-bold text-base">{useCaseGroup.category}</h4>
            </div>
            <div className="space-y-2 pl-12">
              {useCaseGroup.uses.map((u) => (
                <button
                  key={u}
                  onClick={() => onSelectUseCase(u)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
                    selectedUseCase === u
                      ? 'border-primary bg-gradient-to-r from-primary/10 to-transparent shadow-md shadow-primary/10'
                      : 'border-border hover:border-primary/30 hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{u}</span>
                    {selectedUseCase === u && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
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
