'use client';

import { useState } from 'react';

import {
  ArrowLeft,
  Download,
  Edit,
  FileText,
  MoreHorizontal,
  Pause,
  Phone,
  Play,
  Trash2,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@kit/ui/alert-dialog';
import { Button } from '@kit/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';

import { StatusBadge } from '~/components/shared';

interface CampaignHeaderProps {
  campaign: {
    id: string;
    name: string | null;
    description?: string | null;
    status: string;
  };
  onBack: () => void;
  onSaveField: (fieldName: string, value: string) => Promise<void>;
  onEdit: () => void;
  onActivate: () => Promise<void> | void;
  onPause: () => Promise<void> | void;
  onDelete: () => Promise<void> | void;
  isUpdatingStatus?: boolean;
  isDeleting?: boolean;
}

export function CampaignHeader({
  campaign,
  onBack,
  onSaveField,
  onEdit,
  onActivate,
  onPause,
  onDelete,
  isUpdatingStatus = false,
  isDeleting = false,
}: CampaignHeaderProps) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState<string>(campaign.name || '');

  const handleSaveName = async () => {
    if (!name.trim() || name === (campaign.name || '')) {
      setEditingName(false);
      setName(campaign.name || '');
      return;
    }
    await onSaveField('name', name.trim());
    setEditingName(false);
  };

  const isActive = campaign.status === 'active';

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            size="sm"
            aria-label="Back to campaigns"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Back to Campaigns</span>
            <span className="sm:hidden">Back</span>
          </Button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-3">
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                <Phone className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  {editingName ? (
                    <div className="flex w-full items-center gap-2">
                      <label htmlFor="campaign-name-input" className="sr-only">
                        Campaign name
                      </label>
                      <Input
                        id="campaign-name-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-8 flex-1 text-lg font-bold sm:text-2xl"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            void handleSaveName();
                          } else if (e.key === 'Escape') {
                            setName(campaign.name || '');
                            setEditingName(false);
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          onClick={() => void handleSaveName()}
                          disabled={
                            !name.trim() || name === (campaign.name || '')
                          }
                          aria-label="Save name"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setName(campaign.name || '');
                            setEditingName(false);
                          }}
                          aria-label="Cancel editing name"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-w-0 items-center space-x-2">
                      <h1
                        className="truncate text-lg font-bold sm:text-2xl"
                        title={name}
                      >
                        {name}
                      </h1>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingName(true)}
                        className="h-6 w-6 flex-shrink-0 p-0"
                        aria-label="Edit campaign name"
                        title="Edit name"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-muted-foreground mt-1 truncate text-sm">
                  {campaign.description || 'Calling campaign'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge status={campaign.status} />

          {isActive ? (
            <Button
              onClick={() => void onPause()}
              size="sm"
              variant="default"
              disabled={isUpdatingStatus}
            >
              <Pause className="mr-2 h-4 w-4" />
              {isUpdatingStatus ? 'Pausing…' : 'Pause Campaign'}
            </Button>
          ) : (
            <Button
              onClick={() => void onActivate()}
              size="sm"
              variant="default"
              disabled={isUpdatingStatus}
            >
              <Play className="mr-2 h-4 w-4" />
              {isUpdatingStatus ? 'Activating…' : 'Activate Campaign'}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Preview Call Script
              </DropdownMenuItem>
              {/* Primary Activate/Pause button already present — avoid duplicate menu items */}
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download className="mr-2 h-4 w-4" />
                Export Results
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? 'Deleting…' : 'Delete Campaign'}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this campaign? This action
                      cannot be undone and will permanently remove all
                      associated data including leads and conversations.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => void onDelete()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Campaign
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
