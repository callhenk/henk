'use client';

import { useState } from 'react';
import { Plus, List, Trash2, Edit, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';
import { Badge } from '@kit/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
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

import { useLeadLists } from '@kit/supabase/hooks/leads/use-leads';
import { useDeleteLeadList } from '@kit/supabase/hooks/leads/use-lead-mutations';

import { CreateEditLeadListDialog } from './create-edit-lead-list-dialog';
import { ViewListMembersDialog } from './view-list-members-dialog';

interface LeadListsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadListsDialog({ open, onOpenChange }: LeadListsDialogProps) {
  const [deleteListId, setDeleteListId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [viewingList, setViewingList] = useState<any>(null);
  const { data: leadLists = [], isLoading } = useLeadLists();
  const deleteList = useDeleteLeadList();

  const handleDelete = async () => {
    if (!deleteListId) return;
    try {
      await deleteList.mutateAsync(deleteListId);
      toast.success('Lead list deleted successfully');
      setDeleteListId(null);
    } catch {
      toast.error('Failed to delete lead list');
    }
  };

  const handleEdit = (list: any) => {
    setEditingList(list);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Lead Lists</DialogTitle>
            <DialogDescription>
              Manage your lead lists and organize leads into groups
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create List
              </Button>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">
                Loading lead lists...
              </div>
            ) : leadLists.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <List className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>No lead lists yet</p>
                <p className="text-sm">Create your first list to organize your leads</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Leads</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leadLists.map((list) => (
                      <TableRow key={list.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {list.color && (
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: list.color }}
                              />
                            )}
                            {list.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-md truncate">
                          {list.description || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            <UsersIcon className="mr-1 h-3 w-3" />
                            {list.lead_count || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{list.list_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(list)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setViewingList(list)}
                              >
                                <List className="mr-2 h-4 w-4" />
                                View Members
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setDeleteListId(list.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <CreateEditLeadListDialog
        open={createDialogOpen || !!editingList}
        onOpenChange={(open) => {
          if (!open) {
            setCreateDialogOpen(false);
            setEditingList(null);
          }
        }}
        list={editingList}
      />

      {/* View Members Dialog */}
      <ViewListMembersDialog
        open={!!viewingList}
        onOpenChange={(open) => !open && setViewingList(null)}
        list={viewingList}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteListId}
        onOpenChange={(open) => !open && setDeleteListId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead List</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this lead list? This will not delete
              the leads themselves, only the list organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
