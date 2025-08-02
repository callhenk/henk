import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Conversation = Tables<'conversations'>['Row'];

export interface ConversationsFilters {
  campaign_id?: string;
  agent_id?: string;
  lead_id?: string;
  status?: Conversation['status'];
  date_range?: {
    start_date: string;
    end_date: string;
  };
}

export function useConversations(filters?: ConversationsFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: async (): Promise<Conversation[]> => {
      let query = supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }

      if (filters?.agent_id) {
        query = query.eq('agent_id', filters.agent_id);
      }

      if (filters?.lead_id) {
        query = query.eq('lead_id', filters.lead_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start_date)
          .lte('created_at', filters.date_range.end_date);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch conversations: ${error.message}`);
      }

      return data || [];
    },
  });
}

export function useConversation(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['conversation', id],
    queryFn: async (): Promise<Conversation | null> => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch conversation: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}

export function useConversationsByCampaign(campaignId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['conversations', 'campaign', campaignId],
    queryFn: async (): Promise<Conversation[]> => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch conversations for campaign: ${error.message}`,
        );
      }

      return data || [];
    },
    enabled: !!campaignId,
  });
}

export function useConversationsByLead(leadId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['conversations', 'lead', leadId],
    queryFn: async (): Promise<Conversation[]> => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch conversations for lead: ${error.message}`,
        );
      }

      return data || [];
    },
    enabled: !!leadId,
  });
}
