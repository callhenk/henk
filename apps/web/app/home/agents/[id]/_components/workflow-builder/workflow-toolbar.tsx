'use client';

import { FileText, Plus, RotateCcw, RotateCw, Trash2 } from 'lucide-react';
import { type Edge, type Node } from 'reactflow';

import { Button } from '@kit/ui/button';

interface WorkflowToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
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
  canUndo,
  canRedo,
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
    <div className="mb-4 flex flex-col gap-3">
      {/* Primary Actions Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Add Nodes Group */}
        <div className="flex flex-wrap gap-2">
          <Button
            data-testid="workflow-add-decision"
            variant="outline"
            size="sm"
            onClick={onAddDecision}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Decision</span>
          </Button>
          <Button
            data-testid="workflow-add-action"
            variant="outline"
            size="sm"
            onClick={onAddAction}
          >
            <Plus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Action</span>
          </Button>
        </div>

        {/* History & Template Group */}
        <div className="flex flex-wrap gap-2">
          <Button
            data-testid="workflow-undo"
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only">Undo</span>
          </Button>
          <Button
            data-testid="workflow-redo"
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <RotateCw className="h-4 w-4" />
            <span className="sr-only">Redo</span>
          </Button>
          <Button
            data-testid="workflow-load-template"
            variant="outline"
            size="sm"
            onClick={onOpenTemplateDialog}
            className="hidden sm:flex"
          >
            <FileText className="mr-2 h-4 w-4" />
            Template
          </Button>
        </div>
      </div>

      {/* Selection Status Row */}
      {hasSelection && (
        <div className="flex flex-wrap items-center gap-2">
          <div
            data-testid="workflow-selection-indicator"
            className="bg-muted text-muted-foreground flex flex-1 items-center gap-1 rounded-md px-3 py-2 text-sm"
          >
            <div className="bg-muted-foreground h-2 w-2 flex-shrink-0 rounded-full"></div>
            <span className="truncate">
              {selectedNode ? `${selectedNode.data.label}` : 'Connection'}
            </span>
          </div>
          <Button
            data-testid="workflow-delete-selected"
            variant="destructive"
            size="sm"
            onClick={() => {
              if (selectedNode) onDeleteNode();
              if (selectedEdge) onDeleteEdge();
            }}
            title="Delete selected element (Delete key)"
          >
            <Trash2 className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      )}
    </div>
  );
}
