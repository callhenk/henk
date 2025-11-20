import type { SupabaseClient } from '@supabase/supabase-js';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../database.types';
import { useSupabase } from '../use-supabase';

type Lead = Tables<'leads'>;
type CreateLeadData = TablesInsert<'leads'>;
type UpdateLeadData = TablesUpdate<'leads'> & { id: string };
type LeadList = Tables<'lead_lists'>;
type CreateLeadListData = TablesInsert<'lead_lists'>;
type UpdateLeadListData = TablesUpdate<'lead_lists'> & { id: string };
type CreateLeadListMemberData = TablesInsert<'lead_list_members'>;

export interface BulkCreateLeadsData {
  business_id: string;
  leads: Omit<CreateLeadData, 'business_id'>[];
}

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

export function useCreateLead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadData): Promise<Lead> => {
      // Check usage limit BEFORE creating the lead
      await checkAndEnforceLimit(supabase, data.business_id, 'contacts');
      const { data: lead, error } = await supabase
        .from('leads')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create lead: ${error.message}`);
      }

      return lead;
    },
    onSuccess: async (lead) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });

      // Increment usage for contacts
      try {
        const { error } = await supabase.rpc('increment_usage', {
          p_business_id: lead.business_id,
          p_usage_key: 'contacts',
          p_increment: 1,
        });

        if (error) {
          console.error('Failed to increment contact usage:', error);
        } else {
          queryClient.invalidateQueries({ queryKey: ['current-usage'] });
        }
      } catch (error) {
        console.error('Error incrementing usage:', error);
      }
    },
  });
}

export function useUpdateLead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLeadData): Promise<Lead> => {
      const { id, ...updateData } = data;

      const { data: lead, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update lead: ${error.message}`);
      }

      return lead;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
    },
  });
}

export function useDeleteLead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      // Get lead business_id before deleting
      const { data: lead } = await supabase
        .from('leads')
        .select('business_id')
        .eq('id', id)
        .single();

      const { error } = await supabase.from('leads').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete lead: ${error.message}`);
      }

      return lead?.business_id || '';
    },
    onSuccess: async (businessId) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });

      // Decrement usage for contacts
      if (businessId) {
        try {
          const { error } = await supabase.rpc('increment_usage', {
            p_business_id: businessId,
            p_usage_key: 'contacts',
            p_increment: -1,
          });

          if (error) {
            console.error('Failed to decrement contact usage:', error);
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

export function useBulkCreateLeads() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkCreateLeadsData): Promise<Lead[]> => {
      // Check usage limit BEFORE creating the leads (check for bulk count)
      await checkAndEnforceLimit(
        supabase,
        data.business_id,
        'contacts',
        data.leads.length,
      );

      const leadsData = data.leads.map((lead) => ({
        ...lead,
        business_id: data.business_id,
      }));

      const { data: leads, error } = await supabase
        .from('leads')
        .insert(leadsData)
        .select();

      if (error) {
        throw new Error(`Failed to create leads: ${error.message}`);
      }

      return leads || [];
    },
    onSuccess: async (leads, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });

      // Increment usage for contacts by the number of leads created
      if (leads.length > 0) {
        try {
          const { error } = await supabase.rpc('increment_usage', {
            p_business_id: variables.business_id,
            p_usage_key: 'contacts',
            p_increment: leads.length,
          });

          if (error) {
            console.error('Failed to increment contact usage:', error);
          } else {
            queryClient.invalidateQueries({ queryKey: ['current-usage'] });
          }
        } catch (error) {
          console.error('Error incrementing usage:', error);
        }
      }
    },
  });
}

// Lead List Mutations
export function useCreateLeadList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadListData): Promise<LeadList> => {
      const { data: leadList, error } = await supabase
        .from('lead_lists')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create lead list: ${error.message}`);
      }

      return leadList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
    },
  });
}

export function useUpdateLeadList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLeadListData): Promise<LeadList> => {
      const { id, ...updateData } = data;

      const { data: leadList, error } = await supabase
        .from('lead_lists')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update lead list: ${error.message}`);
      }

      return leadList;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({ queryKey: ['lead-list', data.id] });
    },
  });
}

export function useDeleteLeadList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('lead_lists').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete lead list: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
    },
  });
}

export function useAddLeadToList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadListMemberData): Promise<void> => {
      const { error } = await supabase.from('lead_list_members').insert(data);

      if (error) {
        throw new Error(`Failed to add lead to list: ${error.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({
        queryKey: ['lead-list-members', variables.lead_list_id],
      });
    },
  });
}

export function useRemoveLeadFromList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      lead_list_id: string;
      lead_id: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('lead_list_members')
        .delete()
        .eq('lead_list_id', data.lead_list_id)
        .eq('lead_id', data.lead_id);

      if (error) {
        throw new Error(`Failed to remove lead from list: ${error.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({
        queryKey: ['lead-list-members', variables.lead_list_id],
      });
    },
  });
}
