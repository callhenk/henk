'use client';

import { FileText, Plus, RotateCcw, RotateCw, Trash2, X } from 'lucide-react';
import { type Edge, type Node } from 'reactflow';

import { Button } from '@kit/ui/button';

interface WorkflowToolbarProps {
  historyIndex: number;
  historyLength: number;
  onUndo: () => void;
  onRedo: () => void;
  onAddDecision: () => void;
  onAddAction: () => void;
  onDeleteNode: () => void;
  onDeleteEdge: () => void;
  selectedNode: Node | null;
  selectedEdge: Edge | null;
  onOpenTemplateDialog: () => void;
}

export function WorkflowToolbar({
  historyIndex,
  historyLength,
  onUndo,
  onRedo,
  onAddDecision,
  onAddAction,
  onDeleteNode,
  onDeleteEdge,
  selectedNode,
  selectedEdge,
  onOpenTemplateDialog,
}: WorkflowToolbarProps) {
  const hasSelection = selectedNode || selectedEdge;

  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Selection Status */}
      {hasSelection && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
            <div className="h-2 w-2 rounded-full bg-gray-500"></div>
            <span>
              {selectedNode ? `Selected: ${selectedNode.data.label}` : ''}
              {selectedEdge ? 'Selected: Connection' : ''}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (selectedNode) onDeleteNode();
              if (selectedEdge) onDeleteEdge();
            }}
            className="h-8 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Toolbar Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onOpenTemplateDialog}>
          <FileText className="mr-2 h-4 w-4" />
          Load Template
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={historyIndex <= 0}
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={historyIndex >= historyLength - 1}
          title="Redo (Ctrl+Shift+Z)"
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Redo
        </Button>
        <Button variant="outline" size="sm" onClick={onAddDecision}>
          <Plus className="mr-2 h-4 w-4" />
          Add Decision
        </Button>
        <Button variant="outline" size="sm" onClick={onAddAction}>
          <Plus className="mr-2 h-4 w-4" />
          Add Action
        </Button>
        {hasSelection && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (selectedNode) onDeleteNode();
              if (selectedEdge) onDeleteEdge();
            }}
            title="Delete selected element (Delete key)"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
