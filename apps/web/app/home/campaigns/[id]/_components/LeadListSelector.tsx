'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Plus, Users, X, GripVertical, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';
import {
  useAssignLeadListToCampaign,
  useRemoveLeadListFromCampaign,
  useCampaignLeadLists,
  useUpdateCampaignLeadListPriority,
} from '@kit/supabase/hooks/campaigns/use-campaign-lead-lists';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import { Skeleton } from '@kit/ui/skeleton';

interface LeadListSelectorProps {
  campaignId: string;
}

interface SortableListItemProps {
  id: string;
  assignedList: any;
  list: any;
  index: number;
  totalItems: number;
  onRemove: (listId: string) => void;
}

function SortableListItem({ id, assignedList, list, onRemove }: SortableListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
  };

  const progressPercentage = assignedList.total_leads
    ? ((assignedList.contacted_leads || 0) / assignedList.total_leads) * 100
    : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-lg border bg-card transition-all ${
        isDragging ? 'shadow-lg opacity-90' : 'hover:bg-accent/5'
      }`}
    >
      <div className="flex items-center gap-3 p-3">
        {/* Drag Handle */}
        <button
          className="cursor-grab rounded p-1 transition-colors hover:bg-accent active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground/60" />
        </button>

        {/* Priority */}
        <span className="text-xs text-muted-foreground font-mono">
          {assignedList.priority}
        </span>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-sm font-medium truncate">{list.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {assignedList.total_leads || 0} leads
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {assignedList.contacted_leads || 0} contacted
                </span>
                {assignedList.successful_leads > 0 && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {assignedList.successful_leads} converted
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-medium">{progressPercentage.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">complete</p>
              </div>
              <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-foreground/70 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(list.id)}
          className="h-7 w-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function LeadListSelector({ campaignId }: LeadListSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { data: businessContext } = useBusinessContext();
  const { data: allLists = [], isLoading: listsLoading } = useLeadLists();
  const { data: assignedLists = [], isLoading: assignedLoading } = useCampaignLeadLists(campaignId);
  const assignList = useAssignLeadListToCampaign();
  const removeList = useRemoveLeadListFromCampaign();
  const updatePriority = useUpdateCampaignLeadListPriority();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const assignedListIds = new Set(assignedLists.map((al) => al.lead_list_id));
  const availableLists = allLists.filter((list) => !assignedListIds.has(list.id));

  const handleAssignList = async (listId: string) => {
    try {
      const maxPriority = Math.max(0, ...assignedLists.map((al) => al.priority || 0));
      await assignList.mutateAsync({
        campaign_id: campaignId,
        lead_list_id: listId,
        priority: maxPriority + 1,
      });
      toast.success('Lead list assigned to campaign');
      setIsDialogOpen(false);
    } catch (error) {
      toast.error('Failed to assign lead list');
      console.error(error);
    }
  };

  const handleRemoveList = async (listId: string) => {
    try {
      await removeList.mutateAsync({
        campaign_id: campaignId,
        lead_list_id: listId,
      });
      toast.success('Lead list removed from campaign');
    } catch (error) {
      toast.error('Failed to remove lead list');
      console.error(error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const sortedLists = [...assignedLists].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    const oldIndex = sortedLists.findIndex((item) => item.id === active.id);
    const newIndex = sortedLists.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    // Reorder the array
    const reorderedLists = arrayMove(sortedLists, oldIndex, newIndex);

    // Update priorities in the database
    try {
      // Update all items that changed position
      const updates = reorderedLists.map((item, index) => {
        const newPriority = index + 1;
        if (item.priority !== newPriority) {
          return updatePriority.mutateAsync({
            campaign_id: campaignId,
            lead_list_id: item.lead_list_id,
            priority: newPriority,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
      toast.success('List order updated');
    } catch (error) {
      toast.error('Failed to update list order');
      console.error(error);
    }
  };

  if (!businessContext) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lead Lists</CardTitle>
            <CardDescription>
              Select lead lists to use in this campaign
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add List
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Lead List to Campaign</DialogTitle>
                <DialogDescription>
                  Select a lead list to add to this campaign. Lists will be processed in priority order.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {listsLoading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : availableLists.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium mb-1">No available lead lists</p>
                    <p className="text-xs mb-4">
                      {allLists.length === 0
                        ? 'Create your first lead list to get started.'
                        : 'All your lead lists are already assigned to this campaign. Create new lists on the Leads page.'}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsDialogOpen(false);
                        router.push('/home/leads');
                      }}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Go to Leads Page
                    </Button>
                  </div>
                ) : (
                  availableLists.map((list) => (
                    <div
                      key={list.id}
                      className="group cursor-pointer rounded-lg border p-3 transition-all hover:bg-accent/5"
                      onClick={() => handleAssignList(list.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium truncate">{list.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {list.lead_count || 0} leads
                            </span>
                          </div>
                          {list.description && (
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                              {list.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{list.list_type || 'static'}</span>
                            {list.source && (
                              <>
                                <span>•</span>
                                <span>{list.source}</span>
                              </>
                            )}
                            {list.tags && Array.isArray(list.tags) && list.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <span>{(list.tags as string[]).length} tags</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {assignedLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : assignedLists.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">No lead lists assigned</p>
            <p className="text-xs mb-4">
              {allLists.length === 0
                ? 'Create lead lists on the Leads page, then assign them to this campaign'
                : 'Add lead lists to this campaign to start reaching out to leads'}
            </p>
            <div className="flex items-center justify-center gap-2">
              {allLists.length === 0 ? (
                <Button
                  size="sm"
                  onClick={() => router.push('/home/leads')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Create Lead Lists
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First List
                </Button>
              )}
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={assignedLists.map((al) => al.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {assignedLists
                  .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                  .map((assignedList, index) => {
                    const list = allLists.find((l) => l.id === assignedList.lead_list_id);
                    if (!list) return null;

                    return (
                      <SortableListItem
                        key={assignedList.id}
                        id={assignedList.id}
                        assignedList={assignedList}
                        list={list}
                        index={index}
                        totalItems={assignedLists.length}
                        onRemove={handleRemoveList}
                      />
                    );
                  })}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
