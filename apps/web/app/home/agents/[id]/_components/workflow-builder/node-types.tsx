'use client';

import {
  CheckCircle,
  MessageSquare,
  Phone,
  Play,
  Settings,
  XCircle,
} from 'lucide-react';
import { Handle, Position } from 'reactflow';

import { Badge } from '@kit/ui/badge';

// Custom node types
export const nodeTypes = {
  start: StartNode,
  decision: DecisionNode,
  action: ActionNode,
  end: EndNode,
};

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
