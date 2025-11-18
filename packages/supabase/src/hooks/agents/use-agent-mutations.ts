import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Agent = Tables<'agents'>;
type CreateAgentData = Omit<TablesInsert<'agents'>, 'business_id'>;
type UpdateAgentData = TablesUpdate<'agents'> & { id: string };

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
