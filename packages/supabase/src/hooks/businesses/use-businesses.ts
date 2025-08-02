import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Business = Tables<'businesses'>['Row'];

export interface BusinessesFilters {
  status?: Business['status'];
  search?: string;
}

export function useBusinesses(filters?: BusinessesFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['businesses', filters],
    queryFn: async (): Promise<Business[]> => {
      let query = supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch businesses: ${error.message}`);
      }

      return data || [];
    },
  });
}

export function useBusiness(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['business', id],
    queryFn: async (): Promise<Business | null> => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch business: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}

export function useUserBusinesses() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['user-businesses'],
    queryFn: async (): Promise<Business[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('businesses')
        .select(
          `
          *,
          team_members!inner(user_id)
        `,
        )
        .eq('team_members.user_id', user.id)
        .eq('team_members.status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch user businesses: ${error.message}`);
      }

      return data || [];
    },
  });
}
