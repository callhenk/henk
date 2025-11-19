import type { Edge, Node } from 'reactflow';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  nodeIds?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

/**
 * Validate a workflow for common issues
 */
export function validateWorkflow(
  nodes: Node[],
  edges: Edge[],
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // Check if workflow is empty
  if (nodes.length === 0) {
    return {
      isValid: false,
      issues: [
        {
          type: 'error',
          message: 'Workflow is empty. Add at least one node to get started.',
        },
      ],
    };
  }

  // Check for start node
  const startNodes = nodes.filter((node) => node.type === 'start');
  if (startNodes.length === 0) {
    issues.push({
      type: 'error',
      message: 'Workflow must have a start node.',
    });
  } else if (startNodes.length > 1) {
    issues.push({
      type: 'warning',
      message: 'Workflow has multiple start nodes. Only one will be used.',
      nodeIds: startNodes.map((n) => n.id),
    });
  }

  // Check for end node
  const endNodes = nodes.filter((node) => node.type === 'end');
  if (endNodes.length === 0) {
    issues.push({
      type: 'warning',
      message: 'Workflow should have at least one end node.',
    });
  }

  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  edges.forEach((edge) => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  const disconnectedNodes = nodes.filter((node) => {
    // Start nodes are OK to have no incoming edges
    if (node.type === 'start') {
      return !edges.some((e) => e.source === node.id);
    }
    // End nodes are OK to have no outgoing edges
    if (node.type === 'end') {
      return !edges.some((e) => e.target === node.id);
    }
    // Other nodes should be connected
    return !connectedNodeIds.has(node.id);
  });

  if (disconnectedNodes.length > 0) {
    issues.push({
      type: 'warning',
      message: `${disconnectedNodes.length} node(s) are not connected to the workflow.`,
      nodeIds: disconnectedNodes.map((n) => n.id),
    });
  }

  // Check for nodes with incomplete data
  const incompleteNodes = nodes.filter((node) => {
    if (node.type === 'action' && !node.data.action) {
      return true;
    }
    if (
      node.type === 'decision' &&
      (!node.data.options || node.data.options.length < 2)
    ) {
      return true;
    }
    if (!node.data.label || !node.data.label.trim()) {
      return true;
    }
    return false;
  });

  if (incompleteNodes.length > 0) {
    issues.push({
      type: 'error',
      message: `${incompleteNodes.length} node(s) have incomplete configuration. Click on them to edit.`,
      nodeIds: incompleteNodes.map((n) => n.id),
    });
  }

  // Check for decision nodes without multiple outgoing edges
  const decisionNodes = nodes.filter((node) => node.type === 'decision');
  decisionNodes.forEach((node) => {
    const outgoingEdges = edges.filter((e) => e.source === node.id);
    const options = node.data.options as string[] | undefined;
    const optionCount =
      options?.filter((opt: string) => opt.trim()).length || 0;

    if (outgoingEdges.length < optionCount) {
      issues.push({
        type: 'warning',
        message: `Decision node "${node.data.label}" has ${optionCount} options but only ${outgoingEdges.length} connection(s).`,
        nodeIds: [node.id],
      });
    }
  });

  // Check for cycles (simple check - detects obvious loops)
  const hasCycle = detectCycles(nodes, edges);
  if (hasCycle) {
    issues.push({
      type: 'warning',
      message:
        'Workflow contains a cycle (loop). This may cause infinite loops during execution.',
    });
  }

  return {
    isValid: issues.filter((i) => i.type === 'error').length === 0,
    issues,
  };
}

/**
 * Detect cycles in the workflow graph using DFS
 */
function detectCycles(nodes: Node[], edges: Edge[]): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const adjacencyList = new Map<string, string[]>();
  nodes.forEach((node) => adjacencyList.set(node.id, []));
  edges.forEach((edge) => {
    const targets = adjacencyList.get(edge.source) || [];
    targets.push(edge.target);
    adjacencyList.set(edge.source, targets);
  });

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}
