import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';

type Lead = Tables<'leads'>['Row'];

export interface LeadsFilters {
  campaign_id?: string;
  status?: Lead['status'];
  search?: string;
  has_email?: boolean;
  has_phone?: boolean;
}

export function useLeads(filters?: LeadsFilters) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['leads', filters, businessContext?.business_id],
    queryFn: async (): Promise<Lead[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      // Leads are scoped by campaign, which is scoped by business
      // We need to filter through campaigns to ensure business isolation
      let query = supabase
        .from('leads')
        .select(
          `
          *,
          campaign:campaigns!inner(business_id)
        `,
        )
        .eq('campaign.business_id', businessContext.business_id)
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

      // Remove the campaign object from the response since we only used it for filtering
      return (
        data?.map(({ campaign: _, ...lead }) => lead as unknown as Lead) || []
      );
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
        .select(
          `
          *,
          campaign:campaigns!inner(business_id)
        `,
        )
        .eq('id', id)
        .eq('campaign.business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch lead: ${error.message}`);
      }

      // Remove the campaign object from the response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { campaign, ...lead } = data;
      return lead as Lead;
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
        .select(
          `
          *,
          campaign:campaigns!inner(business_id)
        `,
        )
        .eq('campaign_id', campaignId)
        .eq('campaign.business_id', businessContext.business_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch leads for campaign: ${error.message}`);
      }

      // Remove the campaign object from the response
      return (
        data?.map(({ campaign: _, ...lead }) => lead as unknown as Lead) || []
      );
    },
    enabled: !!campaignId && !!businessContext?.business_id,
  });
}
