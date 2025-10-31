'use client';

import { Check } from 'lucide-react';

const INDUSTRIES = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Hospitality',
  'Telecommunications',
  'Transportation',
  'Legal Services',
  'Consulting',
  'Media & Entertainment',
  'Government',
  'Non-Profit',
  'Other',
];

interface IndustryStepProps {
  selectedIndustry: string | null;
  onSelectIndustry: (industry: string) => void;
}

export function IndustryStep({ selectedIndustry, onSelectIndustry }: IndustryStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">What industry are you in?</h3>
        <p className="text-muted-foreground">
          This helps us tailor recommendations for your agent
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => onSelectIndustry(ind)}
            className={`rounded-xl border-2 p-4 text-left transition-all duration-300 font-medium ${
              selectedIndustry === ind
                ? 'border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-md shadow-primary/15'
                : 'border-border hover:border-primary/30 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm">{ind}</span>
              {selectedIndustry === ind && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { INDUSTRIES };
