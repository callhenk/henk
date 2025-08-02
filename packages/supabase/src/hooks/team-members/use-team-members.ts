import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useSupabase } from '../use-supabase';

type TeamMember = Tables<'team_members'>['Row'];

export interface TeamMembersFilters {
  business_id?: string;
  role?: TeamMember['role'];
  status?: TeamMember['status'];
  search?: string;
}

export function useTeamMembers(filters?: TeamMembersFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['team-members', filters],
    queryFn: async (): Promise<TeamMember[]> => {
      let query = supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.business_id) {
        query = query.eq('business_id', filters.business_id);
      }

      if (filters?.role) {
        query = query.eq('role', filters.role);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`user_id.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch team members: ${error.message}`);
      }

      return data || [];
    },
  });
}

export function useTeamMember(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['team-member', id],
    queryFn: async (): Promise<TeamMember | null> => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch team member: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}

export function useTeamMembersByBusiness(businessId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['team-members', 'business', businessId],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch team members for business: ${error.message}`,
        );
      }

      return data || [];
    },
    enabled: !!businessId,
  });
}

export function useUserTeamMemberships() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['user-team-memberships'],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq(
          'user_id',
          supabase.auth.getUser().then((u) => u.data.user?.id),
        )
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch user team memberships: ${error.message}`,
        );
      }

      return data || [];
    },
  });
}
