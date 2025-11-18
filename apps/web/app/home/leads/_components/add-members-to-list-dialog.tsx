'use client';

import { useMemo, useState } from 'react';

import { Plus, Search, Users } from 'lucide-react';
import { toast } from 'sonner';

import { useAddLeadToList } from '@kit/supabase/hooks/leads/use-lead-mutations';
import {
  useLeadListMembers,
  useLeads,
} from '@kit/supabase/hooks/leads/use-leads';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { ScrollArea } from '@kit/ui/scroll-area';
import { Skeleton } from '@kit/ui/skeleton';

import type { Database } from '~/lib/database.types';

type LeadList = Database['public']['Tables']['lead_lists']['Row'];

interface AddMembersToListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: LeadList | null;
}

export function AddMembersToListDialog({
  open,
  onOpenChange,
  list,
}: AddMembersToListDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(
    new Set(),
  );
  const [isAdding, setIsAdding] = useState(false);

  const { data: allLeadsResult, isLoading: isLoadingLeads } = useLeads();
  const { data: existingMembers = [], isLoading: isLoadingMembers } =
    useLeadListMembers(list?.id || '');
  const addLeadToList = useAddLeadToList();
  const supabase = useSupabase();

  // Extract leads data from pagination result
  const allLeads = allLeadsResult?.data ?? [];

  // Get IDs of existing members
  const existingMemberIds = useMemo(
    () => new Set(existingMembers.map((lead) => lead.id)),
    [existingMembers],
  );

  // Filter out leads that are already in the list
  const availableLeads = useMemo(
    () => allLeads.filter((lead) => !existingMemberIds.has(lead.id)),
    [allLeads, existingMemberIds],
  );

  // Filter available leads based on search query
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return availableLeads;
    const query = searchQuery.toLowerCase();
    return availableLeads.filter((lead) => {
      return (
        lead.first_name?.toLowerCase().includes(query) ||
        lead.last_name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.toLowerCase().includes(query) ||
        lead.company?.toLowerCase().includes(query)
      );
    });
  }, [availableLeads, searchQuery]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(new Set(filteredLeads.map((lead) => lead.id)));
    } else {
      setSelectedLeadIds(new Set());
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    const newSelection = new Set(selectedLeadIds);
    if (checked) {
      newSelection.add(leadId);
    } else {
      newSelection.delete(leadId);
    }
    setSelectedLeadIds(newSelection);
  };

  const handleAddMembers = async () => {
    if (!list || selectedLeadIds.size === 0) return;

    setIsAdding(true);
    try {
      // Get current user for added_by field
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Add all selected leads to the list
      const promises = Array.from(selectedLeadIds).map((leadId) =>
        addLeadToList.mutateAsync({
          lead_list_id: list.id,
          lead_id: leadId,
          added_by: user?.id || null,
        }),
      );

      await Promise.all(promises);

      toast.success(`Added ${selectedLeadIds.size} leads to ${list.name}`);
      setSelectedLeadIds(new Set());
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to add some leads to the list');
      console.error(error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!list) return null;

  const isLoading = isLoadingLeads || isLoadingMembers;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Members to {list.name}
          </DialogTitle>
          <DialogDescription>
            Select leads to add to this list. {existingMembers.length} leads are
            already in this list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Search leads to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Selection Summary */}
          {selectedLeadIds.size > 0 && (
            <div className="bg-muted flex items-center justify-between rounded-lg p-3">
              <span className="text-sm font-medium">
                {selectedLeadIds.size} lead
                {selectedLeadIds.size !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedLeadIds(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          )}

          {/* Leads List */}
          <ScrollArea className="h-[400px] rounded-md border">
            {isLoading ? (
              <div className="space-y-3 p-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-12 flex-1" />
                  </div>
                ))}
              </div>
            ) : availableLeads.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>All leads are already in this list</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="text-muted-foreground p-8 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No leads found matching &ldquo;{searchQuery}&rdquo;</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {/* Select All */}
                {filteredLeads.length > 1 && (
                  <label className="hover:bg-muted mb-3 flex cursor-pointer items-center gap-3 rounded border-b p-2 pb-3">
                    <Checkbox
                      checked={selectedLeadIds.size === filteredLeads.length}
                      onCheckedChange={handleSelectAll}
                    />
                    <span className="text-sm font-medium">
                      Select All ({filteredLeads.length} leads)
                    </span>
                  </label>
                )}

                {/* Lead Items */}
                {filteredLeads.map((lead) => (
                  <label
                    key={lead.id}
                    className="hover:bg-muted flex cursor-pointer items-start gap-3 rounded p-3"
                  >
                    <Checkbox
                      checked={selectedLeadIds.has(lead.id)}
                      onCheckedChange={(checked) =>
                        handleSelectLead(lead.id, !!checked)
                      }
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {lead.first_name} {lead.last_name}
                        </span>
                        {lead.quality_rating === 'hot' && (
                          <Badge variant="destructive" className="text-xs">
                            🔥 Hot
                          </Badge>
                        )}
                        {lead.quality_rating === 'warm' && (
                          <Badge variant="secondary" className="text-xs">
                            🌡️ Warm
                          </Badge>
                        )}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {lead.email}
                      </div>
                      {lead.company && (
                        <div className="text-muted-foreground text-sm">
                          {lead.company} {lead.title && `• ${lead.title}`}
                        </div>
                      )}
                      {lead.tags && (lead.tags as string[]).length > 0 && (
                        <div className="mt-1 flex gap-1">
                          {(lead.tags as string[]).slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {(lead.tags as string[]).length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{(lead.tags as string[]).length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isAdding}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddMembers}
            disabled={selectedLeadIds.size === 0 || isAdding}
          >
            {isAdding ? (
              <>Adding...</>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add {selectedLeadIds.size} Lead
                {selectedLeadIds.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
