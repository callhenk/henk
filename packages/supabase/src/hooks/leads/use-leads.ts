import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../use-supabase';
import type { Tables } from '../../database.types';

type Lead = Tables<'leads'>;

export interface LeadsFilters {
  campaign_id?: string;
  status?: Lead['status'];
  search?: string;
  has_email?: boolean;
  has_phone?: boolean;
}

export function useLeads(filters?: LeadsFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async (): Promise<Lead[]> => {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,company.ilike.%${filters.search}%`,
        );
      }

      if (filters?.has_email === true) {
        query = query.not('email', 'is', null);
      }

      if (filters?.has_phone === true) {
        query = query.not('phone', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch leads: ${error.message}`);
      }

      return data || [];
    },
  });
}

export function useLead(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['lead', id],
    queryFn: async (): Promise<Lead | null> => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch lead: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}

export function useLeadsByCampaign(campaignId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['leads', 'campaign', campaignId],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch leads for campaign: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!campaignId,
  });
}
