import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';

type Integration = Tables<'integrations'>;

export interface IntegrationsFilters {
  type?: Integration['type'];
  status?: Integration['status'];
  search?: string;
}

export function useIntegrations(filters?: IntegrationsFilters) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['integrations', filters, businessContext?.business_id],
    queryFn: async (): Promise<Integration[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      let query = supabase
        .from('integrations')
        .select('*')
        .eq('business_id', businessContext.business_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

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
        throw new Error(`Failed to fetch integrations: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!businessContext?.business_id,
  });
}

export function useIntegration(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['integration', id, businessContext?.business_id],
    queryFn: async (): Promise<Integration | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch integration: ${error.message}`);
      }

      return data;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}
