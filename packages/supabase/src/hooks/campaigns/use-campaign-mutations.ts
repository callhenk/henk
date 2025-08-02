import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Campaign = Tables<'campaigns'>['Row'];
type CreateCampaignData = Omit<TablesInsert<'campaigns'>, 'business_id'>;
type UpdateCampaignData = TablesUpdate<'campaigns'> & { id: string };

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
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
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete campaign: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
