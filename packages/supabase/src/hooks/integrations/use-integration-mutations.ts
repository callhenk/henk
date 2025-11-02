import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Integration = Tables<'integrations'>;
type CreateIntegrationData = Omit<TablesInsert<'integrations'>, 'business_id'>;
type UpdateIntegrationData = TablesUpdate<'integrations'> & { id: string };

export function useCreateIntegration() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIntegrationData): Promise<Integration> => {
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

      const { data: integration, error } = await supabase
        .from('integrations')
        .insert({
          ...data,
          business_id: teamMembership.business_id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create integration: ${error.message}`);
      }

      return integration;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}

export function useUpdateIntegration() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateIntegrationData): Promise<Integration> => {
      const { id, ...updateData } = data;

      const { data: integration, error } = await supabase
        .from('integrations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update integration: ${error.message}`);
      }

      return integration;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['integration', data.id] });
    },
  });
}

export function useDeleteIntegration() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('integrations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete integration: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });
}
