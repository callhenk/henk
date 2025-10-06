import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';

type Campaign = Tables<'campaigns'>['Row'];

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
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['campaigns', filters, businessContext?.business_id],
    queryFn: async (): Promise<Campaign[]> => {
      // Return empty array if no business context (not authenticated or no business membership)
      if (!businessContext?.business_id) {
        return [];
      }

      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('business_id', businessContext.business_id)
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
    // Only fetch when we have business context
    enabled: !!businessContext?.business_id,
  });
}

export function useCampaign(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['campaign', id, businessContext?.business_id],
    queryFn: async (): Promise<Campaign | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch campaign: ${error.message}`);
      }

      return data;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}
