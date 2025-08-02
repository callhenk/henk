import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type TeamMember = TablesInsert<'team_members'>;
type CreateTeamMemberData = TablesInsert<'team_members'>;
type UpdateTeamMemberData = TablesUpdate<'team_members'> & { id: string };

export function useCreateTeamMember() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTeamMemberData): Promise<TeamMember> => {
      const { data: teamMember, error } = await supabase
        .from('team_members')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create team member: ${error.message}`);
      }

      return teamMember;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['user-team-memberships'] });
    },
  });
}

export function useUpdateTeamMember() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateTeamMemberData): Promise<TeamMember> => {
      const { id, ...updateData } = data;

      const { data: teamMember, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update team member: ${error.message}`);
      }

      return teamMember;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-member', data.id] });
      queryClient.invalidateQueries({ queryKey: ['user-team-memberships'] });
    },
  });
}

export function useDeleteTeamMember() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete team member: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['user-team-memberships'] });
    },
  });
}
