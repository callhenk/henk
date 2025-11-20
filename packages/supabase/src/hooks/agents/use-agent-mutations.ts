import type { SupabaseClient } from '@supabase/supabase-js';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../database.types';
import { useSupabase } from '../use-supabase';

type Agent = Tables<'agents'>;
type CreateAgentData = Omit<TablesInsert<'agents'>, 'business_id'>;
type UpdateAgentData = TablesUpdate<'agents'> & { id: string };

/**
 * Error thrown when a usage limit is exceeded
 */
export class UsageLimitExceededError extends Error {
  constructor(
    public limitKey: string,
    public currentUsage: number,
    public limit: number,
  ) {
    super(
      `You have reached your ${limitKey} limit of ${limit}. Current usage: ${currentUsage}. Please upgrade your plan to continue.`,
    );
    this.name = 'UsageLimitExceededError';
  }
}

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

  // If no subscription exists, allow unlimited usage (for demo accounts, seed data, etc.)
  if (subError || !subscription || !subscription.plan) {
    return; // No limits enforced
  }

  const plan = Array.isArray(subscription.plan)
    ? subscription.plan[0]
    : subscription.plan;
  const limit =
    ((plan?.limits as Record<string, unknown>)?.[limitKey] as number) ?? 999999;

  // Get current usage
  const { data: usage } = await supabase
    .from('usage_records')
    .select('*')
    .eq('business_id', businessId)
    .eq('period_start', subscription.current_period_start)
    .eq('period_end', subscription.current_period_end)
    .single();

  const currentUsage =
    ((usage?.usage_data as Record<string, unknown>)?.[limitKey] as number) ?? 0;

  // Check if limit would be exceeded
  if (currentUsage + increment > limit) {
    throw new UsageLimitExceededError(limitKey, currentUsage, limit);
  }
}

export function useCreateAgent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAgentData): Promise<Agent> => {
      // Get the current user's business context
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

      // Check usage limit BEFORE creating the agent
      await checkAndEnforceLimit(
        supabase,
        teamMembership.business_id,
        'agents',
      );

      const { data: agent, error } = await supabase
        .from('agents')
        .insert({
          ...data,
          business_id: teamMembership.business_id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create agent: ${error.message}`);
      }

      // Note: Caller ID assignment is now triggered by the caller (UI) after agent creation

      return agent;
    },
    onSuccess: async (agent) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });

      // Increment usage for agents
      try {
        const { error } = await supabase.rpc('increment_usage', {
          p_business_id: agent.business_id,
          p_usage_key: 'agents',
          p_increment: 1,
        });

        if (error) {
          console.error('Failed to increment agent usage:', error);
        } else {
          // Invalidate usage queries to refresh UI
          queryClient.invalidateQueries({ queryKey: ['current-usage'] });
        }
      } catch (error) {
        console.error('Error incrementing usage:', error);
      }
    },
  });
}

export function useUpdateAgent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAgentData): Promise<Agent> => {
      const { id, ...updateData } = data;

      // Perform the update without trying to return data
      const { error: updateError } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id);

      if (updateError) {
        throw new Error(`Failed to update agent: ${updateError.message}`);
      }

      // Fetch the updated agent separately (this respects RLS properly)
      const { data: agent, error: fetchError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(
          `Update succeeded but failed to fetch updated agent: ${fetchError.message}`,
        );
      }

      if (!agent) {
        throw new Error('Update succeeded but agent not found');
      }

      return agent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      queryClient.invalidateQueries({ queryKey: ['agent', data.id] });
    },
  });
}

export function useDeleteAgent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      // Get agent business_id before deleting
      const { data: agent } = await supabase
        .from('agents')
        .select('business_id')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('agents').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete agent: ${error.message}`);
      }

      return agent?.business_id || '';
    },
    onSuccess: async (businessId) => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });

      // Decrement usage for agents
      if (businessId) {
        try {
          const { error } = await supabase.rpc('increment_usage', {
            p_business_id: businessId,
            p_usage_key: 'agents',
            p_increment: -1,
          });

          if (error) {
            console.error('Failed to decrement agent usage:', error);
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
