'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  CheckCircle,
  MessageSquare,
  MousePointer,
  MousePointer2,
  Phone,
  Play,
  Plus,
  RotateCcw,
  RotateCw,
  Settings,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  Handle,
  MiniMap,
  type Node,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';

// History management for undo/redo
interface HistoryState {
  nodes: Node[];
  edges: Edge[];
}

// Custom node types
const nodeTypes = {
  start: StartNode,
  decision: DecisionNode,
  action: ActionNode,
  end: EndNode,
};

// Initial workflow nodes with proper handles
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'start',
    position: { x: 250, y: 0 },
    data: { label: 'Start Call' },
  },
  {
    id: '2',
    type: 'decision',
    position: { x: 250, y: 120 },
    data: {
      label: 'Donor Picks Up?',
      options: ['Yes', 'No'],
      description: 'Check if donor answers the call',
    },
  },
  {
    id: '3',
    type: 'action',
    position: { x: 100, y: 240 },
    data: {
      label: 'Leave Voicemail',
      description: 'Leave a brief voicemail with callback number',
      action: 'voicemail',
    },
  },
  {
    id: '4',
    type: 'action',
    position: { x: 400, y: 240 },
    data: {
      label: 'Begin Conversation',
      description: 'Start the fundraising conversation',
      action: 'conversation',
    },
  },
  {
    id: '5',
    type: 'decision',
    position: { x: 400, y: 360 },
    data: {
      label: 'Donor Interested?',
      options: ['Yes', 'No'],
      description: 'Assess donor interest level',
    },
  },
  {
    id: '6',
    type: 'action',
    position: { x: 600, y: 480 },
    data: {
      label: 'Process Donation',
      description: 'Confirm donation and process payment',
      action: 'donation',
    },
  },
  {
    id: '7',
    type: 'action',
    position: { x: 200, y: 480 },
    data: {
      label: 'Thank & End Call',
      description: 'Thank donor and end call gracefully',
      action: 'end_call',
    },
  },
  {
    id: '8',
    type: 'end',
    position: { x: 400, y: 600 },
    data: { label: 'End Workflow' },
  },
];

// Initial workflow edges with labels
const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    label: 'No',
    type: 'smoothstep',
    style: { stroke: '#ef4444', strokeWidth: 2 },
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    label: 'Yes',
    type: 'smoothstep',
    style: { stroke: '#10b981', strokeWidth: 2 },
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    label: 'Yes',
    type: 'smoothstep',
    style: { stroke: '#10b981', strokeWidth: 2 },
  },
  {
    id: 'e5-7',
    source: '5',
    target: '7',
    label: 'No',
    type: 'smoothstep',
    style: { stroke: '#ef4444', strokeWidth: 2 },
  },
  {
    id: 'e6-8',
    source: '6',
    target: '8',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  },
  {
    id: 'e7-8',
    source: '7',
    target: '8',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
  },
];

// Enhanced Custom Node Components with Handles
function StartNode({ data }: { data: { label: string } }) {
  return (
    <div className="flex h-16 w-40 items-center justify-center rounded-lg border-2 border-green-500 bg-green-100 shadow-lg">
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3 w-3 bg-green-500"
      />
      <Play className="mr-2 h-5 w-5 text-green-600" />
      <span className="text-sm font-medium text-green-800">{data.label}</span>
    </div>
  );
}

function DecisionNode({
  data,
}: {
  data: { label: string; options?: string[] };
}) {
  return (
    <div className="flex h-24 w-48 flex-col items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-100 shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3 w-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="h-3 w-3 bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-3 w-3 bg-blue-500"
      />

      <div className="mb-2 flex items-center">
        <Settings className="mr-2 h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-800">{data.label}</span>
      </div>
      <div className="flex gap-1">
        {data.options?.map((option: string, index: number) => (
          <Badge key={index} variant="outline" className="text-xs">
            {option}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ActionNode({
  data,
}: {
  data: { label: string; description: string; action: string };
}) {
  const getActionIcon = (action: string) => {
    switch (action) {
      case 'voicemail':
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case 'conversation':
        return <Phone className="h-5 w-5 text-blue-600" />;
      case 'donation':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'end_call':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Settings className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="flex h-20 w-44 flex-col items-center justify-center rounded-lg border-2 border-gray-500 bg-gray-100 shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 bg-gray-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-3 w-3 bg-gray-500"
      />

      <div className="mb-1 flex items-center">
        {getActionIcon(data.action)}
        <span className="ml-2 text-sm font-medium text-gray-800">
          {data.label}
        </span>
      </div>
      <span className="text-center text-xs text-gray-600">
        {data.description}
      </span>
    </div>
  );
}

function EndNode({ data }: { data: { label: string } }) {
  return (
    <div className="flex h-16 w-40 items-center justify-center rounded-lg border-2 border-red-500 bg-red-100 shadow-lg">
      <Handle
        type="target"
        position={Position.Top}
        className="h-3 w-3 bg-red-500"
      />
      <XCircle className="mr-2 h-5 w-5 text-red-600" />
      <span className="text-sm font-medium text-red-800">{data.label}</span>
    </div>
  );
}

// Enhanced Node Editor Dialog
function NodeEditorDialog({
  node,
  isOpen,
  onClose,
  onSave,
}: {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeData: {
    label: string;
    description: string;
    action: string;
    options: string[];
  }) => void;
}) {
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    action: '',
    options: [''],
  });

  // Update form data when node changes
  useEffect(() => {
    if (node) {
      setFormData({
        label: node.data.label || '',
        description: node.data.description || '',
        action: node.data.action || '',
        options: node.data.options || [''],
      });
    }
  }, [node]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Workflow Node</DialogTitle>
          <DialogDescription>
            Configure the workflow node settings and behavior
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              className="col-span-3"
              placeholder="Enter node label..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-3"
              placeholder="Enter node description..."
            />
          </div>
          {node?.type === 'action' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action" className="text-right">
                Action Type
              </Label>
              <Select
                value={formData.action}
                onValueChange={(value) =>
                  setFormData({ ...formData, action: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voicemail">Leave Voicemail</SelectItem>
                  <SelectItem value="conversation">
                    Start Conversation
                  </SelectItem>
                  <SelectItem value="donation">Process Donation</SelectItem>
                  <SelectItem value="end_call">End Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {node?.type === 'decision' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Options</Label>
              <div className="col-span-3 space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder="Enter option..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = formData.options.filter(
                          (_, i) => i !== index,
                        );
                        setFormData({ ...formData, options: newOptions });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      options: [...formData.options, ''],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isNodeEditorOpen, setIsNodeEditorOpen] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null,
  );
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false);

  // Undo/Redo functionality
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const onConnect = useCallback(
    (params: Connection) => {
      // Ensure we have valid source and target
      if (!params.source || !params.target) return;

      // Find the source node to get its options for labeling
      const sourceNode = nodes.find((n) => n.id === params.source);

      if (sourceNode?.type === 'decision' && sourceNode.data.options) {
        // For decision nodes, show dialog to choose option
        setPendingConnection(params);
        setIsConnectionDialogOpen(true);
        return;
      }

      // For non-decision nodes, proceed with automatic labeling
      let label = '';
      const targetNode = nodes.find((n) => n.id === params.target);
      if (targetNode) {
        const isPositiveAction = ['donation', 'conversation'].includes(
          targetNode.data.action,
        );
        label = isPositiveAction ? 'Yes' : 'No';
      }

      const newEdge: Edge = {
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

      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      saveToHistory(nodes, newEdges);
    },
    [edges, nodes, setEdges, saveToHistory],
  );

  const handleConnectionConfirm = useCallback(
    (selectedOption: string) => {
      if (!pendingConnection) return;

      const newEdge: Edge = {
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

      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      saveToHistory(nodes, newEdges);

      setPendingConnection(null);
      setIsConnectionDialogOpen(false);
    },
    [pendingConnection, edges, nodes, setEdges, saveToHistory],
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setIsNodeEditorOpen(true);
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
  }, []);

  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      const newEdges = edges.filter((e) => e.id !== selectedEdge.id);
      setEdges(newEdges);
      saveToHistory(nodes, newEdges);
      setSelectedEdge(null);
    }
  }, [selectedEdge, edges, nodes, setEdges, saveToHistory]);

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
      saveToHistory(newNodes, edges);
    },
    [nodes, edges, setNodes, saveToHistory],
  );

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      const newNodes = nodes.filter((n) => n.id !== selectedNode.id);
      const newEdges = edges.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id,
      );
      setNodes(newNodes);
      setEdges(newEdges);
      saveToHistory(newNodes, newEdges);
      setSelectedNode(null);
      setIsNodeEditorOpen(false);
    }
  }, [selectedNode, nodes, edges, setNodes, setEdges, saveToHistory]);

  // Get source node options for connection dialog
  const sourceNode = pendingConnection
    ? nodes.find((n) => n.id === pendingConnection.source)
    : null;
  const connectionOptions = sourceNode?.data.options || [];

  return (
    <div className="h-[700px] w-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Builder</h3>
          <p className="text-muted-foreground text-sm">
            Create and edit your agent&apos;s call workflow with visual
            connections
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex === 0}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            title="Redo (Ctrl+Shift+Z)"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Redo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNewNode('decision', { x: 100, y: 100 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Decision
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addNewNode('action', { x: 100, y: 100 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Action
          </Button>
          {selectedNode && (
            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelectedNode}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Node
            </Button>
          )}
          {selectedEdge && (
            <Button
              variant="outline"
              size="sm"
              onClick={deleteSelectedEdge}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Connection
            </Button>
          )}
        </div>
      </div>

      {/* Connection Instructions */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4" />
              <span>Click nodes to edit</span>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-4 w-4" />
              <span>Drag from handles to connect</span>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Select and delete connections</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span>Ctrl+Z to undo, Ctrl+Shift+Z to redo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardContent className="h-full p-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            className="h-full"
            connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              style: { stroke: '#3b82f6', strokeWidth: 2 },
            }}
            onPaneClick={() => {
              setSelectedNode(null);
              setSelectedEdge(null);
            }}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </CardContent>
      </Card>

      <NodeEditorDialog
        node={selectedNode}
        isOpen={isNodeEditorOpen}
        onClose={() => setIsNodeEditorOpen(false)}
        onSave={handleNodeSave}
      />

      {/* Connection Dialog for Decision Nodes */}
      <Dialog
        open={isConnectionDialogOpen}
        onOpenChange={setIsConnectionDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Choose Connection Option</DialogTitle>
            <DialogDescription>
              Select which decision option this connection represents
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              {connectionOptions.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => handleConnectionConfirm(option)}
                  className="justify-start"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setPendingConnection(null);
                setIsConnectionDialogOpen(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
