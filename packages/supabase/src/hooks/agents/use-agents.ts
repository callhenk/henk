import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Agent = Tables<'agents'>;

export interface AgentsFilters {
  status?: Agent['status'];
  voice_type?: Agent['voice_type'];
  search?: string;
}

export function useAgents(filters?: AgentsFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['agents', filters],
    queryFn: async (): Promise<Agent[]> => {
      let query = supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.voice_type) {
        query = query.eq('voice_type', filters.voice_type);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch agents: ${error.message}`);
      }

      return data || [];
    },
  });
}

export function useAgent(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['agent', id],
    queryFn: async (): Promise<Agent | null> => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch agent: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}
