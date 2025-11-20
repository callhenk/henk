import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';
import { useBusinessSubscription } from './use-business-subscription';

/**
 * Usage record structure
 */
export interface UsageRecord {
  id: string;
  business_id: string;
  period_start: string;
  period_end: string;
  usage_data: {
    agents?: number;
    contacts?: number;
    calls?: number;
    team_members?: number;
    campaigns?: number;
    integrations?: number;
    storage_gb?: number;
    api_requests?: number;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Usage limit check result
 */
export interface UsageLimitCheck {
  limitKey: string;
  currentUsage: number;
  limit: number;
  isExceeded: boolean;
  percentageUsed: number;
  remaining: number;
}

/**
 * Hook to get the current usage record for the business
 */
export function useCurrentUsage() {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();
  const { data: subscription } = useBusinessSubscription();

  return useQuery({
    queryKey: ['current-usage', businessContext?.business_id],
    queryFn: async (): Promise<UsageRecord | null> => {
      if (!businessContext?.business_id || !subscription) {
        return null;
      }

      // Get usage record for current billing period
      const { data, error } = await supabase
        .from('usage_records')
        .select('*')
        .eq('business_id', businessContext.business_id)
        .eq('period_start', subscription.current_period_start)
        .eq('period_end', subscription.current_period_end)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found - no usage yet
        }
        throw new Error(`Failed to fetch usage: ${error.message}`);
      }

      return data as UsageRecord;
    },
    enabled: !!businessContext?.business_id && !!subscription,
  });
}

/**
 * Hook to check if a specific usage limit has been exceeded
 */
export function useCheckUsageLimit(limitKey: string) {
  const { data: subscription } = useBusinessSubscription();
  const { data: usage } = useCurrentUsage();

  const limit =
    ((subscription?.plan?.limits as Record<string, unknown>)?.[
      limitKey
    ] as number) ?? 999999;
  const currentUsage =
    ((usage?.usage_data as Record<string, unknown>)?.[limitKey] as number) ?? 0;
  const isExceeded = currentUsage >= limit;
  const percentageUsed = limit > 0 ? (currentUsage / limit) * 100 : 0;
  const remaining = Math.max(0, limit - currentUsage);

  return {
    limitKey,
    currentUsage,
    limit,
    isExceeded,
    percentageUsed,
    remaining,
    plan: subscription?.plan || null,
    isLoading: !subscription || !usage,
  };
}

/**
 * Hook to get actual usage counts from the database
 */
export function useActualUsageCounts() {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['actual-usage-counts', businessContext?.business_id],
    queryFn: async () => {
      if (!businessContext?.business_id) {
        return null;
      }

      // Count all resources in parallel
      const [agents, contacts, teamMembers, campaigns, integrations] =
        await Promise.all([
          supabase
            .from('agents')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessContext.business_id),
          supabase
            .from('leads')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessContext.business_id),
          supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessContext.business_id)
            .eq('status', 'active'),
          supabase
            .from('campaigns')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessContext.business_id),
          supabase
            .from('integrations')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessContext.business_id)
            .eq('status', 'active'),
        ]);

      return {
        agents: agents.count ?? 0,
        contacts: contacts.count ?? 0,
        team_members: teamMembers.count ?? 0,
        campaigns: campaigns.count ?? 0,
        integrations: integrations.count ?? 0,
        storage_gb: 0, // TODO: Calculate actual storage usage
        api_requests_per_day: 0, // TODO: Calculate from logs
        calls_per_month: 0, // TODO: Calculate from current period
      };
    },
    enabled: !!businessContext?.business_id,
    staleTime: 30000, // Cache for 30 seconds
  });
}

/**
 * Hook to get all usage limits and their current status
 */
export function useAllUsageLimits() {
  const { data: subscription, isLoading: subscriptionLoading } =
    useBusinessSubscription();
  const { data: usage, isLoading: usageLoading } = useCurrentUsage();
  const { data: actualCounts, isLoading: countsLoading } =
    useActualUsageCounts();

  const limits: UsageLimitCheck[] = [];

  if (subscription?.plan?.limits) {
    Object.keys(subscription.plan.limits).forEach((key) => {
      const limitsRecord = subscription.plan.limits as Record<string, unknown>;
      // Use usage record if available, otherwise fall back to actual counts
      const usageRecord = (usage?.usage_data as Record<string, unknown>) || {};
      const actualCountsRecord = (actualCounts as Record<string, number>) || {};

      const limit = limitsRecord[key] as number;
      const currentUsage =
        (usageRecord[key] as number) ?? actualCountsRecord[key] ?? 0;
      const isExceeded = currentUsage >= limit;
      const percentageUsed = limit > 0 ? (currentUsage / limit) * 100 : 0;
      const remaining = Math.max(0, limit - currentUsage);

      limits.push({
        limitKey: key,
        currentUsage,
        limit,
        isExceeded,
        percentageUsed,
        remaining,
      });
    });
  }

  return {
    limits,
    plan: subscription?.plan || null,
    usage,
    isLoading: subscriptionLoading || usageLoading || countsLoading,
  };
}

/**
 * Hook to check if the business can perform an action based on limits
 * Returns whether the action is allowed and the reason if not
 */
export function useCanPerformAction(limitKey: string, increment: number = 1) {
  const check = useCheckUsageLimit(limitKey);

  const canPerform = check.currentUsage + increment <= check.limit;
  const reason = canPerform
    ? null
    : `You have reached your ${limitKey} limit of ${check.limit}. Please upgrade your plan to continue.`;

  return {
    canPerform,
    reason,
    ...check,
  };
}

/**
 * Hook to increment usage for a specific metric
 * This should be called after successful actions (creating an agent, making a call, etc.)
 */
export function useIncrementUsage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: businessContext } = useBusinessContext();
  const { data: subscription } = useBusinessSubscription();

  return useMutation({
    mutationFn: async ({
      limitKey,
      increment = 1,
    }: {
      limitKey: string;
      increment?: number;
    }) => {
      if (!businessContext?.business_id || !subscription) {
        throw new Error('No business context or subscription available');
      }

      // Use the database function to increment usage
      const { error } = await supabase.rpc('increment_usage', {
        p_business_id: businessContext.business_id,
        p_usage_key: limitKey,
        p_increment: increment,
      });

      if (error) {
        throw new Error(`Failed to increment usage: ${error.message}`);
      }

      return { limitKey, increment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['current-usage', businessContext?.business_id],
      });
    },
  });
}

/**
 * Hook to set usage for a specific metric to an exact value
 * This is useful when syncing actual counts (e.g., current number of agents)
 */
export function useSetUsage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: businessContext } = useBusinessContext();
  const { data: subscription } = useBusinessSubscription();

  return useMutation({
    mutationFn: async ({
      limitKey,
      value,
    }: {
      limitKey: string;
      value: number;
    }) => {
      if (!businessContext?.business_id || !subscription) {
        throw new Error('No business context or subscription available');
      }

      // Get or create usage record
      const { data: existingUsage, error: fetchError } = await supabase
        .from('usage_records')
        .select('*')
        .eq('business_id', businessContext.business_id)
        .eq('period_start', subscription.current_period_start)
        .eq('period_end', subscription.current_period_end)
        .single();

      // If error is PGRST116, it means no record exists yet - this is fine
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw new Error(`Failed to fetch usage record: ${fetchError.message}`);
      }

      const updatedUsageData = {
        ...((existingUsage?.usage_data as Record<string, number>) || {}),
        [limitKey]: value,
      };

      if (existingUsage) {
        // Update existing
        const { error } = await supabase
          .from('usage_records')
          .update({
            usage_data: updatedUsageData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingUsage.id);

        if (error) {
          throw new Error(`Failed to update usage: ${error.message}`);
        }
      } else {
        // Create new
        const { error } = await supabase.from('usage_records').insert({
          business_id: businessContext.business_id,
          period_start: subscription.current_period_start,
          period_end: subscription.current_period_end,
          usage_data: updatedUsageData,
        });

        if (error) {
          throw new Error(`Failed to create usage record: ${error.message}`);
        }
      }

      return { limitKey, value };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['current-usage', businessContext?.business_id],
      });
    },
  });
}

/**
 * Hook to sync usage with actual counts from the database
 * This should be run periodically to ensure usage records match reality
 */
export function useSyncUsage() {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();
  const setUsage = useSetUsage();

  return useMutation({
    mutationFn: async () => {
      if (!businessContext?.business_id) {
        throw new Error('No business context available');
      }

      // Count agents
      const { count: agentsCount } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessContext.business_id);

      // Count leads (contacts)
      const { count: contactsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessContext.business_id);

      // Count team members
      const { count: teamMembersCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessContext.business_id)
        .eq('status', 'active');

      // Count campaigns
      const { count: campaignsCount } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessContext.business_id);

      // Count integrations
      const { count: integrationsCount } = await supabase
        .from('integrations')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessContext.business_id)
        .eq('status', 'active');

      // Update all usage metrics
      const promises: Promise<unknown>[] = [];

      if (agentsCount !== null) {
        promises.push(
          setUsage.mutateAsync({ limitKey: 'agents', value: agentsCount }),
        );
      }
      if (contactsCount !== null) {
        promises.push(
          setUsage.mutateAsync({ limitKey: 'contacts', value: contactsCount }),
        );
      }
      if (teamMembersCount !== null) {
        promises.push(
          setUsage.mutateAsync({
            limitKey: 'team_members',
            value: teamMembersCount,
          }),
        );
      }
      if (campaignsCount !== null) {
        promises.push(
          setUsage.mutateAsync({
            limitKey: 'campaigns',
            value: campaignsCount,
          }),
        );
      }
      if (integrationsCount !== null) {
        promises.push(
          setUsage.mutateAsync({
            limitKey: 'integrations',
            value: integrationsCount,
          }),
        );
      }

      await Promise.all(promises);

      return {
        agents: agentsCount,
        contacts: contactsCount,
        team_members: teamMembersCount,
        campaigns: campaignsCount,
        integrations: integrationsCount,
      };
    },
  });
}
