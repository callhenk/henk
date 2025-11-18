/**
 * Transform utilities for converting between ReactFlow format and database format
 */
import type { Edge, Node } from 'reactflow';

import type { Json, Tables, TablesInsert } from '~/lib/database.types';

type WorkflowNode = Tables<'workflow_nodes'>;
type WorkflowEdge = Tables<'workflow_edges'>;
type WorkflowNodeInsert = TablesInsert<'workflow_nodes'>;
type WorkflowEdgeInsert = TablesInsert<'workflow_edges'>;

/**
 * Convert ReactFlow nodes to database format for insertion
 * Omits workflow_id as it will be added by the mutation
 */
export function reactFlowNodesToDbNodes(
  nodes: Node[],
): Omit<WorkflowNodeInsert, 'workflow_id'>[] {
  return nodes.map((node) => ({
    node_id: node.id,
    type: node.type as 'start' | 'decision' | 'action' | 'end',
    position_x: node.position.x,
    position_y: node.position.y,
    data: node.data as Json,
  }));
}

/**
 * Convert database nodes to ReactFlow format
 */
export function dbNodesToReactFlowNodes(nodes: WorkflowNode[]): Node[] {
  return nodes.map((node) => ({
    id: node.node_id,
    type: node.type,
    position: {
      x: node.position_x,
      y: node.position_y,
    },
    data: node.data as Record<string, unknown>,
  }));
}

/**
 * Convert ReactFlow edges to database format for insertion
 * Omits workflow_id as it will be added by the mutation
 */
export function reactFlowEdgesToDbEdges(
  edges: Edge[],
): Omit<WorkflowEdgeInsert, 'workflow_id'>[] {
  return edges.map((edge) => ({
    edge_id: edge.id,
    source_node_id: edge.source,
    target_node_id: edge.target,
    source_handle: edge.sourceHandle || null,
    target_handle: edge.targetHandle || null,
    label: edge.label?.toString() || null,
    condition: null, // Future: add condition logic
  }));
}

/**
 * Convert database edges to ReactFlow format
 */
export function dbEdgesToReactFlowEdges(edges: WorkflowEdge[]): Edge[] {
  return edges.map((edge) => ({
    id: edge.edge_id,
    source: edge.source_node_id,
    target: edge.target_node_id,
    sourceHandle: edge.source_handle,
    targetHandle: edge.target_handle,
    type: 'smoothstep',
    animated: true,
    label: edge.label || undefined,
    style: {
      stroke:
        edge.label === 'Yes'
          ? '#10b981'
          : edge.label === 'No'
            ? '#ef4444'
            : '#3b82f6',
      strokeWidth: 2,
    },
  }));
}
