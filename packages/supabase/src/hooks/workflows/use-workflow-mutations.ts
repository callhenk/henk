import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Workflow = TablesInsert<'workflows'>;
type WorkflowNode = TablesInsert<'workflow_nodes'>;
type WorkflowEdge = TablesInsert<'workflow_edges'>;

type CreateWorkflowData = TablesInsert<'workflows'>;
type UpdateWorkflowData = TablesUpdate<'workflows'> & { id: string };

export interface SaveWorkflowData {
  workflow: CreateWorkflowData;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export function useCreateWorkflow() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWorkflowData): Promise<Workflow> => {
      const { data: workflow, error } = await supabase
        .from('workflows')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create workflow: ${error.message}`);
      }

      return workflow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({
        queryKey: ['workflows', 'agent', data.agent_id],
      });
    },
  });
}

export function useUpdateWorkflow() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateWorkflowData): Promise<Workflow> => {
      const { id, ...updateData } = data;

      const { data: workflow, error } = await supabase
        .from('workflows')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update workflow: ${error.message}`);
      }

      return workflow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', data.id] });
      queryClient.invalidateQueries({
        queryKey: ['workflows', 'agent', data.agent_id],
      });
    },
  });
}

export function useSaveWorkflow() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SaveWorkflowData): Promise<Workflow> => {
      const { workflow, nodes, edges } = data;

      // Create or update workflow
      const { data: savedWorkflow, error: workflowError } = await supabase
        .from('workflows')
        .upsert(workflow)
        .select()
        .single();

      if (workflowError) {
        throw new Error(`Failed to save workflow: ${workflowError.message}`);
      }

      const workflowId = savedWorkflow.id;

      // Delete existing nodes and edges
      await supabase
        .from('workflow_nodes')
        .delete()
        .eq('workflow_id', workflowId);
      await supabase
        .from('workflow_edges')
        .delete()
        .eq('workflow_id', workflowId);

      // Insert new nodes
      if (nodes.length > 0) {
        const nodesWithWorkflowId = nodes.map((node) => ({
          ...node,
          workflow_id: workflowId,
        }));

        const { error: nodesError } = await supabase
          .from('workflow_nodes')
          .insert(nodesWithWorkflowId);

        if (nodesError) {
          throw new Error(
            `Failed to save workflow nodes: ${nodesError.message}`,
          );
        }
      }

      // Insert new edges
      if (edges.length > 0) {
        const edgesWithWorkflowId = edges.map((edge) => ({
          ...edge,
          workflow_id: workflowId,
        }));

        const { error: edgesError } = await supabase
          .from('workflow_edges')
          .insert(edgesWithWorkflowId);

        if (edgesError) {
          throw new Error(
            `Failed to save workflow edges: ${edgesError.message}`,
          );
        }
      }

      return savedWorkflow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow', data.id] });
      queryClient.invalidateQueries({
        queryKey: ['workflows', 'agent', data.agent_id],
      });
    },
  });
}

export function useDeleteWorkflow() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Delete nodes and edges first
      await supabase.from('workflow_nodes').delete().eq('workflow_id', id);
      await supabase.from('workflow_edges').delete().eq('workflow_id', id);

      // Delete workflow
      const { error } = await supabase.from('workflows').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete workflow: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}
