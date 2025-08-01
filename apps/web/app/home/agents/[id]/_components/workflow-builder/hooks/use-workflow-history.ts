'use client';

import { useCallback, useState } from 'react';

import { type Edge, type Node } from 'reactflow';

// History management for undo/redo
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function useWorkflowHistory(
  nodes: Node[],
  edges: Edge[],
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
) {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save current state to history
  const saveToHistory = useCallback(
    (newNodes: Node[], newEdges: Edge[]) => {
      const newState = { nodes: newNodes, edges: newEdges };
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newState);
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex],
  );

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      if (state) {
        setNodes(state.nodes);
        setEdges(state.edges);
        setHistoryIndex(newIndex);
      }
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      if (state) {
        setNodes(state.nodes);
        setEdges(state.edges);
        setHistoryIndex(newIndex);
      }
    }
  }, [history, historyIndex, setNodes, setEdges]);

  return {
    history,
    historyIndex,
    saveToHistory,
    undo,
    redo,
    setHistory,
    setHistoryIndex,
  };
}
