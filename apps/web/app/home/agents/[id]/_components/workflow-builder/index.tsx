'use client';

import { useCallback, useEffect, useState } from 'react';

import { type Connection, type Edge, type Node } from 'reactflow';

import { type WorkflowTemplate } from '../workflow-templates';
import { ConnectionDialog } from './connection-dialog';
import { useWorkflowHistory } from './hooks/use-workflow-history';
import { useWorkflowState } from './hooks/use-workflow-state';
import { NodeEditorDialog } from './node-editor-dialog';
import { TemplateSelectionDialog } from './template-selection-dialog';
import { WorkflowCanvas } from './workflow-canvas';
import { WorkflowInstructions } from './workflow-instructions';
import { WorkflowToolbar } from './workflow-toolbar';

export function WorkflowBuilder() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    addNewNode,
    deleteSelectedNode,
    deleteSelectedEdge,
  } = useWorkflowState();

  const { history, historyIndex, saveToHistory, undo, redo } =
    useWorkflowHistory(nodes, edges, setNodes, setEdges);

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null,
  );
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Load template
  const loadTemplate = useCallback(
    (template: WorkflowTemplate) => {
      setNodes(template.nodes);
      setEdges(template.edges);
      saveToHistory(template.nodes, template.edges);
      setIsTemplateDialogOpen(false);
    },
    [setNodes, setEdges, saveToHistory],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      // Delete key for selected elements
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        if (selectedNode) {
          deleteSelectedNode(selectedNode);
          setSelectedNode(null);
        } else if (selectedEdge) {
          deleteSelectedEdge(selectedEdge);
          setSelectedEdge(null);
        }
      }

      // Escape key to clear selection
      if (event.key === 'Escape') {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    selectedNode,
    selectedEdge,
    deleteSelectedNode,
    deleteSelectedEdge,
  ]);

  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null); // Clear edge selection when node is selected
    setIsNodeEditorOpen(true);
  }, []);

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null); // Clear node selection when edge is selected
  }, []);

  const handleNodeSave = useCallback(
    (nodeData: {
      label: string;
      description: string;
      action: string;
      options: string[];
    }) => {
      const newNodes = nodes.map((node) =>
        node.id === selectedNode?.id
          ? { ...node, data: { ...node.data, ...nodeData } }
          : node,
      );
      setNodes(newNodes);
      saveToHistory(newNodes, edges);
    },
    [selectedNode, nodes, edges, setNodes, saveToHistory],
  );

  const handleConnectionConfirm = useCallback(
    (selectedOption: string) => {
      if (!pendingConnection) return;

      const newEdge = {
        id: `e${pendingConnection.source}-${pendingConnection.target}`,
        source: pendingConnection.source!,
        target: pendingConnection.target!,
        sourceHandle: pendingConnection.sourceHandle,
        targetHandle: pendingConnection.targetHandle,
        type: 'smoothstep',
        animated: true,
        label: selectedOption,
        style: {
          stroke: selectedOption === 'Yes' ? '#10b981' : '#ef4444',
          strokeWidth: 2,
        },
      };

      const newEdges = [...edges, newEdge];
      setEdges(newEdges);
      saveToHistory(nodes, newEdges);

      setPendingConnection(null);
      setIsConnectionDialogOpen(false);
    },
    [pendingConnection, edges, nodes, setEdges, saveToHistory],
  );

  // Get source node options for connection dialog
  const sourceNode = pendingConnection
    ? nodes.find((n) => n.id === pendingConnection.source)
    : null;
  const connectionOptions = sourceNode?.data.options || [];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-slate-50">
          <svg
            className="h-8 w-8 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Workflow Builder
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Design and configure your agent&apos;s conversation flow with a visual
          workflow editor.
        </p>
      </div>

      {/* Workflow Container */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex h-[600px] w-full flex-col">
          <WorkflowToolbar
            historyIndex={historyIndex}
            historyLength={history.length}
            onUndo={undo}
            onRedo={redo}
            onAddDecision={() => addNewNode('decision', { x: 100, y: 100 })}
            onAddAction={() => addNewNode('action', { x: 100, y: 100 })}
            onDeleteNode={() =>
              selectedNode && deleteSelectedNode(selectedNode)
            }
            onDeleteEdge={() =>
              selectedEdge && deleteSelectedEdge(selectedEdge)
            }
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onOpenTemplateDialog={() => setIsTemplateDialogOpen(true)}
          />

          <WorkflowInstructions />

          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            onPaneClick={() => {
              setSelectedNode(null);
              setSelectedEdge(null);
            }}
            onConnect={(params: Connection) => {
              if (!params.source || !params.target) return;

              const sourceNode = nodes.find((n) => n.id === params.source);

              if (sourceNode?.type === 'decision' && sourceNode.data.options) {
                setPendingConnection(params);
                setIsConnectionDialogOpen(true);
                return;
              }

              let label = '';
              const targetNode = nodes.find((n) => n.id === params.target);
              if (targetNode) {
                const isPositiveAction = ['donation', 'conversation'].includes(
                  targetNode.data.action,
                );
                label = isPositiveAction ? 'Yes' : 'No';
              }

              const newEdge = {
                id: `e${params.source}-${params.target}`,
                source: params.source,
                target: params.target,
                sourceHandle: params.sourceHandle,
                targetHandle: params.targetHandle,
                type: 'smoothstep',
                animated: true,
                label: label,
                style: {
                  stroke:
                    label === 'Yes'
                      ? '#10b981'
                      : label === 'No'
                        ? '#ef4444'
                        : '#3b82f6',
                  strokeWidth: 2,
                },
              };

              const newEdges = [...edges, newEdge];
              setEdges(newEdges);
              saveToHistory(nodes, newEdges);
            }}
            isEmpty={nodes.length === 0}
            onLoadTemplate={() => setIsTemplateDialogOpen(true)}
          />
        </div>
      </div>

      <NodeEditorDialog
        node={selectedNode}
        isOpen={isNodeEditorOpen}
        onClose={() => setIsNodeEditorOpen(false)}
        onSave={handleNodeSave}
      />

      <ConnectionDialog
        isOpen={isConnectionDialogOpen}
        onOpenChange={setIsConnectionDialogOpen}
        options={connectionOptions}
        onConfirm={handleConnectionConfirm}
        onCancel={() => {
          setPendingConnection(null);
          setIsConnectionDialogOpen(false);
        }}
      />

      <TemplateSelectionDialog
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelectTemplate={loadTemplate}
      />
    </div>
  );
}
