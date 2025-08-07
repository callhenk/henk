'use client';

import {
  Delete,
  Grid,
  MousePointer,
  MousePointer2,
  RotateCcw,
  Trash2,
} from 'lucide-react';

export function WorkflowInstructions() {
  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <MousePointer className="h-4 w-4" />
          <span>Click nodes to select and edit</span>
        </div>
        <div className="flex items-center gap-2">
          <MousePointer2 className="h-4 w-4" />
          <span>Drag from handles to connect</span>
        </div>
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          <span>Select and delete with Delete key</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          <span>Ctrl+Z to undo, Ctrl+Shift+Z to redo</span>
        </div>
        <div className="flex items-center gap-2">
          <Grid className="h-4 w-4" />
          <span>Snap to grid for precise positioning</span>
        </div>
        <div className="flex items-center gap-2">
          <Delete className="h-4 w-4" />
          <span>Selected elements show in toolbar</span>
        </div>
      </div>
    </div>
  );
}
