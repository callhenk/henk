'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { format } from 'date-fns';
import {
  Activity,
  ArrowLeft,
  Building2,
  Clock,
  Edit,
  ExternalLink,
  ListChecks,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

import { useConversations } from '@kit/supabase/hooks/conversations/use-conversations';
import { useDeleteLead } from '@kit/supabase/hooks/leads/use-lead-mutations';
import { useLead } from '@kit/supabase/hooks/leads/use-leads';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { AddToListDialog } from '../../_components/add-to-list-dialog';
import { EditLeadDialog } from '../../_components/edit-lead-dialog';

export function LeadDetail({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddToListDialog, setShowAddToListDialog] = useState(false);

  const { data: lead, isLoading } = useLead(leadId);
  const { data: allConversationsResult } = useConversations();
  const deleteLead = useDeleteLead();

  // Filter conversations for this lead
  const allConversations = allConversationsResult?.data ?? [];
  const leadConversations = allConversations.filter(
    (conv) => conv.lead_id === leadId,
  );

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(leadId);
      toast.success('Lead deleted successfully');
      router.push('/home/leads');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const getQualityBadge = (rating: string | null) => {
    switch (rating) {
      case 'hot':
        return (
          <Badge variant="destructive" className="gap-1">
            🔥 Hot Lead
          </Badge>
        );
      case 'warm':
        return (
          <Badge variant="secondary" className="gap-1">
            🌡️ Warm Lead
          </Badge>
        );
      case 'cold':
        return <Badge className="gap-1">❄️ Cold Lead</Badge>;
      default:
        return <Badge variant="outline">Unrated</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      contacted: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      interested: 'bg-green-500/10 text-green-500 border-green-500/20',
      not_interested: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      unreachable: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
    };

    return (
      <Badge
        variant="outline"
        className={`${statusColors[status] || ''} capitalize`}
      >
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">Lead not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const fullName =
    `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Unnamed Lead';

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">{fullName}</h1>
            </div>
            <div className="ml-12 flex items-center gap-2">
              {getStatusBadge(lead.status ?? 'new')}
              {getQualityBadge(lead.quality_rating)}
              {lead.do_not_call && (
                <Badge variant="destructive">Do Not Call</Badge>
              )}
              {lead.do_not_email && (
                <Badge variant="destructive">Do Not Email</Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddToListDialog(true)}
            >
              <ListChecks className="mr-2 h-4 w-4" />
              Add to List
            </Button>
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lead Score</CardTitle>
              <Activity className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lead.lead_score || 0}</div>
              <p className="text-muted-foreground text-xs">Out of 100</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversations
              </CardTitle>
              <MessageSquare className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leadConversations.length}
              </div>
              <p className="text-muted-foreground text-xs">
                Total interactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Source</CardTitle>
              <User className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold capitalize">{lead.source}</div>
              <p className="text-muted-foreground text-xs">Lead origin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Activity
              </CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {lead.last_activity_at
                  ? format(new Date(lead.last_activity_at), 'MMM d, yyyy')
                  : 'Never'}
              </div>
              <p className="text-muted-foreground text-xs">Most recent</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="conversations">
              Conversations ({leadConversations.length})
            </TabsTrigger>
            <TabsTrigger value="activity">Activity Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Primary contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">Email</p>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">Phone</p>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.mobile_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">Mobile</p>
                        <a
                          href={`tel:${lead.mobile_phone}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {lead.mobile_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organization Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                  <CardDescription>Company and role details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">Company</p>
                        <p className="text-sm font-medium">{lead.company}</p>
                      </div>
                    </div>
                  )}

                  {lead.title && (
                    <div className="flex items-center gap-3">
                      <User className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">
                          Job Title
                        </p>
                        <p className="text-sm font-medium">{lead.title}</p>
                      </div>
                    </div>
                  )}

                  {lead.department && (
                    <div className="flex items-center gap-3">
                      <Building2 className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">
                          Department
                        </p>
                        <p className="text-sm font-medium">{lead.department}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>Address and timezone</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(lead.street ||
                    lead.city ||
                    lead.state ||
                    lead.postal_code) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">Address</p>
                        <div className="space-y-1 text-sm font-medium">
                          {lead.street && <p>{lead.street}</p>}
                          <p>
                            {[lead.city, lead.state, lead.postal_code]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                          {lead.country && <p>{lead.country}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {lead.timezone && (
                    <div className="flex items-center gap-3">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">
                          Timezone
                        </p>
                        <p className="text-sm font-medium">{lead.timezone}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tags and Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Tags and notes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lead.tags && (lead.tags as string[]).length > 0 && (
                    <div className="flex items-start gap-3">
                      <Tag className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground mb-2 text-sm">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(lead.tags as string[]).map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {lead.notes && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm">Notes</p>
                        <p className="text-sm font-medium whitespace-pre-wrap">
                          {lead.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {!lead.notes &&
                    (!lead.tags || (lead.tags as string[]).length === 0) && (
                      <p className="text-muted-foreground text-sm">
                        No additional information available
                      </p>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Tracking and metadata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Created</p>
                    <p className="text-sm font-medium">
                      {lead.created_at
                        ? format(new Date(lead.created_at), 'PPpp')
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium">
                      {lead.updated_at
                        ? format(new Date(lead.updated_at), 'PPpp')
                        : 'N/A'}
                    </p>
                  </div>
                  {lead.source_id && (
                    <div>
                      <p className="text-muted-foreground text-sm">Source ID</p>
                      <p className="font-mono text-sm font-medium">
                        {lead.source_id}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversations" className="space-y-4">
            {leadConversations.length > 0 ? (
              <div className="space-y-4">
                {leadConversations.map((conversation) => (
                  <Card key={conversation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            Conversation {conversation.id.slice(0, 8)}
                          </CardTitle>
                          <CardDescription>
                            {conversation.created_at
                              ? format(
                                  new Date(conversation.created_at),
                                  'PPpp',
                                )
                              : 'Date unknown'}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/home/conversations/${conversation.id}`,
                            )
                          }
                        >
                          View Details
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <Badge>{conversation.status}</Badge>
                          {conversation.outcome && (
                            <Badge variant="outline">
                              {conversation.outcome}
                            </Badge>
                          )}
                          {conversation.duration_seconds && (
                            <span className="text-muted-foreground text-sm">
                              Duration:{' '}
                              {Math.floor(conversation.duration_seconds / 60)}m{' '}
                              {conversation.duration_seconds % 60}s
                            </span>
                          )}
                        </div>
                        {conversation.notes && (
                          <p className="text-muted-foreground text-sm">
                            {conversation.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="text-muted-foreground mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p className="text-muted-foreground">
                    No conversations yet with this lead
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
                <CardDescription>
                  Chronological history of all interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Lead Created */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="bg-primary/10 rounded-full p-2">
                        <User className="text-primary h-4 w-4" />
                      </div>
                      {leadConversations.length > 0 && (
                        <div className="bg-border mt-2 h-full w-px" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <p className="font-medium">Lead Created</p>
                      <p className="text-muted-foreground text-sm">
                        {lead.created_at
                          ? format(new Date(lead.created_at), 'PPpp')
                          : 'N/A'}
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Source: {lead.source}
                      </p>
                    </div>
                  </div>

                  {/* Conversations */}
                  {leadConversations
                    .sort(
                      (a, b) =>
                        new Date(a.created_at || 0).getTime() -
                        new Date(b.created_at || 0).getTime(),
                    )
                    .map((conversation, index) => (
                      <div key={conversation.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="rounded-full bg-green-500/10 p-2">
                            <MessageSquare className="h-4 w-4 text-green-500" />
                          </div>
                          {index < leadConversations.length - 1 && (
                            <div className="bg-border mt-2 h-full w-px" />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className="font-medium">Conversation</p>
                          <p className="text-muted-foreground text-sm">
                            {conversation.created_at
                              ? format(
                                  new Date(conversation.created_at),
                                  'PPpp',
                                )
                              : 'Date unknown'}
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <Badge variant="outline">
                              {conversation.status}
                            </Badge>
                            {conversation.outcome && (
                              <Badge variant="secondary">
                                {conversation.outcome}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {leadConversations.length === 0 && (
                    <p className="text-muted-foreground py-8 text-center text-sm">
                      No activity beyond lead creation
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {lead && (
        <>
          <EditLeadDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            lead={lead}
          />

          <AddToListDialog
            open={showAddToListDialog}
            onOpenChange={setShowAddToListDialog}
            leadId={lead.id}
            leadName={fullName}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {fullName}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
