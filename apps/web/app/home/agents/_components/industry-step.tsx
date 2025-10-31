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
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold">What industry are you in?</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          This helps us tailor recommendations for your agent
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => onSelectIndustry(ind)}
            className={`rounded-xl border-2 p-3 sm:p-4 text-left transition-all duration-300 ease-in-out transform hover:scale-[1.03] active:scale-[0.97] font-medium ${
              selectedIndustry === ind
                ? 'border-primary bg-gradient-to-br from-primary/15 to-primary/5 shadow-md shadow-primary/15 scale-[1.03]'
                : 'border-border hover:border-primary/30 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm">{ind}</span>
              {selectedIndustry === ind && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 animate-in zoom-in duration-300">
                  <Check className="h-3 w-3 text-primary-foreground animate-in zoom-in duration-200 delay-75" />
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
