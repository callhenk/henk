import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Campaign = Tables<'campaigns'>;

export interface CampaignsFilters {
  status?: Campaign['status'];
  agent_id?: string;
  search?: string;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

export function useCampaigns(filters?: CampaignsFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async (): Promise<Campaign[]> => {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.agent_id) {
        query = query.eq('agent_id', filters.agent_id);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }

      if (filters?.date_range) {
        query = query
          .gte('start_date', filters.date_range.start_date)
          .lte('end_date', filters.date_range.end_date);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch campaigns: ${error.message}`);
      }

      return data || [];
    },
  });
}

export function useCampaign(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async (): Promise<Campaign | null> => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch campaign: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}
