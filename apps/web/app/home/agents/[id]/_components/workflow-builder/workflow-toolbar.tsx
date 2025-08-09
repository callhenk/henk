'use client';

import { FileText, Plus, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
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
          <div className="bg-muted text-muted-foreground flex items-center gap-1 rounded-md px-3 py-2 text-sm">
            <div className="bg-muted-foreground h-2 w-2 rounded-full"></div>
            <span>
              {selectedNode ? `Selected: ${selectedNode.data.label}` : ''}
              {selectedEdge ? 'Selected: Connection' : ''}
            </span>
          </div>
          {/* Duplicate quick-delete removed; rely on the Destructive Delete button below */}
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
