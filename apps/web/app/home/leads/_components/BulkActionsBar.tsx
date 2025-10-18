'use client';

import { useState } from 'react';
import { X, Users, Trash2, Tag, Download } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
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

import { AddToListDialog } from './add-to-list-dialog';

interface BulkActionsBarProps {
  selectedCount: number;
  selectedLeadIds: Set<string>;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  selectedLeadIds,
  onClearSelection,
}: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddToListDialog, setShowAddToListDialog] = useState(false);

  const handleBulkDelete = async () => {
    try {
      // TODO: Implement bulk delete mutation
      toast.success(`${selectedCount} leads deleted successfully`);
      onClearSelection();
      setShowDeleteDialog(false);
    } catch {
      toast.error('Failed to delete leads');
    }
  };

  const handleBulkExport = () => {
    // TODO: Implement bulk export functionality
    toast.info('Export functionality coming soon');
  };

  const handleBulkTag = () => {
    // TODO: Implement bulk tagging functionality
    toast.info('Bulk tagging coming soon');
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium">
                {selectedCount} {selectedCount === 1 ? 'lead' : 'leads'} selected
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddToListDialog(true)}
              >
                <Users className="mr-2 h-4 w-4" />
                Add to List
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkTag}
              >
                <Tag className="mr-2 h-4 w-4" />
                Add Tags
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} Leads</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedCount} {selectedCount === 1 ? 'lead' : 'leads'}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add to List Dialog - handled with existing component */}
      {showAddToListDialog && (
        <AddToListDialog
          open={showAddToListDialog}
          onOpenChange={setShowAddToListDialog}
          leadId={Array.from(selectedLeadIds)[0] || ''} // Pass first lead ID or empty string
          leadName={`${selectedCount} selected leads`}
          bulkLeadIds={Array.from(selectedLeadIds)}
        />
      )}
    </>
  );
}
