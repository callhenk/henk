'use client';

import { useCallback } from 'react';

import { type Edge, type Node, useEdgesState, useNodesState } from 'reactflow';

export function useWorkflowState() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const addNewNode = useCallback(
    (type: string, position: { x: number; y: number }) => {
      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position,
        data: {
          label: `New ${type}`,
          description: '',
          action: '',
          options: ['Yes', 'No'],
        },
      };
      const newNodes = [...nodes, newNode];
      setNodes(newNodes);
    },
    [nodes, setNodes],
  );

  const deleteSelectedNode = useCallback(
    (selectedNode: Node | null) => {
      if (selectedNode) {
        const newNodes = nodes.filter((n) => n.id !== selectedNode.id);
        const newEdges = edges.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id,
        );
        setNodes(newNodes);
        setEdges(newEdges);
      }
    },
    [nodes, edges, setNodes, setEdges],
  );

  const deleteSelectedEdge = useCallback(
    (selectedEdge: Edge | null) => {
      if (selectedEdge) {
        const newEdges = edges.filter((e) => e.id !== selectedEdge.id);
        setEdges(newEdges);
      }
    },
    [edges, setEdges],
  );

  return {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    addNewNode,
    deleteSelectedNode,
    deleteSelectedEdge,
  };
}
