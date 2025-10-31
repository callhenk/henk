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
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">What industry are you in?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          This helps us tailor recommendations for your agent
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => onSelectIndustry(ind)}
            className={`rounded-lg border-2 p-3 text-left transition ${
              selectedIndustry === ind
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{ind}</span>
              {selectedIndustry === ind && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { INDUSTRIES };
