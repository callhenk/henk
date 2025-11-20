import type { Tables } from '@kit/supabase/database';
import { Badge } from '@kit/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';

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
      className={`glass-panel cursor-pointer border transition-all hover:shadow-md ${
        isSelected ? 'ring-primary ring-2' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">
            {business.name}
          </CardTitle>
          <Badge
            variant={business.status === 'active' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {business.status}
          </Badge>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          {business.description || 'No description'}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
