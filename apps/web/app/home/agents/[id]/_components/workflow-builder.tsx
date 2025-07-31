'use client';

import { useCallback, useState } from 'react';

import {
  CheckCircle,
  MessageSquare,
  MousePointer,
  MousePointer2,
  Phone,
  Play,
  Plus,
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

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
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
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  }, [selectedEdge, setEdges]);

  const handleNodeSave = useCallback(
    (nodeData: {
      label: string;
      description: string;
      action: string;
      options: string[];
    }) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === selectedNode?.id
            ? { ...node, data: { ...node.data, ...nodeData } }
            : node,
        ),
      );
    },
    [selectedNode, setNodes],
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
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes],
  );

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) =>
        eds.filter(
          (e) => e.source !== selectedNode.id && e.target !== selectedNode.id,
        ),
      );
      setSelectedNode(null);
      setIsNodeEditorOpen(false);
    }
  }, [selectedNode, setNodes, setEdges]);

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
    </div>
  );
}
