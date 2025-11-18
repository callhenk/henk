import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert } from '../../database.types';
import { useSupabase } from '../use-supabase';

type CampaignLeadList = Tables<'campaign_lead_lists'>;
type CreateCampaignLeadListData = TablesInsert<'campaign_lead_lists'>;

/**
 * Get all lead lists assigned to a campaign
 */
export function useCampaignLeadLists(campaignId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['campaign-lead-lists', campaignId],
    queryFn: async (): Promise<CampaignLeadList[]> => {
      const { data, error } = await supabase
        .from('campaign_lead_lists')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('priority', { ascending: true });

      if (error) {
        throw new Error(
          `Failed to fetch campaign lead lists: ${error.message}`,
        );
      }

      return data || [];
    },
    enabled: !!campaignId,
  });
}

/**
 * Assign a lead list to a campaign
 */
export function useAssignLeadListToCampaign() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCampaignLeadListData): Promise<string> => {
      // Use the database function to properly assign the list
      const { data: result, error } = await supabase.rpc(
        'add_lead_list_to_campaign',
        {
          p_campaign_id: data.campaign_id,
          p_lead_list_id: data.lead_list_id,
          p_priority: data.priority || 1,
        },
      );

      if (error) {
        throw new Error(`Failed to assign lead list: ${error.message}`);
      }

      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['campaign-lead-lists', variables.campaign_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['campaign', variables.campaign_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['leads', 'campaign', variables.campaign_id],
      });
    },
  });
}

/**
 * Remove a lead list from a campaign
 */
export function useRemoveLeadListFromCampaign() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      campaign_id: string;
      lead_list_id: string;
    }): Promise<void> => {
      // Hard delete to avoid unique constraint issues when re-adding the same list
      const { error } = await supabase
        .from('campaign_lead_lists')
        .delete()
        .eq('campaign_id', data.campaign_id)
        .eq('lead_list_id', data.lead_list_id);

      if (error) {
        throw new Error(`Failed to remove lead list: ${error.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['campaign-lead-lists', variables.campaign_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['campaign', variables.campaign_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['leads', 'campaign', variables.campaign_id],
      });
    },
  });
}

/**
 * Update campaign lead list priority
 */
export function useUpdateCampaignLeadListPriority() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      campaign_id: string;
      lead_list_id: string;
      priority: number;
    }): Promise<void> => {
      const { error } = await supabase
        .from('campaign_lead_lists')
        .update({ priority: data.priority })
        .eq('campaign_id', data.campaign_id)
        .eq('lead_list_id', data.lead_list_id);

      if (error) {
        throw new Error(`Failed to update priority: ${error.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['campaign-lead-lists', variables.campaign_id],
      });
    },
  });
}
