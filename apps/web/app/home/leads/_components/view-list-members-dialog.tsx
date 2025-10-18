'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Building,
  MapPin,
  X,
  UserMinus,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Input } from '@kit/ui/input';
import { Badge } from '@kit/ui/badge';
import { ScrollArea } from '@kit/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
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
import { Skeleton } from '@kit/ui/skeleton';

import { useLeadListMembers } from '@kit/supabase/hooks/leads/use-leads';
import { useRemoveLeadFromList } from '@kit/supabase/hooks/leads/use-lead-mutations';
import type { Database } from '@kit/supabase/database';

import { AddMembersToListDialog } from './add-members-to-list-dialog';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadList = Database['public']['Tables']['lead_lists']['Row'];

interface ViewListMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: LeadList | null;
}

export function ViewListMembersDialog({
  open,
  onOpenChange,
  list,
}: ViewListMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [removingLeadId, setRemovingLeadId] = useState<string | null>(null);
  const [showAddMembers, setShowAddMembers] = useState(false);

  const { data: members = [], isLoading } = useLeadListMembers(list?.id || '');
  const removeFromList = useRemoveLeadFromList();

  // Filter members based on search query
  const filteredMembers = members.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.first_name?.toLowerCase().includes(query) ||
      lead.last_name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.toLowerCase().includes(query) ||
      lead.company?.toLowerCase().includes(query)
    );
  });

  const handleRemoveFromList = async () => {
    if (!removingLeadId || !list) return;

    try {
      await removeFromList.mutateAsync({
        lead_list_id: list.id,
        lead_id: removingLeadId,
      });
      toast.success('Lead removed from list');
      setRemovingLeadId(null);
    } catch (error) {
      toast.error('Failed to remove lead from list');
    }
  };

  const formatLocation = (lead: Lead) => {
    const parts = [lead.city, lead.state, lead.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  const getQualityBadge = (rating: string | null) => {
    switch (rating) {
      case 'hot':
        return <Badge variant="destructive">🔥 Hot</Badge>;
      case 'warm':
        return <Badge variant="secondary">🌡️ Warm</Badge>;
      case 'cold':
        return <Badge>❄️ Cold</Badge>;
      default:
        return null;
    }
  };

  if (!list) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: list.color }}
                  />
                  {list.name} Members
                </DialogTitle>
                <DialogDescription>
                  {list.description || `Viewing ${filteredMembers.length} leads in this list`}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  <Users className="mr-2 h-4 w-4" />
                  {list.lead_count || 0}
                </Badge>
                <Button
                  size="sm"
                  onClick={() => setShowAddMembers(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Members
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Members Table */}
            <ScrollArea className="h-[500px] rounded-md border">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  {searchQuery ? (
                    <>
                      <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No members found matching "{searchQuery}"</p>
                    </>
                  ) : (
                    <>
                      <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                      <p>No members in this list yet</p>
                      <p className="text-sm mt-2">Add leads to this list from the leads page</p>
                    </>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Quality</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {lead.first_name} {lead.last_name}
                            </div>
                            {lead.title && (
                              <div className="text-sm text-muted-foreground">
                                {lead.title}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="hover:underline"
                                >
                                  {lead.email}
                                </a>
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                <a
                                  href={`tel:${lead.phone}`}
                                  className="hover:underline"
                                >
                                  {lead.phone}
                                </a>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-muted-foreground" />
                              {lead.company}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {formatLocation(lead) && (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {formatLocation(lead)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {getQualityBadge(lead.quality_rating)}
                        </TableCell>
                        <TableCell>
                          {lead.lead_score > 0 && (
                            <Badge variant="outline">{lead.lead_score}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                // Open lead details in new tab or navigate
                                window.open(`/home/leads/${lead.id}`, '_blank');
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setRemovingLeadId(lead.id)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>

            {/* Tags Summary */}
            {!isLoading && filteredMembers.length > 0 && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-2">Common Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(
                    new Set(
                      filteredMembers
                        .flatMap((lead) => (lead.tags as string[]) || [])
                    )
                  )
                    .slice(0, 10)
                    .map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <AddMembersToListDialog
        open={showAddMembers}
        onOpenChange={setShowAddMembers}
        list={list}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={!!removingLeadId}
        onOpenChange={(open) => !open && setRemovingLeadId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Lead from List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this lead from "{list?.name}"? The lead will not be deleted, only removed from this list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveFromList}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove from List
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}