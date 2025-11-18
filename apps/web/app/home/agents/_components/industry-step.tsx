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

export function IndustryStep({
  selectedIndustry,
  onSelectIndustry,
}: IndustryStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl font-bold sm:text-2xl">
          What industry are you in?
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          This helps us tailor recommendations for your agent
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind}
            onClick={() => onSelectIndustry(ind)}
            className={`rounded-xl border-2 p-3 text-left font-medium transition-colors duration-200 sm:p-4 ${
              selectedIndustry === ind
                ? 'border-primary from-primary/15 to-primary/5 shadow-primary/15 bg-gradient-to-br shadow-md'
                : 'border-border hover:border-primary/30 hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm">{ind}</span>
              {selectedIndustry === ind && (
                <div className="bg-primary animate-in fade-in flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full duration-200">
                  <Check className="text-primary-foreground h-3 w-3" />
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
