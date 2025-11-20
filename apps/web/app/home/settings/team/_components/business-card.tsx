import type { Tables } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Card } from '@kit/ui/card';
import { Check } from 'lucide-react';

type Business = Tables<'businesses'>;

interface BusinessCardProps {
  business: Business;
  isSelected: boolean;
  onClick: () => void;
}

export function BusinessCard({
  business,
  isSelected,
  onClick,
}: BusinessCardProps) {
  return (
    <Card
      className={`group relative cursor-pointer border-2 bg-card transition-all duration-200 hover:shadow-lg ${
        isSelected
          ? 'border-primary shadow-md ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50'
      }`}
      onClick={onClick}
    >
      <div className="relative p-5 sm:p-6">
        {/* Active badge - top right */}
        <div className="absolute right-4 top-4">
          <Badge
            variant={business.status === 'active' ? 'default' : 'secondary'}
            className="text-xs font-medium"
          >
            {business.status}
          </Badge>
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="bg-primary absolute left-4 top-4 flex h-5 w-5 items-center justify-center rounded-full">
            <Check className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
        )}

        {/* Content */}
        <div className="space-y-3 pt-2">
          <h3 className="text-foreground pr-20 text-lg font-semibold tracking-tight sm:text-xl">
            {business.name}
          </h3>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {business.description || 'No description provided'}
          </p>
        </div>
      </div>
    </Card>
  );
}
