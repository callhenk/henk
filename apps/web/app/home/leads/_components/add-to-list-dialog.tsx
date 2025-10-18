'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Badge } from '@kit/ui/badge';

import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';
import { useAddLeadToList } from '@kit/supabase/hooks/leads/use-lead-mutations';

interface AddToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  bulkLeadIds?: string[]; // For bulk operations
}

export function AddToListDialog({
  open,
  onOpenChange,
  leadId,
  leadName,
  bulkLeadIds,
}: AddToListDialogProps) {
  const [selectedListId, setSelectedListId] = useState<string>('');
  const { data: leadLists = [] } = useLeadLists();
  const addToList = useAddLeadToList();

  const isBulkOperation = bulkLeadIds && bulkLeadIds.length > 1;
  const totalLeads = isBulkOperation ? bulkLeadIds.length : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedListId) {
      toast.error('Please select a list');
      return;
    }

    try {
      if (isBulkOperation) {
        // Bulk add multiple leads to list
        const promises = bulkLeadIds.map((id) =>
          addToList.mutateAsync({
            lead_list_id: selectedListId,
            lead_id: id,
          })
        );
        await Promise.all(promises);
        toast.success(`${totalLeads} leads added to list successfully`);
      } else {
        // Single lead add
        await addToList.mutateAsync({
          lead_list_id: selectedListId,
          lead_id: leadId,
        });
        toast.success(`${leadName} added to list successfully`);
      }
      onOpenChange(false);
      setSelectedListId('');
    } catch {
      toast.error('Failed to add leads to list');
    }
  };

  const selectedList = leadLists.find((list) => list.id === selectedListId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
          <DialogDescription>
            {isBulkOperation ? (
              <>Add <span className="font-medium">{totalLeads} leads</span> to a lead list</>
            ) : (
              <>Add <span className="font-medium">{leadName}</span> to a lead list</>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list">Select List</Label>
            <Select value={selectedListId} onValueChange={setSelectedListId}>
              <SelectTrigger id="list">
                <SelectValue placeholder="Choose a list..." />
              </SelectTrigger>
              <SelectContent>
                {leadLists.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No lists available. Create a list first.
                  </div>
                ) : (
                  leadLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex items-center gap-2">
                        {list.color && (
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: list.color }}
                          />
                        )}
                        <span>{list.name}</span>
                        <Badge variant="secondary" className="ml-auto">
                          {list.lead_count || 0}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedList && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="flex items-start gap-3">
                <div
                  className="h-4 w-4 rounded-full flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: selectedList.color }}
                />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{selectedList.name}</p>
                  {selectedList.description && (
                    <p className="text-xs text-muted-foreground">
                      {selectedList.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {selectedList.list_type}
                    </Badge>
                    <span>•</span>
                    <span>{selectedList.lead_count || 0} leads</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setSelectedListId('');
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedListId || addToList.isPending}>
              {addToList.isPending ? (
                'Adding...'
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Add to List
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
