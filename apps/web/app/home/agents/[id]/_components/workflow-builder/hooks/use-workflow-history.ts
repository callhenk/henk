'use client';

import { useCallback, useRef, useState } from 'react';

import { type Edge, type Node } from 'reactflow';

// History management for undo/redo
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

export function useWorkflowHistory(
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void,
) {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isApplyingHistory = useRef(false);

  // Save current state to history
  const saveToHistory = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      // Don't save if we're applying history (undo/redo)
      if (isApplyingHistory.current) {
        return;
      }

      // Deep clone to avoid reference issues
      const newState = {
        nodes: structuredClone(nodes),
        edges: structuredClone(edges),
      };
      setHistory((prev) => {
        // Remove any history after current index (for redo after new changes)
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
        isApplyingHistory.current = true;
        setHistoryIndex(newIndex);
        // Use queueMicrotask to ensure state updates happen in correct order
        queueMicrotask(() => {
          setNodes([...state.nodes]);
          setEdges([...state.edges]);
          // Reset flag after state updates are applied
          setTimeout(() => {
            isApplyingHistory.current = false;
          }, 0);
        });
      }
    }
  }, [history, historyIndex, setNodes, setEdges]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];

      if (state) {
        isApplyingHistory.current = true;
        setHistoryIndex(newIndex);
        // Use queueMicrotask to ensure state updates happen in correct order
        queueMicrotask(() => {
          setNodes([...state.nodes]);
          setEdges([...state.edges]);
          // Reset flag after state updates are applied
          setTimeout(() => {
            isApplyingHistory.current = false;
          }, 0);
        });
      }
    }
  }, [history, historyIndex, setNodes, setEdges]);

  return {
    history,
    historyIndex,
    saveToHistory,
    undo,
    redo,
    isApplyingHistory,
  };
}
