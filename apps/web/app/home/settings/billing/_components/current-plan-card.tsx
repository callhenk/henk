'use client';

import { useState } from 'react';

import { format } from 'date-fns';
import { ArrowUpCircle, Zap } from 'lucide-react';

import { useBusinessSubscription } from '@kit/supabase/hooks/billing';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';

import { UpgradePlanDialog } from './upgrade-plan-dialog';

export function CurrentPlanCard() {
  const { data: subscription, isLoading } = useBusinessSubscription();
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);

  if (isLoading) {
    return <CurrentPlanSkeleton />;
  }

  if (!subscription) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don&apos;t have an active subscription yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Choose a Plan</Button>
        </CardContent>
      </Card>
    );
  }

  const statusColor = {
    active: 'default',
    trial: 'secondary',
    past_due: 'destructive',
    canceled: 'outline',
    expired: 'destructive',
    suspended: 'destructive',
  }[subscription.status] as 'default' | 'secondary' | 'destructive' | 'outline';

  const priceMonthly = subscription.plan.price_monthly / 100;
  const priceYearly = subscription.plan.price_yearly / 100;
  const price =
    subscription.billing_cycle === 'monthly' ? priceMonthly : priceYearly;

  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <CardTitle className="text-lg font-semibold tracking-tight">
              Current Plan
            </CardTitle>
          </div>
          {subscription.plan.name !== 'enterprise' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUpgradeDialogOpen(true)}
            >
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          )}
        </div>
        <CardDescription className="text-sm leading-relaxed">
          Your current subscription and usage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm font-medium">Plan</p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="default" className="font-medium">
                {subscription.plan.display_name}
              </Badge>
              {subscription.status === 'trial' && (
                <Badge variant="secondary" className="font-medium">
                  Trial
                </Badge>
              )}
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Status</p>
            <Badge variant={statusColor} className="mt-1.5 font-medium">
              {subscription.status.charAt(0).toUpperCase() +
                subscription.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {subscription.status === 'trial' && subscription.trial_ends_at && (
          <>
            <Separator />
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm font-medium">Trial Period</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Your trial ends on{' '}
                <span className="font-medium">
                  {format(new Date(subscription.trial_ends_at), 'MMMM d, yyyy')}
                </span>
              </p>
            </div>
          </>
        )}

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm font-medium">
              Billing Cycle
            </p>
            <p className="mt-1.5 text-sm capitalize">
              {subscription.billing_cycle}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm font-medium">Amount</p>
            <p className="mt-1.5 text-sm">
              {price === 0 ? (
                'Free'
              ) : (
                <>
                  ${price.toFixed(2)}/
                  {subscription.billing_cycle === 'monthly' ? 'month' : 'year'}
                </>
              )}
            </p>
          </div>
        </div>

        {subscription.current_period_end && price > 0 && (
          <>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Next Billing Date
                </p>
                <p className="mt-1.5 text-sm">
                  {format(
                    new Date(subscription.current_period_end),
                    'MMMM d, yyyy',
                  )}
                </p>
              </div>
              {subscription.cancel_at_period_end && (
                <div>
                  <Badge variant="outline" className="mt-1.5">
                    Cancels at period end
                  </Badge>
                </div>
              )}
            </div>
          </>
        )}

        {subscription.notes && (
          <>
            <Separator />
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-muted-foreground text-xs">
                {subscription.notes}
              </p>
            </div>
          </>
        )}
      </CardContent>

      <UpgradePlanDialog
        open={upgradeDialogOpen}
        onOpenChange={setUpgradeDialogOpen}
        currentPlanName={subscription.plan.name}
      />
    </Card>
  );
}

function CurrentPlanSkeleton() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-1.5 h-6 w-24" />
          </div>
          <div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-1.5 h-6 w-20" />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1.5 h-4 w-32" />
          </div>
          <div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-1.5 h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
