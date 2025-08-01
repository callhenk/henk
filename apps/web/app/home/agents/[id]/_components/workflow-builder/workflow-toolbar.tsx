'use client';

import { FileText, Plus, RotateCcw, RotateCw, Trash2 } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { type Node, type Edge } from 'reactflow';

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
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Workflow Builder</h3>
        <p className="text-muted-foreground text-sm">
          Create and edit your agent&apos;s call workflow with visual
          connections
        </p>
      </div>
      <div className="flex gap-2">
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
        {selectedNode && (
          <Button
            variant="outline"
            size="sm"
            onClick={onDeleteNode}
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
            onClick={onDeleteEdge}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Connection
          </Button>
        )}
      </div>
    </div>
  );
}
