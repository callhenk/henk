import { useQuery } from '@tanstack/react-query';

import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';
import type { BillingPlan } from './use-billing-plans';

/**
 * Business subscription structure
 * Note: These types will be auto-generated after running migration
 * For now, we define them manually based on the schema
 */
export interface BusinessSubscription {
  id: string;
  business_id: string;
  plan_id: string;
  status:
    | 'active'
    | 'trial'
    | 'past_due'
    | 'canceled'
    | 'expired'
    | 'suspended';
  billing_cycle: 'monthly' | 'yearly';
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  paypal_subscription_id: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Extended subscription with plan details
 */
export interface BusinessSubscriptionWithPlan extends BusinessSubscription {
  plan: BillingPlan;
}

/**
 * Hook to fetch the current business's subscription
 * This is the primary hook for accessing subscription and plan information
 */
export function useBusinessSubscription() {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['business-subscription', businessContext?.business_id],
    queryFn: async (): Promise<BusinessSubscriptionWithPlan | null> => {
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('business_subscriptions')
        .select(
          `
          *,
          plan:billing_plans(*)
        `,
        )
        .eq('business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No subscription found - create one with free plan as default
          const { data: freePlan } = await supabase
            .from('billing_plans')
            .select('id')
            .eq('name', 'free')
            .single();

          if (!freePlan) {
            throw new Error('Free plan not found in database');
          }

          // Create subscription with free plan
          const { data: newSubscription, error: createError } = await supabase
            .from('business_subscriptions')
            .insert({
              business_id: businessContext.business_id,
              plan_id: freePlan.id,
              status: 'active',
              billing_cycle: 'monthly',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
            })
            .select(
              `
              *,
              plan:billing_plans(*)
            `,
            )
            .single();

          if (createError) {
            throw new Error(
              `Failed to create default subscription: ${createError.message}`,
            );
          }

          return newSubscription as BusinessSubscriptionWithPlan;
        }
        throw new Error(
          `Failed to fetch business subscription: ${error.message}`,
        );
      }

      return data as BusinessSubscriptionWithPlan;
    },
    enabled: !!businessContext?.business_id,
  });
}

/**
 * Hook to check if the business has an active subscription
 */
export function useHasActiveSubscription() {
  const { data: subscription, isLoading } = useBusinessSubscription();

  return {
    hasActiveSubscription:
      subscription?.status === 'active' || subscription?.status === 'trial',
    subscription,
    isLoading,
  };
}

/**
 * Hook to check if the business is on a trial
 */
export function useIsOnTrial() {
  const { data: subscription, isLoading } = useBusinessSubscription();

  const isOnTrial = subscription?.status === 'trial';
  const trialEndsAt = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at)
    : null;
  const daysRemaining = trialEndsAt
    ? Math.max(
        0,
        Math.ceil(
          (trialEndsAt.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return {
    isOnTrial,
    trialEndsAt,
    daysRemaining,
    subscription,
    isLoading,
  };
}

/**
 * Hook to get the current plan details
 */
export function useCurrentPlan() {
  const { data: subscription, isLoading } = useBusinessSubscription();

  return {
    plan: subscription?.plan || null,
    subscription,
    isLoading,
  };
}

/**
 * Hook to check if a specific feature is available on the current plan
 */
export function useHasFeature(featureKey: string) {
  const { data: subscription, isLoading } = useBusinessSubscription();

  const hasFeature =
    ((subscription?.plan?.features as Record<string, unknown>)?.[
      featureKey
    ] as boolean) === true;

  return {
    hasFeature,
    plan: subscription?.plan || null,
    isLoading,
  };
}

/**
 * Hook to get a specific limit value from the current plan
 */
export function useGetLimit(limitKey: string) {
  const { data: subscription, isLoading } = useBusinessSubscription();

  const limit =
    ((subscription?.plan?.limits as Record<string, unknown>)?.[
      limitKey
    ] as number) ?? undefined;

  return {
    limit: limit ?? 0,
    plan: subscription?.plan || null,
    isLoading,
  };
}
