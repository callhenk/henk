import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';

type Conversation = Tables<'conversations'>;

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
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['conversations', filters, businessContext?.business_id],
    queryFn: async (): Promise<Conversation[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      // Conversations are scoped by campaign, which is scoped by business
      // We need to filter through campaigns to ensure business isolation
      let query = supabase
        .from('conversations')
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

      // Remove the campaign object from the response
      return (
        data?.map(
          ({ campaign: _, ...conversation }) =>
            conversation as unknown as Conversation,
        ) || []
      );
    },
    enabled: !!businessContext?.business_id,
  });
}

export function useConversation(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['conversation', id, businessContext?.business_id],
    queryFn: async (): Promise<Conversation | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('conversations')
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
        throw new Error(`Failed to fetch conversation: ${error.message}`);
      }

      // Remove the campaign object from the response
      // The data includes campaign for filtering, but we only want the conversation
      const { campaign: _, ...conversation } = data as Conversation & {
        campaign: { business_id: string };
      };
      return conversation;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}

export function useConversationsByCampaign(campaignId: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: [
      'conversations',
      'campaign',
      campaignId,
      businessContext?.business_id,
    ],
    queryFn: async (): Promise<Conversation[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('conversations')
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
        throw new Error(
          `Failed to fetch conversations for campaign: ${error.message}`,
        );
      }

      // Remove the campaign object from the response
      return (
        data?.map(
          ({ campaign: _, ...conversation }) =>
            conversation as unknown as Conversation,
        ) || []
      );
    },
    enabled: !!campaignId && !!businessContext?.business_id,
  });
}

export function useConversationsByLead(leadId: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['conversations', 'lead', leadId, businessContext?.business_id],
    queryFn: async (): Promise<Conversation[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('conversations')
        .select(
          `
          *,
          campaign:campaigns!inner(business_id)
        `,
        )
        .eq('lead_id', leadId)
        .eq('campaign.business_id', businessContext.business_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch conversations for lead: ${error.message}`,
        );
      }

      // Remove the campaign object from the response
      return (
        data?.map(
          ({ campaign: _, ...conversation }) =>
            conversation as unknown as Conversation,
        ) || []
      );
    },
    enabled: !!leadId && !!businessContext?.business_id,
  });
}
