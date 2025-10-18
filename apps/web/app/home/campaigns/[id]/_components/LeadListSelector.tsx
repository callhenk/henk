'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Plus, Users, X, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';
import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';
import {
  useAssignLeadListToCampaign,
  useRemoveLeadListFromCampaign,
  useCampaignLeadLists,
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

export function LeadListSelector({ campaignId }: LeadListSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { data: businessContext } = useBusinessContext();
  const { data: allLists = [], isLoading: listsLoading } = useLeadLists();
  const { data: assignedLists = [], isLoading: assignedLoading } = useCampaignLeadLists(campaignId);
  const assignList = useAssignLeadListToCampaign();
  const removeList = useRemoveLeadListFromCampaign();

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

  const handleChangePriority = async (listId: string, currentPriority: number, direction: 'up' | 'down') => {
    // TODO: Implement priority change
    toast.info('Priority change coming soon');
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
                    <Card
                      key={list.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleAssignList(list.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{list.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {list.lead_count || 0} leads
                              </Badge>
                            </div>
                            {list.description && (
                              <p className="text-sm text-muted-foreground">
                                {list.description}
                              </p>
                            )}
                            {list.tags && Array.isArray(list.tags) && list.tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {(list.tags as string[]).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
          <div className="space-y-2">
            {assignedLists
              .sort((a, b) => (a.priority || 0) - (b.priority || 0))
              .map((assignedList, index) => {
                const list = allLists.find((l) => l.id === assignedList.lead_list_id);
                if (!list) return null;

                return (
                  <div
                    key={assignedList.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleChangePriority(list.id, assignedList.priority || 0, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => handleChangePriority(list.id, assignedList.priority || 0, 'down')}
                          disabled={index === assignedLists.length - 1}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-mono text-xs">#{assignedList.priority}</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{list.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {assignedList.total_leads || list.lead_count || 0} leads
                          </Badge>
                        </div>
                        {list.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {list.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <div>
                          <span className="font-medium">{assignedList.contacted_leads || 0}</span> contacted
                        </div>
                        <div>
                          <span className="font-medium">{assignedList.successful_leads || 0}</span> converted
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveList(list.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
