import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useBusinessContext } from '../use-business-context';
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
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['workflows', filters, businessContext?.business_id],
    queryFn: async (): Promise<Workflow[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      // Workflows are scoped by agent, which is scoped by business
      // Filter through agents to ensure business isolation
      let query = supabase
        .from('workflows')
        .select(
          `
          *,
          agent:agents!inner(business_id)
        `,
        )
        .eq('agent.business_id', businessContext.business_id)
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

      // Remove the agent object from the response
      return (
        data?.map(
          ({ agent: _, ...workflow }) => workflow as unknown as Workflow,
        ) || []
      );
    },
    enabled: !!businessContext?.business_id,
  });
}

export function useWorkflow(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['workflow', id, businessContext?.business_id],
    queryFn: async (): Promise<Workflow | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('workflows')
        .select(
          `
          *,
          agent:agents!inner(business_id)
        `,
        )
        .eq('id', id)
        .eq('agent.business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch workflow: ${error.message}`);
      }

      // Remove the agent object from the response
      // The data includes agent for filtering, but we only want the workflow
      const { agent: _, ...workflow } = data as Workflow & {
        agent: { business_id: string };
      };
      return workflow;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}

export function useWorkflowWithDetails(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['workflow', id, 'details', businessContext?.business_id],
    queryFn: async (): Promise<WorkflowWithDetails | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      // Fetch workflow with business validation
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select(
          `
          *,
          agent:agents!inner(business_id)
        `,
        )
        .eq('id', id)
        .eq('agent.business_id', businessContext.business_id)
        .single();

      if (workflowError) {
        if (workflowError.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch workflow: ${workflowError.message}`);
      }

      // Remove the agent object from the response
      // The data includes agent for filtering, but we only want the workflow
      const { agent: _, ...workflow } = workflowData as Workflow & {
        agent: { business_id: string };
      };

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
        ...(workflow as Workflow),
        nodes: nodes || [],
        edges: edges || [],
      };
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}

export function useWorkflowsByAgent(agentId: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['workflows', 'agent', agentId, businessContext?.business_id],
    queryFn: async (): Promise<Workflow[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('workflows')
        .select(
          `
          *,
          agent:agents!inner(business_id)
        `,
        )
        .eq('agent_id', agentId)
        .eq('agent.business_id', businessContext.business_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(
          `Failed to fetch workflows for agent: ${error.message}`,
        );
      }

      // Remove the agent object from the response
      return (
        data?.map(
          ({ agent: _, ...workflow }) => workflow as unknown as Workflow,
        ) || []
      );
    },
    enabled: !!agentId && !!businessContext?.business_id,
  });
}
