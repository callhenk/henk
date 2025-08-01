'use client';

import { useEffect, useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';
import { type Node } from 'reactflow';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Textarea } from '@kit/ui/textarea';

interface NodeEditorDialogProps {
  node: Node | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeData: {
    label: string;
    description: string;
    action: string;
    options: string[];
  }) => void;
}

export function NodeEditorDialog({
  node,
  isOpen,
  onClose,
  onSave,
}: NodeEditorDialogProps) {
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    action: '',
    options: [''],
  });

  // Update form data when node changes
  useEffect(() => {
    if (node) {
      setFormData({
        label: node.data.label || '',
        description: node.data.description || '',
        action: node.data.action || '',
        options: node.data.options || [''],
      });
    }
  }, [node]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Workflow Node</DialogTitle>
          <DialogDescription>
            Configure the workflow node settings and behavior
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="label" className="text-right">
              Label
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              className="col-span-3"
              placeholder="Enter node label..."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="col-span-3"
              placeholder="Enter node description..."
            />
          </div>
          {node?.type === 'action' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="action" className="text-right">
                Action Type
              </Label>
              <Select
                value={formData.action}
                onValueChange={(value) =>
                  setFormData({ ...formData, action: value })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voicemail">Leave Voicemail</SelectItem>
                  <SelectItem value="conversation">
                    Start Conversation
                  </SelectItem>
                  <SelectItem value="donation">Process Donation</SelectItem>
                  <SelectItem value="end_call">End Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {node?.type === 'decision' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Options</Label>
              <div className="col-span-3 space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                      }}
                      placeholder="Enter option..."
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newOptions = formData.options.filter(
                          (_, i) => i !== index,
                        );
                        setFormData({ ...formData, options: newOptions });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      options: [...formData.options, ''],
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
