import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useSupabase } from '../use-supabase';

type AgentKnowledgeBase = Tables<'agents_knowledge_bases'>;

/**
 * Link a knowledge base to an agent
 */
export function useLinkKnowledgeBaseToAgent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      agent_id: string;
      knowledge_base_id: string;
    }): Promise<AgentKnowledgeBase> => {
      const { data: linked, error } = await supabase
        .from('agents_knowledge_bases')
        .insert({
          agent_id: data.agent_id,
          knowledge_base_id: data.knowledge_base_id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to link knowledge base to agent: ${error.message}`);
      }

      return linked;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['agent-knowledge-bases', variables.agent_id],
      });
    },
  });
}

/**
 * Unlink a knowledge base from an agent
 */
export function useUnlinkKnowledgeBaseFromAgent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      agent_id: string;
      knowledge_base_id: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('agents_knowledge_bases')
        .delete()
        .eq('agent_id', data.agent_id)
        .eq('knowledge_base_id', data.knowledge_base_id);

      if (error) {
        throw new Error(
          `Failed to unlink knowledge base from agent: ${error.message}`,
        );
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['agent-knowledge-bases', variables.agent_id],
      });
    },
  });
}

/**
 * Fetch knowledge bases linked to an agent
 */
export function useFetchAgentKnowledgeBases(agentId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['agent-knowledge-bases', agentId],
    queryFn: async () => {
      const { data: linkedKBs, error } = await supabase
        .from('agents_knowledge_bases')
        .select(
          `
          id,
          knowledge_base_id,
          created_at,
          knowledge_bases!inner(
            id,
            name,
            description,
            elevenlabs_kb_id,
            file_count,
            char_count,
            status,
            created_at
          )
        `,
        )
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch agent knowledge bases: ${error.message}`,
        );
      }

      return linkedKBs || [];
    },
    enabled: !!agentId,
  });
}
