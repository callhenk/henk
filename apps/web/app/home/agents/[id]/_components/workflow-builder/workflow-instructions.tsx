'use client';

import { useState } from 'react';

import {
  ChevronDown,
  ChevronUp,
  Grid,
  HelpCircle,
  MousePointer,
  MousePointer2,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';

export function WorkflowInstructions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      data-testid="workflow-instructions"
      className="bg-muted/50 mb-4 rounded-lg border"
    >
      {/* Collapsed Header */}
      <button
        data-testid="workflow-instructions-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        className="hover:bg-muted/80 flex w-full items-center justify-between p-3 text-sm font-medium transition-colors"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          <span>Workflow Controls & Shortcuts</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t p-4">
          <div className="text-muted-foreground grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 flex-shrink-0" />
              <span>Click nodes to select and edit</span>
            </div>
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-4 w-4 flex-shrink-0" />
              <span>Drag from handles to connect nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 flex-shrink-0" />
              <span>Delete key to remove selected items</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 flex-shrink-0" />
              <span>Ctrl+Z undo, Ctrl+Shift+Z redo</span>
            </div>
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 flex-shrink-0" />
              <span>Ctrl+S to save workflow</span>
            </div>
            <div className="flex items-center gap-2">
              <Grid className="h-4 w-4 flex-shrink-0" />
              <span>Nodes snap to grid automatically</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
