'use client';

import { useState } from 'react';

import { format } from 'date-fns';
import {
  Building2,
  Calendar,
  Edit,
  ExternalLink,
  Mail,
  Phone,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useDeleteLead } from '@kit/supabase/hooks/leads/use-lead-mutations';
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
import { ScrollArea } from '@kit/ui/scroll-area';
import { Separator } from '@kit/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@kit/ui/sheet';

import type { Database } from '~/lib/database.types';

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (lead: Lead) => void;
  onAddToList?: (lead: Lead) => void;
}

export function LeadDetailsDrawer({
  lead,
  open,
  onOpenChange,
  onEdit,
  onAddToList,
}: LeadDetailsDrawerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteLead = useDeleteLead();

  if (!lead) return null;

  const handleDelete = async () => {
    try {
      await deleteLead.mutateAsync(lead.id);
      toast.success('Lead deleted successfully');
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'salesforce':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'hubspot':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'manual':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetTitle className="text-xl">
                  {lead.first_name} {lead.last_name}
                </SheetTitle>
                <SheetDescription>
                  Lead details and information
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="mt-6 h-[calc(100vh-120px)]">
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                  Contact Information
                </h3>

                <div className="space-y-3">
                  {lead.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <div className="text-muted-foreground text-xs">
                          Email
                        </div>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <div className="text-muted-foreground text-xs">
                          Phone
                        </div>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.company && (
                    <div className="flex items-start gap-3">
                      <Building2 className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <div className="text-muted-foreground text-xs">
                          Company
                        </div>
                        <div className="text-sm">{lead.company}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Source & Tags */}
              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                  Classification
                </h3>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <div className="text-muted-foreground mb-1 text-xs">
                        Source
                      </div>
                      <Badge
                        variant="outline"
                        className={getSourceBadgeColor(lead.source)}
                      >
                        {lead.source}
                      </Badge>
                    </div>
                  </div>

                  {Array.isArray(lead.tags) &&
                    (lead.tags as string[]).length > 0 && (
                      <div className="flex items-start gap-3">
                        <Tag className="text-muted-foreground mt-0.5 h-4 w-4" />
                        <div className="flex-1">
                          <div className="text-muted-foreground mb-1 text-xs">
                            Tags
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(lead.tags as string[]).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>

              <Separator />

              {/* Metadata */}
              <div className="space-y-4">
                <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                  Metadata
                </h3>

                <div className="space-y-3">
                  {lead.created_at && (
                    <div className="flex items-start gap-3">
                      <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <div className="text-muted-foreground text-xs">
                          Created
                        </div>
                        <div className="text-sm">
                          {format(new Date(lead.created_at), 'PPP')}
                        </div>
                      </div>
                    </div>
                  )}

                  {lead.updated_at && (
                    <div className="flex items-start gap-3">
                      <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
                      <div className="flex-1">
                        <div className="text-muted-foreground text-xs">
                          Last Updated
                        </div>
                        <div className="text-sm">
                          {format(new Date(lead.updated_at), 'PPP')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Fields (if any) */}
              {lead.custom_fields &&
                Object.keys(lead.custom_fields).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-muted-foreground text-sm font-semibold uppercase">
                        Custom Fields
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(
                          lead.custom_fields as Record<string, unknown>,
                        ).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-muted-foreground">{key}</span>
                            <span className="font-medium">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="bg-background absolute right-0 bottom-0 left-0 border-t p-4">
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onEdit(lead);
                    onOpenChange(false);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              {onAddToList && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    onAddToList(lead);
                    onOpenChange(false);
                  }}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Add to List
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lead</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {lead.first_name} {lead.last_name}
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
