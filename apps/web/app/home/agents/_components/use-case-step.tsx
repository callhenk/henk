'use client';

import {
  Headphones,
  TrendingUp,
  BookOpen,
  Calendar,
  Users,
  Phone,
  Heart,
  CreditCard,
  Info,
  PartyPopper,
  BarChart,
  HelpCircle
} from 'lucide-react';

const USE_CASES = [
  {
    id: 'customer_support',
    label: 'Customer Support',
    icon: Headphones,
  },
  {
    id: 'outbound_sales',
    label: 'Outbound Sales',
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

export function UseCaseStep({ selectedUseCase, onSelectUseCase }: UseCaseStepProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold">Use case</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          What will your agent help with?
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {USE_CASES.map((useCase) => {
          const Icon = useCase.icon;
          const isSelected = selectedUseCase === useCase.id;

          return (
            <button
              key={useCase.id}
              onClick={() => onSelectUseCase(useCase.id)}
              className={`flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : useCase.id === 'other'
                  ? 'border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className={`rounded-full p-3 ${
                isSelected
                  ? 'bg-primary/10'
                  : 'bg-muted'
              }`}>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  isSelected
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`} />
              </div>
              <span className={`text-xs sm:text-sm font-medium text-center leading-tight ${
                isSelected
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}>
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
