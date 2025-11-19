'use client';

import { useEffect, useState } from 'react';

import { AlertCircle, Plus, Trash2 } from 'lucide-react';
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
  const [errors, setErrors] = useState<{
    label?: string;
    action?: string;
    options?: string;
  }>({});

  // Update form data when node changes
  useEffect(() => {
    if (node) {
      setFormData({
        label: node.data.label || '',
        description: node.data.description || '',
        action: node.data.action || '',
        options: node.data.options || [''],
      });
      setErrors({});
    }
  }, [node]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (node?.type === 'action' && !formData.action) {
      newErrors.action = 'Please select an action type';
    }

    if (node?.type === 'decision') {
      const validOptions = formData.options.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        newErrors.options = 'Decision nodes need at least 2 options';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
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
        <div className="space-y-4 py-4">
          {/* Label Field */}
          <div className="space-y-2">
            <Label htmlFor="label">
              Label <span className="text-destructive">*</span>
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) => {
                setFormData({ ...formData, label: e.target.value });
                if (errors.label) setErrors({ ...errors, label: undefined });
              }}
              placeholder="Enter node label..."
              className={errors.label ? 'border-destructive' : ''}
            />
            {errors.label && (
              <p className="text-destructive flex items-center gap-1 text-sm">
                <AlertCircle className="h-3 w-3" />
                {errors.label}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter node description..."
              rows={3}
            />
          </div>

          {/* Action Type (for action nodes) */}
          {node?.type === 'action' && (
            <div className="space-y-2">
              <Label htmlFor="action">
                Action Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.action}
                onValueChange={(value) => {
                  setFormData({ ...formData, action: value });
                  if (errors.action)
                    setErrors({ ...errors, action: undefined });
                }}
              >
                <SelectTrigger
                  className={errors.action ? 'border-destructive' : ''}
                >
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
              {errors.action && (
                <p className="text-destructive flex items-center gap-1 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  {errors.action}
                </p>
              )}
            </div>
          )}

          {/* Options (for decision nodes) */}
          {node?.type === 'decision' && (
            <div className="space-y-2">
              <Label>
                Decision Options <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.options];
                        newOptions[index] = e.target.value;
                        setFormData({ ...formData, options: newOptions });
                        if (errors.options)
                          setErrors({ ...errors, options: undefined });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    {formData.options.length > 1 && (
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
                    )}
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
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Option
                </Button>
              </div>
              {errors.options && (
                <p className="text-destructive flex items-center gap-1 text-sm">
                  <AlertCircle className="h-3 w-3" />
                  {errors.options}
                </p>
              )}
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
