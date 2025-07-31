import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Workflow = Tables<'workflows'>;
type WorkflowNode = Tables<'workflow_nodes'>;
type WorkflowEdge = Tables<'workflow_edges'>;

export interface WorkflowWithDetails extends Workflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface WorkflowsFilters {
  agent_id?: string;
  status?: Workflow['status'];
  is_default?: boolean;
  search?: string;
}

export function useWorkflows(filters?: WorkflowsFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['workflows', filters],
    queryFn: async (): Promise<Workflow[]> => {
      let query = supabase
        .from('workflows')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.agent_id) {
        query = query.eq('agent_id', filters.agent_id);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.is_default !== undefined) {
        query = query.eq('is_default', filters.is_default);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch workflows: ${error.message}`);
      }

      return data || [];
    },
  });
}

export function useWorkflow(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['workflow', id],
    queryFn: async (): Promise<Workflow | null> => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch workflow: ${error.message}`);
      }

      return data;
    },
    enabled: !!id,
  });
}

export function useWorkflowWithDetails(id: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['workflow', id, 'details'],
    queryFn: async (): Promise<WorkflowWithDetails | null> => {
      // Fetch workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .single();

      if (workflowError) {
        if (workflowError.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch workflow: ${workflowError.message}`);
      }

      // Fetch nodes
      const { data: nodes, error: nodesError } = await supabase
        .from('workflow_nodes')
        .select('*')
        .eq('workflow_id', id)
        .order('created_at', { ascending: true });

      if (nodesError) {
        throw new Error(
          `Failed to fetch workflow nodes: ${nodesError.message}`,
        );
      }

      // Fetch edges
      const { data: edges, error: edgesError } = await supabase
        .from('workflow_edges')
        .select('*')
        .eq('workflow_id', id)
        .order('created_at', { ascending: true });

      if (edgesError) {
        throw new Error(
          `Failed to fetch workflow edges: ${edgesError.message}`,
        );
      }

      return {
        ...workflow,
        nodes: nodes || [],
        edges: edges || [],
      };
    },
    enabled: !!id,
  });
}

export function useWorkflowsByAgent(agentId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['workflows', 'agent', agentId],
    queryFn: async (): Promise<Workflow[]> => {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch workflows for agent: ${error.message}`,
        );
      }

      return data || [];
    },
    enabled: !!agentId,
  });
}
