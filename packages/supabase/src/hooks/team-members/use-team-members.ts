import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';

type TeamMember = Tables<'team_members'>;

export interface TeamMembersFilters {
  business_id?: string;
  role?: TeamMember['role'];
  status?: TeamMember['status'];
  search?: string;
}

export function useTeamMembers(filters?: TeamMembersFilters) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['team-members', filters, businessContext?.business_id],
    queryFn: async (): Promise<TeamMember[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      let query = supabase
        .from('team_members')
        .select('*')
        .eq('business_id', businessContext.business_id)
        .order('created_at', { ascending: false });

      // Apply additional filters (business_id filter is always applied from context)
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
    enabled: !!businessContext?.business_id,
  });
}

export function useTeamMember(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['team-member', id, businessContext?.business_id],
    queryFn: async (): Promise<TeamMember | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch team member: ${error.message}`);
      }

      return data;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}

export function useTeamMembersByBusiness(businessId: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: [
      'team-members',
      'business',
      businessId,
      businessContext?.business_id,
    ],
    queryFn: async (): Promise<TeamMember[]> => {
      // Return empty array if no business context or trying to access different business
      if (
        !businessContext?.business_id ||
        businessId !== businessContext.business_id
      ) {
        return [];
      }

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
    enabled: !!businessId && !!businessContext?.business_id,
  });
}

export function useUserTeamMemberships() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['user-team-memberships'],
    queryFn: async (): Promise<TeamMember[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('user_id', user.id)
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
