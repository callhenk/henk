'use client';

import { useState } from 'react';
import {
  Users,
  Trash2,
  Download,
  Tags,
  X,
  CheckCircle,
  AlertCircle,
  Mail,
  PhoneOff,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Badge } from '@kit/ui/badge';

interface BulkActionsBarProps {
  selectedLeads: Set<string>;
  onClearSelection: () => void;
  onAddToList: () => void;
  onBulkDelete: () => void;
  onExport: () => void;
  onUpdateTags: (tags: string[], action: 'add' | 'remove') => void;
  onUpdatePreferences: (field: 'do_not_call' | 'do_not_email', value: boolean) => void;
  onUpdateQualityRating: (rating: string) => void;
}

export function BulkActionsBar({
  selectedLeads,
  onClearSelection,
  onAddToList,
  onBulkDelete,
  onExport,
  onUpdateTags,
  onUpdatePreferences,
  onUpdateQualityRating,
}: BulkActionsBarProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const selectedCount = selectedLeads.size;

  if (selectedCount === 0) return null;

  const handleDeleteConfirm = () => {
    onBulkDelete();
    setShowDeleteDialog(false);
  };

  const handleAddTags = () => {
    if (!tagInput.trim()) {
      toast.error('Please enter tags to add');
      return;
    }
    const tags = tagInput.split(',').map(t => t.trim()).filter(Boolean);
    onUpdateTags(tags, 'add');
    setTagInput('');
    toast.success(`Adding ${tags.length} tag(s) to ${selectedCount} lead(s)`);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm">
                <CheckCircle className="mr-1 h-3 w-3" />
                {selectedCount} selected
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSelection}
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Add to List */}
              <Button
                size="sm"
                variant="outline"
                onClick={onAddToList}
              >
                <Users className="mr-2 h-4 w-4" />
                Add to List
              </Button>

              {/* Quality Rating */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    Quality Rating
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onUpdateQualityRating('hot')}>
                    🔥 Mark as Hot
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateQualityRating('warm')}>
                    🌡️ Mark as Warm
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateQualityRating('cold')}>
                    ❄️ Mark as Cold
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdateQualityRating('unrated')}>
                    Clear Rating
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tags */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Tags className="mr-2 h-4 w-4" />
                    Tags
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <div className="p-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter tags (comma separated)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTags();
                          }
                        }}
                        className="flex-1 px-2 py-1 text-sm border rounded"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddTags}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      const tag = prompt('Remove tag:');
                      if (tag) onUpdateTags([tag], 'remove');
                    }}
                  >
                    Remove Tags
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Communication Preferences */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Preferences
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onUpdatePreferences('do_not_call', true)}>
                    <PhoneOff className="mr-2 h-4 w-4" />
                    Mark as Do Not Call
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdatePreferences('do_not_call', false)}>
                    Remove Do Not Call
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onUpdatePreferences('do_not_email', true)}>
                    <Mail className="mr-2 h-4 w-4 line-through" />
                    Mark as Do Not Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onUpdatePreferences('do_not_email', false)}>
                    Remove Do Not Email
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <Button
                size="sm"
                variant="outline"
                onClick={onExport}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>

              {/* Delete */}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
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
              Are you sure you want to delete {selectedCount} lead{selectedCount > 1 ? 's' : ''}?
              This action cannot be undone and will remove the lead{selectedCount > 1 ? 's' : ''} from all lists and campaigns.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedCount} Lead{selectedCount > 1 ? 's' : ''}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}