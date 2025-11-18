'use client';

import { useState } from 'react';

import { ChevronRight, ListChecks, Phone, Users } from 'lucide-react';

import { useCampaignLeadLists } from '@kit/supabase/hooks/campaigns/use-campaign-lead-lists';
import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';
import { useLeadListMembers } from '@kit/supabase/hooks/leads/use-leads';
import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

interface CampaignQueueMonitorProps {
  campaignId: string;
}

export function CampaignQueueMonitor({
  campaignId,
}: CampaignQueueMonitorProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const { data: assignedLists = [], isLoading: assignedLoading } =
    useCampaignLeadLists(campaignId);
  const { data: allLists = [] } = useLeadLists();

  // Separate completed and incomplete lists
  const sortedLists = [...assignedLists].sort(
    (a, b) => (a.priority || 0) - (b.priority || 0),
  );
  const incompleteLists = sortedLists.filter(
    (list) => (list.contacted_leads || 0) < (list.total_leads || 0),
  );
  const completedLists = sortedLists.filter(
    (list) =>
      (list.contacted_leads || 0) >= (list.total_leads || 0) &&
      (list.total_leads || 0) > 0,
  );

  // Get current list being processed (first incomplete list by priority)
  const currentList = incompleteLists.length > 0 ? incompleteLists[0] : null;

  // Load members for current active list or selected list
  const activeListId = selectedListId || currentList?.lead_list_id || '';
  const { data: listLeads = [], isLoading: membersLoading } =
    useLeadListMembers(activeListId);

  const currentListDetails = currentList
    ? allLists.find((l) => l.id === currentList.lead_list_id)
    : null;

  const displayListDetails = selectedListId
    ? allLists.find((l) => l.id === selectedListId)
    : currentListDetails;

  // Calculate progress
  const currentProgress = currentList
    ? ((currentList.contacted_leads || 0) / (currentList.total_leads || 1)) *
      100
    : 0;

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || '?';
  };

  if (assignedLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (assignedLists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Campaign Queue
          </CardTitle>
          <CardDescription>
            Monitor leads being contacted in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground py-8 text-center">
            <ListChecks className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p className="mb-1 text-sm font-medium">No lead lists assigned</p>
            <p className="text-xs">
              Add lead lists above to start your campaign
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <div className="relative">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                </div>
                Live Queue
              </CardTitle>
              <CardDescription className="mt-1 text-xs">
                Monitoring active lead outreach
              </CardDescription>
            </div>
            {assignedLists.length > 0 && (
              <span className="text-muted-foreground text-xs">
                {assignedLists.length} list
                {assignedLists.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* All Lists Completed State */}
          {incompleteLists.length === 0 && completedLists.length > 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
                  <ListChecks className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                    All lists completed!
                  </h3>
                  <p className="mt-0.5 text-xs text-emerald-700 dark:text-emerald-300">
                    All {completedLists.length} lead{' '}
                    {completedLists.length === 1 ? 'list has' : 'lists have'}{' '}
                    been fully contacted
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Currently Processing */}
          {currentList && currentListDetails && (
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-xs font-medium">
                      NOW PROCESSING
                    </span>
                    <span className="text-muted-foreground text-xs">•</span>
                    <span className="text-muted-foreground text-xs">
                      Priority {currentList.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium">
                    {currentListDetails.name}
                  </h3>
                  {currentListDetails.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                      {currentListDetails.description}
                    </p>
                  )}
                </div>
                {listLeads.length > 0 && (
                  <span className="text-muted-foreground text-xs">
                    {listLeads.length} leads
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    {currentList.contacted_leads || 0} of{' '}
                    {currentList.total_leads || 0} contacted
                  </span>
                  <span className="text-xs font-medium">
                    {currentProgress.toFixed(0)}%
                  </span>
                </div>
                <div className="bg-muted relative h-1 overflow-hidden rounded-full">
                  <div
                    className="bg-foreground/80 absolute inset-y-0 left-0 transition-[width] duration-300"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    Remaining:
                  </span>
                  <span className="text-xs font-medium">
                    {(currentList.total_leads || 0) -
                      (currentList.contacted_leads || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    Converted:
                  </span>
                  <span className="text-xs font-medium">
                    {currentList.successful_leads || 0}
                  </span>
                </div>
                {(currentList.successful_leads ?? 0) > 0 &&
                  (currentList.contacted_leads ?? 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">
                        Rate:
                      </span>
                      <span className="text-xs font-medium">
                        {(
                          ((currentList.successful_leads ?? 0) /
                            (currentList.contacted_leads ?? 1)) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Queue Summary - Upcoming Incomplete Lists */}
          {incompleteLists.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs font-medium">
                  UPCOMING
                </span>
                <span className="text-muted-foreground text-xs">
                  {incompleteLists.length - 1} queued
                </span>
              </div>
              <div className="space-y-1">
                {incompleteLists
                  .slice(1, 4) // Show next 3 incomplete lists (excluding current)
                  .map((list) => {
                    const listDetails = allLists.find(
                      (l) => l.id === list.lead_list_id,
                    );
                    if (!listDetails) return null;

                    const isSelected = selectedListId === list.lead_list_id;
                    const remaining =
                      (list.total_leads || 0) - (list.contacted_leads || 0);
                    return (
                      <div
                        key={list.id}
                        className={`group flex cursor-pointer items-center justify-between rounded px-3 py-2 transition-colors ${
                          isSelected ? 'bg-accent/50' : 'hover:bg-muted/50'
                        }`}
                        onClick={() =>
                          setSelectedListId(
                            isSelected ? null : list.lead_list_id,
                          )
                        }
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="text-muted-foreground text-xs">
                            {list.priority}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm">
                              {listDetails.name}
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {remaining} remaining
                              {(list.contacted_leads ?? 0) > 0 &&
                                ` • ${list.contacted_leads} contacted`}
                            </span>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="text-muted-foreground text-xs">
                            viewing
                          </span>
                        ) : (
                          <ChevronRight className="text-muted-foreground h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        )}
                      </div>
                    );
                  })}
                {incompleteLists.length > 4 && (
                  <div className="py-1 text-center">
                    <span className="text-muted-foreground text-xs">
                      +{incompleteLists.length - 4} more in queue
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Lists */}
          {completedLists.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-500">
                  COMPLETED
                </span>
                <span className="text-muted-foreground text-xs">
                  {completedLists.length} finished
                </span>
              </div>
              <div className="space-y-1">
                {completedLists.slice(0, 3).map((list) => {
                  const listDetails = allLists.find(
                    (l) => l.id === list.lead_list_id,
                  );
                  if (!listDetails) return null;

                  const isSelected = selectedListId === list.lead_list_id;
                  const successRate =
                    (list.contacted_leads ?? 0) > 0
                      ? (
                          ((list.successful_leads || 0) /
                            (list.contacted_leads ?? 1)) *
                          100
                        ).toFixed(1)
                      : '0';
                  return (
                    <div
                      key={list.id}
                      className={`group flex cursor-pointer items-center justify-between rounded px-3 py-2 transition-colors ${
                        isSelected ? 'bg-accent/50' : 'hover:bg-muted/50'
                      }`}
                      onClick={() =>
                        setSelectedListId(isSelected ? null : list.lead_list_id)
                      }
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm">
                            {listDetails.name}
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {list.total_leads || 0} leads • {successRate}%
                            success
                          </span>
                        </div>
                      </div>
                      {isSelected ? (
                        <span className="text-muted-foreground text-xs">
                          viewing
                        </span>
                      ) : (
                        <ChevronRight className="text-muted-foreground h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </div>
                  );
                })}
                {completedLists.length > 3 && (
                  <div className="py-1 text-center">
                    <span className="text-muted-foreground text-xs">
                      +{completedLists.length - 3} more completed
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overall Stats */}
          <div className="border-t pt-3">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-xs">Total</p>
                <p className="text-sm font-medium">
                  {assignedLists
                    .reduce((sum, list) => sum + (list.total_leads || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Contacted</p>
                <p className="text-sm font-medium">
                  {assignedLists
                    .reduce((sum, list) => sum + (list.contacted_leads || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Converted</p>
                <p className="text-sm font-medium">
                  {assignedLists
                    .reduce(
                      (sum, list) => sum + (list.successful_leads || 0),
                      0,
                    )
                    .toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Success Rate</p>
                <p className="text-sm font-medium">
                  {(() => {
                    const total = assignedLists.reduce(
                      (sum, list) => sum + (list.contacted_leads || 0),
                      0,
                    );
                    const converted = assignedLists.reduce(
                      (sum, list) => sum + (list.successful_leads || 0),
                      0,
                    );
                    return total > 0
                      ? `${((converted / total) * 100).toFixed(1)}%`
                      : '—';
                  })()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member List Section - Always visible for current active list */}
      {currentList && displayListDetails && (
        <Card className="mt-4 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">
                  {selectedListId ? 'Viewing' : 'Active'}:{' '}
                  {displayListDetails.name}
                </CardTitle>
                <CardDescription className="mt-1 text-xs">
                  {membersLoading
                    ? 'Loading leads...'
                    : `${listLeads.length} leads in this list`}
                </CardDescription>
              </div>
              {selectedListId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedListId(null)}
                  className="h-7 px-2 text-xs"
                >
                  Back to Active
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {membersLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : listLeads.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center">
                <Users className="mx-auto mb-2 h-10 w-10 opacity-30" />
                <p className="text-sm">No leads in this list</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-muted-foreground grid grid-cols-12 gap-2 border-b px-3 py-2 text-xs font-medium">
                  <div className="col-span-3">Name</div>
                  <div className="col-span-3">Contact</div>
                  <div className="col-span-2">Company</div>
                  <div className="col-span-2">Quality</div>
                  <div className="col-span-2">Added</div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {listLeads.slice(0, 50).map((lead) => (
                    <div
                      key={lead.id}
                      className="hover:bg-muted/30 grid grid-cols-12 gap-2 rounded px-3 py-2 text-sm transition-colors"
                    >
                      <div className="col-span-3 flex min-w-0 items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(lead.first_name, lead.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {lead.first_name} {lead.last_name}
                        </span>
                      </div>
                      <div className="text-muted-foreground col-span-3 truncate text-xs">
                        {lead.email || lead.phone || '—'}
                      </div>
                      <div className="text-muted-foreground col-span-2 truncate text-xs">
                        {lead.company || '—'}
                      </div>
                      <div className="col-span-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            lead.quality_rating === 'hot'
                              ? 'border-red-500/50 text-red-700 dark:text-red-400'
                              : lead.quality_rating === 'warm'
                                ? 'border-orange-500/50 text-orange-700 dark:text-orange-400'
                                : lead.quality_rating === 'cold'
                                  ? 'border-blue-500/50 text-blue-700 dark:text-blue-400'
                                  : 'border-gray-300'
                          }`}
                        >
                          {lead.quality_rating || 'unrated'}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground col-span-2 text-xs">
                        {lead.created_at
                          ? new Date(lead.created_at!).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: 'numeric',
                              },
                            )
                          : 'N/A'}
                      </div>
                    </div>
                  ))}
                  {listLeads.length > 50 && (
                    <div className="py-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedListId(displayListDetails.id)}
                        className="text-xs"
                      >
                        View all {listLeads.length} leads
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
