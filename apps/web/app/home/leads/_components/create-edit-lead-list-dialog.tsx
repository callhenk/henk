'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Textarea } from '@kit/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import {
  useCreateLeadList,
  useUpdateLeadList,
} from '@kit/supabase/hooks/leads/use-lead-mutations';

import type { Database } from '~/lib/database.types';

type LeadList = Database['public']['Tables']['lead_lists']['Row'];

interface CreateEditLeadListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list?: LeadList | null;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

export function CreateEditLeadListDialog({
  open,
  onOpenChange,
  list,
}: CreateEditLeadListDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [listType, setListType] = useState<'static' | 'dynamic' | 'smart'>('static');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const { data: businessContext } = useBusinessContext();
  const createList = useCreateLeadList();
  const updateList = useUpdateLeadList();

  const isEditing = !!list;

  useEffect(() => {
    if (list) {
      setName(list.name || '');
      setDescription(list.description || '');
      setListType((list.list_type as 'static' | 'dynamic' | 'smart') || 'static');
      setColor(list.color || PRESET_COLORS[0]);
    } else {
      setName('');
      setDescription('');
      setListType('static');
      setColor(PRESET_COLORS[0]);
    }
  }, [list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a list name');
      return;
    }

    if (!businessContext?.business_id) {
      toast.error('Business context not found');
      return;
    }

    try {
      if (isEditing) {
        await updateList.mutateAsync({
          id: list.id,
          name: name.trim(),
          description: description.trim() || null,
          list_type: listType,
          color,
        });
        toast.success('Lead list updated successfully');
      } else {
        await createList.mutateAsync({
          business_id: businessContext.business_id,
          name: name.trim(),
          description: description.trim() || null,
          list_type: listType,
          color,
          source: 'manual',
          lead_count: 0,
        });
        toast.success('Lead list created successfully');
      }
      onOpenChange(false);
    } catch {
      toast.error(
        isEditing ? 'Failed to update lead list' : 'Failed to create lead list',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit' : 'Create'} Lead List</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of your lead list'
              : 'Create a new list to organize your leads'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Major Donors 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add a description for this list..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* List Type */}
          <div className="space-y-2">
            <Label htmlFor="list-type">List Type</Label>
            <Select value={listType} onValueChange={(value) => setListType(value as 'static' | 'dynamic' | 'smart')}>
              <SelectTrigger id="list-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="static">
                  Static - Manually add/remove leads
                </SelectItem>
                <SelectItem value="dynamic">
                  Dynamic - Auto-update based on criteria
                </SelectItem>
                <SelectItem value="smart">
                  Smart - Query-based filtering
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {listType === 'static' && 'Leads are manually added and removed'}
              {listType === 'dynamic' &&
                'List automatically updates based on defined rules'}
              {listType === 'smart' &&
                'List filters leads based on property queries'}
            </p>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                    color === presetColor ? 'ring-2 ring-offset-2 ring-primary' : ''
                  }`}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                  aria-label={`Select ${presetColor} color`}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createList.isPending || updateList.isPending}
            >
              {createList.isPending || updateList.isPending
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update List'
                  : 'Create List'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
