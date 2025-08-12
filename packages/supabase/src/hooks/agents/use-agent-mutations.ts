import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Agent = Tables<'agents'>['Row'];
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

      // Try to automatically attach a caller ID using the first available outbound number
      // This is best-effort and failures are non-fatal
      try {
        // 1) Fetch available phone numbers
        const phoneResp = await fetch('/api/voice/phone-numbers');
        const phoneJson = await phoneResp.json().catch(() => ({}));
        if (
          phoneResp.ok &&
          phoneJson?.success &&
          Array.isArray(phoneJson.data) &&
          phoneJson.data.length > 0
        ) {
          const firstOutbound = (
            phoneJson.data as Array<{
              phone_number: string;
              supports_outbound?: boolean;
            }>
          ).find((n) => n.supports_outbound === true)?.phone_number;

          if (firstOutbound) {
            // 2) Assign caller ID to the newly created agent
            await fetch(`/api/agents/${agent.id}/assign-phone`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ caller_id: firstOutbound }),
            }).catch(() => undefined);
          }
        }
      } catch {
        // ignore auto-attach errors
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
