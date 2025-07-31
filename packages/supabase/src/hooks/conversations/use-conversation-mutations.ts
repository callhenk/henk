import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '../use-supabase';
import type { TablesInsert, TablesUpdate } from '../../database.types';

type Conversation = TablesInsert<'conversations'>;
type CreateConversationData = TablesInsert<'conversations'>;
type UpdateConversationData = TablesUpdate<'conversations'> & { id: string };

export function useCreateConversation() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateConversationData): Promise<Conversation> => {
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create conversation: ${error.message}`);
      }

      return conversation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({
        queryKey: ['conversations', 'campaign', data.campaign_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['conversations', 'lead', data.lead_id],
      });
    },
  });
}

export function useUpdateConversation() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateConversationData): Promise<Conversation> => {
      const { id, ...updateData } = data;

      const { data: conversation, error } = await supabase
        .from('conversations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update conversation: ${error.message}`);
      }

      return conversation;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', data.id] });
      queryClient.invalidateQueries({
        queryKey: ['conversations', 'campaign', data.campaign_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['conversations', 'lead', data.lead_id],
      });
    },
  });
}

export function useDeleteConversation() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete conversation: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
