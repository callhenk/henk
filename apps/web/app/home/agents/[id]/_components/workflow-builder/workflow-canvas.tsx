'use client';

import { FileText } from 'lucide-react';
import {
  Background,
  BackgroundVariant,
  type Connection,
  Controls,
  type Edge,
  type EdgeChange,
  MiniMap,
  type Node,
  type NodeChange,
  ReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';

import { nodeTypes } from './node-types';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick: (event: React.MouseEvent, edge: Edge) => void;
  onPaneClick: () => void;
  onConnect: (params: Connection) => void;
  isEmpty: boolean;
  onLoadTemplate: () => void;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onConnect,
  isEmpty,
  onLoadTemplate,
}: WorkflowCanvasProps) {
  return (
    <Card className="min-h-0 flex-1">
      <CardContent className="h-full p-0">
        {isEmpty ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No Workflow</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                Start by loading a template or creating a new workflow from
                scratch
              </p>
              <Button onClick={onLoadTemplate}>
                <FileText className="mr-2 h-4 w-4" />
                Load Template
              </Button>
            </div>
          </div>
        ) : (
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
            onPaneClick={onPaneClick}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        )}
      </CardContent>
    </Card>
  );
}
