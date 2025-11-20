'use client';

import { useCallback, useState } from 'react';

import {
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow';

import { useWorkflowHistory } from './use-workflow-history';

export function useWorkflowState() {
  const [nodes, setNodesInternal] = useState<Node[]>([]);
  const [edges, setEdgesInternal] = useState<Edge[]>([]);

  const {
    saveToHistory,
    undo,
    redo,
    historyIndex,
    history,
    isApplyingHistory: _isApplyingHistory,
  } = useWorkflowHistory(setNodesInternal, setEdgesInternal);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Debug logging
  console.log('[useWorkflowState] Current state:', {
    nodesCount: nodes.length,
    edgesCount: edges.length,
    canUndo,
    canRedo,
    historyIndex,
    historyLength: history.length,
  });

  const setNodes = useCallback(
    (nodesOrUpdater: Node[] | ((prev: Node[]) => Node[])) => {
      const newNodes =
        typeof nodesOrUpdater === 'function'
          ? nodesOrUpdater(nodes)
          : nodesOrUpdater;
      setNodesInternal(newNodes);
      saveToHistory(newNodes, edges);
    },
    [nodes, edges, saveToHistory],
  );

  const setEdges = useCallback(
    (edgesOrUpdater: Edge[] | ((prev: Edge[]) => Edge[])) => {
      const newEdges =
        typeof edgesOrUpdater === 'function'
          ? edgesOrUpdater(edges)
          : edgesOrUpdater;
      setEdgesInternal(newEdges);
      saveToHistory(nodes, newEdges);
    },
    [nodes, edges, saveToHistory],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Filter out non-meaningful changes that shouldn't create history entries
      const hasMeaningfulChange = changes.some((change) => {
        // Only track add, remove, and reset changes (not position, dimensions, selection)
        return (
          change.type === 'add' ||
          change.type === 'remove' ||
          change.type === 'reset'
        );
      });

      const newNodes = applyNodeChanges(changes, nodes);
      setNodesInternal(newNodes);

      // Only save to history for meaningful changes
      if (hasMeaningfulChange) {
        saveToHistory(newNodes, edges);
      }
    },
    [nodes, edges, saveToHistory],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      // Filter out non-meaningful changes
      const hasMeaningfulChange = changes.some((change) => {
        return (
          change.type === 'add' ||
          change.type === 'remove' ||
          change.type === 'reset'
        );
      });

      const newEdges = applyEdgeChanges(changes, edges);
      setEdgesInternal(newEdges);

      // Only save to history for meaningful changes
      if (hasMeaningfulChange) {
        saveToHistory(nodes, newEdges);
      }
    },
    [nodes, edges, saveToHistory],
  );

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
        // Update both nodes and edges, then save to history
        setNodesInternal(newNodes);
        setEdgesInternal(newEdges);
        saveToHistory(newNodes, newEdges);
      }
    },
    [nodes, edges, saveToHistory],
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

  // Wrap undo/redo with logging
  const undoWithLogging = useCallback(() => {
    console.log(
      '[useWorkflowState] Undo called, canUndo:',
      canUndo,
      'historyIndex:',
      historyIndex,
    );
    console.log('[useWorkflowState] Before undo - nodes:', nodes.length);
    undo();
    console.log('[useWorkflowState] After undo called');
  }, [undo, canUndo, historyIndex, nodes.length]);

  const redoWithLogging = useCallback(() => {
    console.log('[useWorkflowState] Redo called, canRedo:', canRedo);
    redo();
    console.log('[useWorkflowState] After redo called');
  }, [redo, canRedo]);

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
    undo: undoWithLogging,
    redo: redoWithLogging,
    canUndo,
    canRedo,
    historyLength: history.length,
  };
}
