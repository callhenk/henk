import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../use-supabase';
import type { Tables } from '../../database.types';

type Integration = Tables<'integrations'>;

export interface IntegrationsFilters {
  type?: Integration['type'];
  status?: Integration['status'];
  search?: string;
}

export function useIntegrations(filters?: IntegrationsFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['integrations', filters],
    queryFn: async (): Promise<Integration[]> => {
      let query = supabase
        .from('integrations')
        .select('*')
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
  });
}

export function useIntegration(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['integration', id],
    queryFn: async (): Promise<Integration | null> => {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch integration: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}
