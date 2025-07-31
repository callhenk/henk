import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Integration = TablesInsert<'integrations'>;
type CreateIntegrationData = TablesInsert<'integrations'>;
type UpdateIntegrationData = TablesUpdate<'integrations'> & { id: string };

export function useCreateIntegration() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIntegrationData): Promise<Integration> => {
      const { data: integration, error } = await supabase
        .from('integrations')
        .insert(data)
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
