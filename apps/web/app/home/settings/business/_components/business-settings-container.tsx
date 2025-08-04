'use client';

import { useState } from 'react';

import { Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';

import type { Tables } from '@kit/supabase/database';
import {
  useCreateBusiness,
  useDeleteBusiness,
  useUpdateBusiness,
} from '@kit/supabase/hooks/businesses/use-business-mutations';
import { useUserBusinesses } from '@kit/supabase/hooks/businesses/use-businesses';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Skeleton } from '@kit/ui/skeleton';
import { Textarea } from '@kit/ui/textarea';

type Business = Tables<'businesses'>['Row'];

interface BusinessSettingsContainerProps {
  userId: string;
}

function BusinessCardSkeleton() {
  return (
    <Card className="group relative overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-end space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

export function BusinessSettingsContainer({
  userId: _userId,
}: BusinessSettingsContainerProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Hooks
  const { data: businesses, isLoading: businessesLoading } =
    useUserBusinesses();
  const createBusinessMutation = useCreateBusiness();
  const updateBusinessMutation = useUpdateBusiness();
  const deleteBusinessMutation = useDeleteBusiness();

  // Form states
  const [businessForm, setBusinessForm] = useState({
    name: '',
    description: '',
  });

  // Error states
  const [businessFormErrors, setBusinessFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  // Validation functions
  const validateBusinessForm = () => {
    const errors: { name?: string; description?: string } = {};

    if (!businessForm.name.trim()) {
      errors.name = 'Business name is required';
    }

    if (businessForm.name.length > 100) {
      errors.name = 'Business name must be less than 100 characters';
    }

    if (businessForm.description && businessForm.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setBusinessFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateBusiness = async () => {
    if (!validateBusinessForm()) {
      return;
    }

    try {
      await createBusinessMutation.mutateAsync({
        name: businessForm.name.trim(),
        description: businessForm.description.trim() || null,
        status: 'active',
      });
      setBusinessForm({ name: '', description: '' });
      setBusinessFormErrors({});
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create business:', error);
      // TODO: Add proper error handling with toast notifications
    }
  };

  const handleUpdateBusiness = async () => {
    if (!selectedBusiness) return;

    if (!validateBusinessForm()) {
      return;
    }

    try {
      await updateBusinessMutation.mutateAsync({
        id: selectedBusiness.id,
        name: businessForm.name.trim(),
        description: businessForm.description.trim() || null,
      });
      setBusinessForm({ name: '', description: '' });
      setBusinessFormErrors({});
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update business:', error);
      // TODO: Add proper error handling with toast notifications
    }
  };

  const handleDeleteBusiness = async () => {
    if (!selectedBusiness) return;

    try {
      await deleteBusinessMutation.mutateAsync(selectedBusiness.id);
      setSelectedBusiness(null);
    } catch (error) {
      console.error('Failed to delete business:', error);
    }
  };

  const openEditDialog = (business: Business) => {
    setSelectedBusiness(business);
    setBusinessForm({
      name: business.name,
      description: business.description || '',
    });
    setIsEditDialogOpen(true);
  };

  if (businessesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <BusinessCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Business Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage your businesses and team members
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Business
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Business</DialogTitle>
              <DialogDescription>
                Add a new business to organize your campaigns and team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  value={businessForm.name}
                  onChange={(e) => {
                    setBusinessForm({ ...businessForm, name: e.target.value });
                    if (businessFormErrors.name) {
                      setBusinessFormErrors({
                        ...businessFormErrors,
                        name: undefined,
                      });
                    }
                  }}
                  placeholder="Enter business name"
                  className={
                    businessFormErrors.name ? 'border-destructive' : ''
                  }
                />
                {businessFormErrors.name && (
                  <p className="text-destructive mt-1 text-sm">
                    {businessFormErrors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={businessForm.description}
                  onChange={(e) => {
                    setBusinessForm({
                      ...businessForm,
                      description: e.target.value,
                    });
                    if (businessFormErrors.description) {
                      setBusinessFormErrors({
                        ...businessFormErrors,
                        description: undefined,
                      });
                    }
                  }}
                  placeholder="Brief description of your business"
                  className={
                    businessFormErrors.description ? 'border-destructive' : ''
                  }
                  rows={3}
                />
                {businessFormErrors.description && (
                  <p className="text-destructive mt-1 text-sm">
                    {businessFormErrors.description}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setBusinessForm({ name: '', description: '' });
                  setBusinessFormErrors({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBusiness}
                disabled={
                  !businessForm.name || createBusinessMutation.isPending
                }
              >
                {createBusinessMutation.isPending
                  ? 'Creating...'
                  : 'Create Business'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Businesses Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {businesses?.map((business) => (
          <Card
            key={business.id}
            className="group relative overflow-hidden transition-all hover:shadow-md"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <CardTitle className="truncate text-lg">
                    {business.name}
                  </CardTitle>
                  <CardDescription className="mt-1 line-clamp-2">
                    {business.description || 'No description'}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    business.status === 'active' ? 'default' : 'secondary'
                  }
                  className="ml-2 flex-shrink-0"
                >
                  {business.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:scale-90"
                    >
                      <MoreHorizontal className="h-4 w-4 stroke-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(business)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Business
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setSelectedBusiness(business)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Business
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Business Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
            <DialogDescription>
              Update your business information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Business Name</Label>
              <Input
                id="edit-name"
                value={businessForm.name}
                onChange={(e) => {
                  setBusinessForm({ ...businessForm, name: e.target.value });
                  if (businessFormErrors.name) {
                    setBusinessFormErrors({
                      ...businessFormErrors,
                      name: undefined,
                    });
                  }
                }}
                placeholder="Enter business name"
                className={businessFormErrors.name ? 'border-destructive' : ''}
              />
              {businessFormErrors.name && (
                <p className="text-destructive mt-1 text-sm">
                  {businessFormErrors.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={businessForm.description}
                onChange={(e) => {
                  setBusinessForm({
                    ...businessForm,
                    description: e.target.value,
                  });
                  if (businessFormErrors.description) {
                    setBusinessFormErrors({
                      ...businessFormErrors,
                      description: undefined,
                    });
                  }
                }}
                placeholder="Enter business description"
                className={
                  businessFormErrors.description ? 'border-destructive' : ''
                }
                rows={3}
              />
              {businessFormErrors.description && (
                <p className="text-destructive mt-1 text-sm">
                  {businessFormErrors.description}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setBusinessForm({ name: '', description: '' });
                setBusinessFormErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateBusiness}
              disabled={!businessForm.name || updateBusinessMutation.isPending}
            >
              {updateBusinessMutation.isPending
                ? 'Updating...'
                : 'Update Business'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Business Confirmation */}
      {selectedBusiness && (
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Business</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{selectedBusiness.name}
                &quot;? This action cannot be undone and will remove all
                associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteBusiness}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Business
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
