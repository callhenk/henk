import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Agent = TablesInsert<'agents'>;
type CreateAgentData = TablesInsert<'agents'>;
type UpdateAgentData = TablesUpdate<'agents'> & { id: string };

export function useCreateAgent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAgentData): Promise<Agent> => {
      const { data: agent, error } = await supabase
        .from('agents')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create agent: ${error.message}`);
      }

      return agent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAgentData): Promise<Agent> => {
      const { id, ...updateData } = data;

      const { data: agent, error } = await supabase
        .from('agents')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update agent: ${error.message}`);
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
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('agents').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete agent: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
