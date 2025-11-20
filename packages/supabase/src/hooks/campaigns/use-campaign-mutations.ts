import type { SupabaseClient } from '@supabase/supabase-js';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../database.types';
import { useSupabase } from '../use-supabase';

type Campaign = Tables<'campaigns'>;
type CreateCampaignData = Omit<TablesInsert<'campaigns'>, 'business_id'>;
type UpdateCampaignData = TablesUpdate<'campaigns'> & { id: string };

/**
 * Default free plan limits (used when no subscription exists)
 */
const DEFAULT_FREE_LIMITS: Record<string, number> = {
  agents: 3,
  campaigns: 5,
  contacts: 100,
  team_members: 3,
  integrations: 2,
};

/**
 * Check usage limit before creating a resource
 */
async function checkAndEnforceLimit(
  supabase: SupabaseClient<Database>,
  businessId: string,
  limitKey: string,
  increment: number = 1,
): Promise<void> {
  // Get subscription and plan
  const { data: subscription, error: subError } = await supabase
    .from('business_subscriptions')
    .select(
      `
      *,
      plan:billing_plans(*)
    `,
    )
    .eq('business_id', businessId)
    .single();

  // Determine the limit to use
  let limit: number;

  if (subError || !subscription || !subscription.plan) {
    // No subscription: use default free plan limits
    limit = DEFAULT_FREE_LIMITS[limitKey] ?? 999999;
  } else {
    // Has subscription: use plan limits
    const plan = Array.isArray(subscription.plan)
      ? subscription.plan[0]
      : subscription.plan;
    limit =
      ((plan?.limits as Record<string, unknown>)?.[limitKey] as number) ??
      999999;
  }

  // Get current usage (count actual records if no subscription)
  let currentUsage = 0;

  if (!subscription) {
    // No subscription: count actual resources from database
    if (limitKey === 'agents') {
      const { count } = await supabase
        .from('agents')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);
      currentUsage = count ?? 0;
    } else if (limitKey === 'campaigns') {
      const { count } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);
      currentUsage = count ?? 0;
    } else if (limitKey === 'contacts') {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId);
      currentUsage = count ?? 0;
    } else if (limitKey === 'team_members') {
      const { count } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'active');
      currentUsage = count ?? 0;
    }
  } else {
    // Has subscription: use usage_records table
    const { data: usage } = await supabase
      .from('usage_records')
      .select('*')
      .eq('business_id', businessId)
      .eq('period_start', subscription.current_period_start)
      .eq('period_end', subscription.current_period_end)
      .single();

    currentUsage =
      ((usage?.usage_data as Record<string, unknown>)?.[limitKey] as number) ??
      0;
  }

  // Check if limit would be exceeded
  if (currentUsage + increment > limit) {
    const error = new Error(
      `You have reached your ${limitKey} limit of ${limit}. Current usage: ${currentUsage}. Please upgrade your plan to continue.`,
    );
    error.name = 'UsageLimitExceededError';
    throw error;
  }
}

export function useCreateCampaign() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaignData): Promise<Campaign> => {
      // Get the current user's business_id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the user's active business
      const { data: teamMembership } = await supabase
        .from('team_members')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!teamMembership) {
        throw new Error('No active business found for user');
      }

      // Check usage limit BEFORE creating the campaign
      await checkAndEnforceLimit(
        supabase,
        teamMembership.business_id,
        'campaigns',
      );

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          ...data,
          business_id: teamMembership.business_id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create campaign: ${error.message}`);
      }

      return campaign;
    },
    onSuccess: async (campaign) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      // Increment usage for campaigns
      try {
        const { error } = await supabase.rpc('increment_usage', {
          p_business_id: campaign.business_id,
          p_usage_key: 'campaigns',
          p_increment: 1,
        });

        if (error) {
          console.error('Failed to increment campaign usage:', error);
        } else {
          queryClient.invalidateQueries({ queryKey: ['current-usage'] });
        }
      } catch (error) {
        console.error('Error incrementing usage:', error);
      }
    },
  });
}

export function useUpdateCampaign() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCampaignData): Promise<Campaign> => {
      const { id, ...updateData } = data;

      const { data: campaign, error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update campaign: ${error.message}`);
      }

      return campaign;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign', data.id] });
    },
  });
}

export function useDeleteCampaign() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      // Get campaign business_id before deleting
      const { data: campaign } = await supabase
        .from('campaigns')
        .select('business_id')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('campaigns').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete campaign: ${error.message}`);
      }

      return campaign?.business_id || '';
    },
    onSuccess: async (businessId) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });

      // Decrement usage for campaigns
      if (businessId) {
        try {
          const { error } = await supabase.rpc('increment_usage', {
            p_business_id: businessId,
            p_usage_key: 'campaigns',
            p_increment: -1,
          });

          if (error) {
            console.error('Failed to decrement campaign usage:', error);
          } else {
            queryClient.invalidateQueries({ queryKey: ['current-usage'] });
          }
        } catch (error) {
          console.error('Error decrementing usage:', error);
        }
      }
    },
  });
}
