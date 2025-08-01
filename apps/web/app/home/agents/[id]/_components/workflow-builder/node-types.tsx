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

// Enhanced Custom Node Components with better selection visibility and connection handles
function StartNode({
  data,
  selected,
}: {
  data: { label: string };
  selected?: boolean;
}) {
  return (
    <div
      className={`flex h-16 w-40 items-center justify-center rounded-lg border-2 border-green-500 bg-green-100 shadow-lg transition-all ${
        selected ? 'scale-105 ring-4 ring-green-300 ring-offset-2' : ''
      }`}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-4 w-4 bg-green-500 transition-colors hover:bg-green-600"
        style={{ zIndex: 10 }}
      />
      <Play className="mr-2 h-5 w-5 text-green-600" />
      <span className="text-sm font-medium text-green-800">{data.label}</span>
    </div>
  );
}

function DecisionNode({
  data,
  selected,
}: {
  data: { label: string; options?: string[] };
  selected?: boolean;
}) {
  return (
    <div
      className={`flex h-24 w-48 flex-col items-center justify-center rounded-lg border-2 border-blue-500 bg-blue-100 shadow-lg transition-all ${
        selected ? 'scale-105 ring-4 ring-blue-300 ring-offset-2' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-4 w-4 bg-blue-500 transition-colors hover:bg-blue-600"
        style={{ zIndex: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-4 w-4 bg-blue-500 transition-colors hover:bg-blue-600"
        style={{ zIndex: 10 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        className="h-4 w-4 bg-blue-500 transition-colors hover:bg-blue-600"
        style={{ zIndex: 10 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-4 w-4 bg-blue-500 transition-colors hover:bg-blue-600"
        style={{ zIndex: 10 }}
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
  selected,
}: {
  data: { label: string; description: string; action: string };
  selected?: boolean;
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
    <div
      className={`flex h-20 w-44 flex-col items-center justify-center rounded-lg border-2 border-gray-500 bg-gray-100 shadow-lg transition-all ${
        selected ? 'scale-105 ring-4 ring-gray-300 ring-offset-2' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-4 w-4 bg-gray-500 transition-colors hover:bg-gray-600"
        style={{ zIndex: 10 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-4 w-4 bg-gray-500 transition-colors hover:bg-gray-600"
        style={{ zIndex: 10 }}
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

function EndNode({
  data,
  selected,
}: {
  data: { label: string };
  selected?: boolean;
}) {
  return (
    <div
      className={`flex h-16 w-40 items-center justify-center rounded-lg border-2 border-red-500 bg-red-100 shadow-lg transition-all ${
        selected ? 'scale-105 ring-4 ring-red-300 ring-offset-2' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="h-4 w-4 bg-red-500 transition-colors hover:bg-red-600"
        style={{ zIndex: 10 }}
      />
      <XCircle className="mr-2 h-5 w-5 text-red-600" />
      <span className="text-sm font-medium text-red-800">{data.label}</span>
    </div>
  );
}
