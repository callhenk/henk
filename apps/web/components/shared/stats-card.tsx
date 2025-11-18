import { LucideIcon } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    icon: LucideIcon;
    value: string;
    color?: string;
  };
  liveIndicator?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  liveIndicator,
  className,
}: StatsCardProps) {
  return (
    <Card className={`glass-panel ${className || ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="text-muted-foreground h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2">
          <p className="text-muted-foreground text-xs">{subtitle}</p>
          {liveIndicator && (
            <div className="h-1 w-1 animate-pulse rounded-full bg-green-500"></div>
          )}
          {trend && (
            <>
              <trend.icon
                className={`h-3 w-3 ${trend.color || 'text-green-500'}`}
              />
              <span className="text-muted-foreground text-xs">
                {trend.value}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
