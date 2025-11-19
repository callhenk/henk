'use client';

import { useCallback, useEffect, useState } from 'react';

import { Maximize, Minimize } from 'lucide-react';
import { type Connection, type Edge, type Node } from 'reactflow';
import { toast } from 'sonner';

import type { Tables } from '@kit/supabase/database';
import { useSaveWorkflow } from '@kit/supabase/hooks/workflows/use-workflow-mutations';
import { Button } from '@kit/ui/button';

import type { WorkflowTemplate } from '../workflow-templates';
import { ConnectionDialog } from './connection-dialog';
import { useWorkflowHistory } from './hooks/use-workflow-history';
import { useWorkflowState } from './hooks/use-workflow-state';
import { NodeEditorDialog } from './node-editor-dialog';
import { TemplateSelectionDialog } from './template-selection-dialog';
import { WorkflowCanvas } from './workflow-canvas';
import { WorkflowInstructions } from './workflow-instructions';
import { WorkflowToolbar } from './workflow-toolbar';
import {
  reactFlowEdgesToDbEdges,
  reactFlowNodesToDbNodes,
} from './workflow-transforms';

interface WorkflowBuilderProps {
  agentId: string;
}

export function WorkflowBuilder({ agentId }: WorkflowBuilderProps) {
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
  const [currentWorkflowId, _setCurrentWorkflowId] = useState<string | null>(
    null,
  );
  const [workflowName, setWorkflowName] = useState('Untitled Workflow');
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Save workflow mutation
  const saveWorkflowMutation = useSaveWorkflow();

  // Track changes for unsaved indicator
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges]);

  // Save workflow to database
  const handleSaveWorkflow = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Cannot save an empty workflow');
      return;
    }

    setIsSaving(true);
    try {
      const dbNodes = reactFlowNodesToDbNodes(nodes);
      const dbEdges = reactFlowEdgesToDbEdges(edges);

      await saveWorkflowMutation.mutateAsync({
        workflow: {
          id: currentWorkflowId || undefined,
          agent_id: agentId,
          name: workflowName,
          description: 'AI agent call workflow',
          status: 'active',
        },
        nodes: dbNodes as Tables<'workflow_nodes'>[],
        edges: dbEdges as Tables<'workflow_edges'>[],
      });

      setHasUnsavedChanges(false);
      toast.success(`Workflow "${workflowName}" saved successfully!`);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error(
        `Failed to save workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    nodes,
    edges,
    currentWorkflowId,
    agentId,
    workflowName,
    saveWorkflowMutation,
  ]);

  // Load template
  const loadTemplate = useCallback(
    (template: WorkflowTemplate) => {
      setNodes(template.nodes);
      setEdges(template.edges);
      saveToHistory(template.nodes, template.edges);
      setIsTemplateDialogOpen(false);
      setHasUnsavedChanges(true);
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

      // Ctrl+S to save
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault();
        handleSaveWorkflow();
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

      // Escape key to clear selection or exit fullscreen
      if (event.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          setSelectedNode(null);
          setSelectedEdge(null);
        }
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
    handleSaveWorkflow,
    isFullScreen,
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
    <div
      className={`${isFullScreen ? 'bg-background fixed inset-0 z-50 p-6' : 'space-y-6'}`}
    >
      {/* Workflow Header with Save Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <input
            data-testid="workflow-name-input"
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full max-w-md rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Workflow name..."
          />
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <span
              data-testid="workflow-unsaved-indicator"
              className="text-muted-foreground text-sm"
            >
              Unsaved changes
            </span>
          )}
          <Button
            data-testid="workflow-fullscreen-toggle"
            variant="outline"
            size="sm"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullScreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
          <Button
            data-testid="workflow-save-button"
            onClick={handleSaveWorkflow}
            disabled={isSaving || nodes.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-xl border p-4 sm:p-6">
        <div
          className={`flex w-full flex-col ${isFullScreen ? 'h-[calc(100vh-12rem)]' : 'h-[calc(100vh-20rem)]'}`}
        >
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
            data-testid="workflow-canvas"
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
