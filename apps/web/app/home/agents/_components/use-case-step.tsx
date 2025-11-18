'use client';

import {
  BarChart,
  BookOpen,
  Calendar,
  CreditCard,
  Headphones,
  Heart,
  HelpCircle,
  Info,
  PartyPopper,
  Phone,
  TrendingUp,
  Users,
} from 'lucide-react';

const USE_CASES = [
  {
    id: 'customer_support',
    label: 'Customer Support',
    icon: Headphones,
  },
  {
    id: 'outbound_sales',
    label: 'Outbound Fundraising',
    icon: TrendingUp,
  },
  {
    id: 'learning_development',
    label: 'Learning and Development',
    icon: BookOpen,
  },
  {
    id: 'scheduling',
    label: 'Scheduling',
    icon: Calendar,
  },
  {
    id: 'lead_qualification',
    label: 'Lead Qualification',
    icon: Users,
  },
  {
    id: 'answering_service',
    label: 'Answering Service',
    icon: Phone,
  },
  {
    id: 'volunteer_coordination',
    label: 'Volunteer Coordination',
    icon: Users,
  },
  {
    id: 'donation_processing',
    label: 'Donation Processing',
    icon: CreditCard,
  },
  {
    id: 'program_information',
    label: 'Program Information',
    icon: Info,
  },
  {
    id: 'event_management',
    label: 'Event Management',
    icon: PartyPopper,
  },
  {
    id: 'beneficiary_support',
    label: 'Beneficiary Support',
    icon: Heart,
  },
  {
    id: 'impact_reporting',
    label: 'Impact Reporting',
    icon: BarChart,
  },
  {
    id: 'other',
    label: 'Other',
    icon: HelpCircle,
  },
];

interface UseCaseStepProps {
  selectedUseCase: string | null;
  onSelectUseCase: (useCase: string) => void;
}

export function UseCaseStep({
  selectedUseCase,
  onSelectUseCase,
}: UseCaseStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl font-bold sm:text-2xl">Use case</h3>
        <p className="text-muted-foreground text-sm sm:text-base">
          What will your agent help with?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {USE_CASES.map((useCase, index) => {
          const Icon = useCase.icon;
          const isSelected = selectedUseCase === useCase.id;

          return (
            <button
              key={useCase.id}
              onClick={() => onSelectUseCase(useCase.id)}
              style={{ animationDelay: `${index * 30}ms` }}
              className={`animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 transition-all duration-300 sm:gap-4 sm:p-6 ${
                isSelected
                  ? 'border-primary bg-primary/5 scale-105 shadow-md'
                  : useCase.id === 'other'
                    ? 'border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30 border-dashed hover:scale-105'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50 hover:scale-105'
              }`}
            >
              <div
                className={`rounded-full p-3 transition-all duration-300 ${
                  isSelected ? 'bg-primary/10 scale-110' : 'bg-muted'
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-all duration-300 sm:h-6 sm:w-6 ${
                    isSelected
                      ? 'text-primary scale-110'
                      : 'text-muted-foreground'
                  }`}
                />
              </div>
              <span
                className={`text-center text-xs leading-tight font-medium transition-colors duration-300 sm:text-sm ${
                  isSelected ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {useCase.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { USE_CASES };
