import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';

type Lead = Tables<'leads'>;
type LeadList = Tables<'lead_lists'>;

export interface LeadsFilters {
  campaign_id?: string;
  status?: string;
  search?: string;
  has_email?: boolean;
  has_phone?: boolean;
  source?: string;
  tags?: string[];
  do_not_call?: boolean;
  page?: number;
  pageSize?: number;
}

export interface LeadsResult {
  data: Lead[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export function useLeads(filters?: LeadsFilters) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['leads', filters, businessContext?.business_id],
    queryFn: async (): Promise<LeadsResult> => {
      // Return empty result if no business context
      if (!businessContext?.business_id) {
        return {
          data: [],
          total: 0,
          page: filters?.page ?? 0,
          pageSize: filters?.pageSize ?? 25,
          pageCount: 0,
        };
      }

      const page = filters?.page ?? 0;
      const pageSize = filters?.pageSize ?? 25;
      const from = page * pageSize;
      const to = from + pageSize - 1;

      // Build the query for fetching data
      let query = supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('business_id', businessContext.business_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.do_not_call !== undefined) {
        query = query.eq('do_not_call', filters.do_not_call);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,company.ilike.%${filters.search}%`,
        );
      }

      if (filters?.has_email === true) {
        query = query.not('email', 'is', null);
      }

      if (filters?.has_phone === true) {
        query = query.not('phone', 'is', null);
      }

      // Apply pagination
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Failed to fetch leads: ${error.message}`);
      }

      const total = count ?? 0;
      const pageCount = Math.ceil(total / pageSize);

      return {
        data: data || [],
        total,
        page,
        pageSize,
        pageCount,
      };
    },
    enabled: !!businessContext?.business_id,
  });
}

export function useLead(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['lead', id, businessContext?.business_id],
    queryFn: async (): Promise<Lead | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch lead: ${error.message}`);
      }

      return data;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}

export function useLeadsByCampaign(campaignId: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['leads', 'campaign', campaignId, businessContext?.business_id],
    queryFn: async (): Promise<Lead[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('business_id', businessContext.business_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch leads for campaign: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!campaignId && !!businessContext?.business_id,
  });
}

export function useLeadLists() {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['lead-lists', businessContext?.business_id],
    queryFn: async (): Promise<LeadList[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('lead_lists')
        .select('*')
        .eq('business_id', businessContext.business_id)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch lead lists: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!businessContext?.business_id,
  });
}

export function useLeadList(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['lead-list', id, businessContext?.business_id],
    queryFn: async (): Promise<LeadList | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('lead_lists')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch lead list: ${error.message}`);
      }

      return data;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}

export function useLeadListMembers(listId: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['lead-list-members', listId, businessContext?.business_id],
    queryFn: async (): Promise<Lead[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('lead_list_members')
        .select('lead_id, leads(*)')
        .eq('lead_list_id', listId);

      if (error) {
        throw new Error(`Failed to fetch lead list members: ${error.message}`);
      }

      // Extract leads from the join result
      return (data || [])
        .map((item: { lead_id: string; leads: Lead | null }) => item.leads)
        .filter((lead): lead is Lead => lead !== null);
    },
    enabled: !!listId && !!businessContext?.business_id,
  });
}
