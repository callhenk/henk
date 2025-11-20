'use client';

import { useEffect, useState } from 'react';

import { DollarSign, RefreshCw } from 'lucide-react';

import { useAllUsageLimits, useSyncUsage } from '@kit/supabase/hooks/billing';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Progress } from '@kit/ui/progress';
import { Skeleton } from '@kit/ui/skeleton';

export function UsageLimitsCard() {
  const { limits, isLoading, usage } = useAllUsageLimits();
  const syncUsage = useSyncUsage();
  const [hasSynced, setHasSynced] = useState(false);

  // Auto-sync usage on first load if no usage record exists
  useEffect(() => {
    if (!isLoading && !usage && !hasSynced && !syncUsage.isPending) {
      syncUsage.mutate(undefined, {
        onSuccess: () => setHasSynced(true),
        onError: () => setHasSynced(true), // Don't retry on error
      });
    }
  }, [isLoading, usage, hasSynced, syncUsage]);

  const handleManualSync = () => {
    syncUsage.mutate();
  };

  if (isLoading) {
    return <UsageLimitsSkeleton />;
  }

  // Map limit keys to readable labels
  const labelMap: Record<string, string> = {
    agents: 'AI Agents',
    contacts: 'Contacts',
    calls_per_month: 'Calls/Month',
    team_members: 'Team Members',
    campaigns: 'Campaigns',
    integrations: 'Integrations',
    storage_gb: 'Storage (GB)',
    api_requests_per_day: 'API Requests/Day',
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold tracking-tight">
              Usage & Limits
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleManualSync}
            disabled={syncUsage.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 ${syncUsage.isPending ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          Monitor your usage and plan limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
        {!limits || limits.length === 0 ? (
          <div className="text-muted-foreground py-8 text-center text-sm">
            No usage limits available for your current plan.
          </div>
        ) : (
          limits.map((limit) => (
            <UsageLimitItem
              key={limit.limitKey}
              label={labelMap[limit.limitKey] || limit.limitKey}
              current={limit.currentUsage}
              max={limit.limit}
              percentage={limit.percentageUsed}
              isExceeded={limit.isExceeded}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface UsageLimitItemProps {
  label: string;
  current: number;
  max: number;
  percentage: number;
  isExceeded: boolean;
}

function UsageLimitItem({
  label,
  current,
  max,
  percentage,
  isExceeded,
}: UsageLimitItemProps) {
  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 999999) return 'Unlimited';
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toFixed(label.includes('GB') ? 1 : 0);
  };

  // Determine progress bar color
  const getProgressColor = () => {
    if (isExceeded) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-muted-foreground text-sm">
          <span className={isExceeded ? 'font-medium text-red-500' : ''}>
            {formatNumber(current)}
          </span>{' '}
          / {formatNumber(max)}
        </p>
      </div>
      <div className="relative">
        <Progress value={Math.min(percentage, 100)} className="h-2" />
        <div
          className={`absolute left-0 top-0 h-2 rounded-full transition-all ${getProgressColor()}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isExceeded && (
        <p className="text-xs text-red-500">
          Limit exceeded. Please upgrade your plan.
        </p>
      )}
      {!isExceeded && percentage >= 80 && percentage < 100 && (
        <p className="text-muted-foreground text-xs">
          Approaching limit ({percentage.toFixed(0)}% used)
        </p>
      )}
    </div>
  );
}

function UsageLimitsSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
