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

// Custom CSS to remove React Flow branding
const reactFlowStyles = `
  .react-flow__attribution {
    display: none !important;
  }
  .react-flow__controls {
    border: none !important;
    box-shadow: none !important;
  }
  .react-flow__controls button {
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 4px !important;
    color: #64748b !important;
  }
  .react-flow__controls button:hover {
    background: #f1f5f9 !important;
    color: #334155 !important;
  }
  .react-flow__minimap {
    border: 1px solid #e2e8f0 !important;
    border-radius: 4px !important;
  }
  .react-flow__minimap-mask {
    fill: rgba(0, 0, 0, 0.1) !important;
  }
  .react-flow__minimap-node {
    fill: #3b82f6 !important;
    stroke: #1d4ed8 !important;
  }
  .react-flow__watermark {
    display: none !important;
  }
  .react-flow__logo {
    display: none !important;
  }
  .react-flow__branding {
    display: none !important;
  }
  .react-flow__footer {
    display: none !important;
  }
`;

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
    <>
      <style dangerouslySetInnerHTML={{ __html: reactFlowStyles }} />
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
              connectionLineStyle={{
                stroke: '#3b82f6',
                strokeWidth: 3,
                strokeDasharray: '5,5',
              }}
              defaultEdgeOptions={{
                type: 'smoothstep',
                animated: true,
                style: {
                  stroke: '#3b82f6',
                  strokeWidth: 3,
                  zIndex: 5,
                },
              }}
              onPaneClick={onPaneClick}
              snapToGrid={true}
              snapGrid={[15, 15]}
              deleteKeyCode="Delete"
              multiSelectionKeyCode="Shift"
              panOnDrag={true}
              zoomOnScroll={true}
              zoomOnPinch={true}
              zoomOnDoubleClick={false}
              preventScrolling={true}
              style={{
                backgroundColor: '#f8fafc',
              }}
            >
              <Controls
                showZoom={true}
                showFitView={true}
                showInteractive={true}
                position="bottom-right"
                className="react-flow__controls"
              />
              <MiniMap
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
                nodeColor="#3b82f6"
                nodeStrokeWidth={3}
                zoomable
                pannable
              />
              <Background
                variant={BackgroundVariant.Dots}
                gap={20}
                size={1}
                color="#cbd5e1"
              />
            </ReactFlow>
          )}
        </CardContent>
      </Card>
    </>
  );
}
