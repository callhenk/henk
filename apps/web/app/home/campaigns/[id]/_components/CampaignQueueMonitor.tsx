'use client';

import { useState } from 'react';
import { ChevronRight, Users, Phone, ListChecks } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Skeleton } from '@kit/ui/skeleton';

import { useCampaignLeadLists } from '@kit/supabase/hooks/campaigns/use-campaign-lead-lists';
import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';
import { useLeadListMembers } from '@kit/supabase/hooks/leads/use-leads';

interface CampaignQueueMonitorProps {
  campaignId: string;
}

export function CampaignQueueMonitor({ campaignId }: CampaignQueueMonitorProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  const { data: assignedLists = [], isLoading: assignedLoading } = useCampaignLeadLists(campaignId);
  const { data: allLists = [] } = useLeadLists();

  // Get current list being processed (lowest priority number, first in queue)
  const currentList = assignedLists.length > 0
    ? assignedLists.sort((a, b) => (a.priority || 0) - (b.priority || 0))[0]
    : null;

  // Load members for current active list or selected list
  const activeListId = selectedListId || currentList?.lead_list_id || '';
  const { data: listLeads = [], isLoading: membersLoading } = useLeadListMembers(activeListId);

  const currentListDetails = currentList
    ? allLists.find(l => l.id === currentList.lead_list_id)
    : null;

  const displayListDetails = selectedListId
    ? allLists.find(l => l.id === selectedListId)
    : currentListDetails;

  // Calculate progress
  const currentProgress = currentList
    ? ((currentList.contacted_leads || 0) / (currentList.total_leads || 1)) * 100
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
          <div className="text-center py-8 text-muted-foreground">
            <ListChecks className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm font-medium mb-1">No lead lists assigned</p>
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
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                Live Queue
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Monitoring active lead outreach
              </CardDescription>
            </div>
            {assignedLists.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {assignedLists.length} list{assignedLists.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* Currently Processing */}
          {currentList && currentListDetails && (
            <div className="rounded-lg bg-muted/30 p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">NOW PROCESSING</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">Priority {currentList.priority}</span>
                  </div>
                  <h3 className="text-sm font-medium">{currentListDetails.name}</h3>
                  {currentListDetails.description && (
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {currentListDetails.description}
                    </p>
                  )}
                </div>
                {listLeads.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {listLeads.length} leads
                  </span>
                )}
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {currentList.contacted_leads || 0} of {currentList.total_leads || 0} contacted
                  </span>
                  <span className="text-xs font-medium">{currentProgress.toFixed(0)}%</span>
                </div>
                <div className="relative h-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="absolute inset-y-0 left-0 bg-foreground/80 transition-all duration-500"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Remaining:</span>
                  <span className="text-xs font-medium">
                    {(currentList.total_leads || 0) - (currentList.contacted_leads || 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Converted:</span>
                  <span className="text-xs font-medium">
                    {currentList.successful_leads || 0}
                  </span>
                </div>
                {currentList.successful_leads > 0 && currentList.contacted_leads > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Rate:</span>
                    <span className="text-xs font-medium">
                      {((currentList.successful_leads / currentList.contacted_leads) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Queue Summary */}
          {assignedLists.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">UPCOMING</span>
                <span className="text-xs text-muted-foreground">
                  {assignedLists.length - 1} queued
                </span>
              </div>
              <div className="space-y-1">
                {assignedLists
                  .sort((a, b) => (a.priority || 0) - (b.priority || 0))
                  .slice(1, 4) // Show next 3 lists
                  .map((list) => {
                    const listDetails = allLists.find(l => l.id === list.lead_list_id);
                    if (!listDetails) return null;

                    const isSelected = selectedListId === list.lead_list_id;
                    return (
                      <div
                        key={list.id}
                        className={`group flex items-center justify-between py-2 px-3 rounded transition-colors cursor-pointer ${
                          isSelected ? 'bg-accent/50' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedListId(isSelected ? null : list.lead_list_id)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs text-muted-foreground">
                            {list.priority}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm truncate">{listDetails.name}</div>
                            <span className="text-xs text-muted-foreground">
                              {list.total_leads || 0} leads
                              {list.contacted_leads > 0 && ` • ${list.contacted_leads} contacted`}
                            </span>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="text-xs text-muted-foreground">viewing</span>
                        ) : (
                          <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    );
                  })}
                {assignedLists.length > 4 && (
                  <div className="text-center py-1">
                    <span className="text-xs text-muted-foreground">
                      +{assignedLists.length - 4} more
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Overall Stats */}
          <div className="pt-3 border-t">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-sm font-medium">
                  {assignedLists.reduce((sum, list) => sum + (list.total_leads || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contacted</p>
                <p className="text-sm font-medium">
                  {assignedLists.reduce((sum, list) => sum + (list.contacted_leads || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Converted</p>
                <p className="text-sm font-medium">
                  {assignedLists.reduce((sum, list) => sum + (list.successful_leads || 0), 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-sm font-medium">
                  {(() => {
                    const total = assignedLists.reduce((sum, list) => sum + (list.contacted_leads || 0), 0);
                    const converted = assignedLists.reduce((sum, list) => sum + (list.successful_leads || 0), 0);
                    return total > 0 ? `${((converted / total) * 100).toFixed(1)}%` : '—';
                  })()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Member List Section - Always visible for current active list */}
      {currentList && displayListDetails && (
        <Card className="border-0 shadow-sm mt-4">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">
                  {selectedListId ? 'Viewing' : 'Active'}: {displayListDetails.name}
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {membersLoading ? 'Loading leads...' : `${listLeads.length} leads in this list`}
                </CardDescription>
              </div>
              {selectedListId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedListId(null)}
                  className="text-xs h-7 px-2"
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
              <div className="text-center py-6 text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No leads in this list</p>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b">
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
                      className="grid grid-cols-12 gap-2 px-3 py-2 text-sm hover:bg-muted/30 rounded transition-colors"
                    >
                      <div className="col-span-3 flex items-center gap-2 min-w-0">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(lead.first_name, lead.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">
                          {lead.first_name} {lead.last_name}
                        </span>
                      </div>
                      <div className="col-span-3 text-xs text-muted-foreground truncate">
                        {lead.email || lead.phone || '—'}
                      </div>
                      <div className="col-span-2 text-xs text-muted-foreground truncate">
                        {lead.company || '—'}
                      </div>
                      <div className="col-span-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            lead.quality_rating === 'hot' ? 'border-red-500/50 text-red-700 dark:text-red-400' :
                            lead.quality_rating === 'warm' ? 'border-orange-500/50 text-orange-700 dark:text-orange-400' :
                            lead.quality_rating === 'cold' ? 'border-blue-500/50 text-blue-700 dark:text-blue-400' :
                            'border-gray-300'
                          }`}
                        >
                          {lead.quality_rating || 'unrated'}
                        </Badge>
                      </div>
                      <div className="col-span-2 text-xs text-muted-foreground">
                        {new Date(lead.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  ))}
                  {listLeads.length > 50 && (
                    <div className="text-center py-2">
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
