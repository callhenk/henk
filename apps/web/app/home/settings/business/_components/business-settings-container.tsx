'use client';

import { useState } from 'react';

import { MoreHorizontal, Save, Trash2, X } from 'lucide-react';

import type { Tables } from '@kit/supabase/database';
import {
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { Input } from '@kit/ui/input';
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
  const [editingBusiness, setEditingBusiness] = useState<string | null>(null);

  // Hooks
  const { data: businesses, isLoading: businessesLoading } =
    useUserBusinesses();
  const updateBusinessMutation = useUpdateBusiness();
  const deleteBusinessMutation = useDeleteBusiness();

  // Form states
  const [businessForm, setBusinessForm] = useState({
    name: '',
    description: '',
  });
  const [businessFormErrors, setBusinessFormErrors] = useState<{
    name?: string;
    description?: string;
  }>({});

  const validateBusinessForm = () => {
    const errors: { name?: string; description?: string } = {};

    if (!businessForm.name.trim()) {
      errors.name = 'Business name is required';
    } else if (businessForm.name.trim().length < 2) {
      errors.name = 'Business name must be at least 2 characters';
    } else if (businessForm.name.trim().length > 100) {
      errors.name = 'Business name must be less than 100 characters';
    }

    if (businessForm.description && businessForm.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }

    setBusinessFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateBusiness = async (businessId: string) => {
    if (!validateBusinessForm()) return;

    try {
      await updateBusinessMutation.mutateAsync({
        id: businessId,
        name: businessForm.name.trim(),
        description: businessForm.description.trim() || null,
      });

      setBusinessForm({ name: '', description: '' });
      setBusinessFormErrors({});
      setEditingBusiness(null);
    } catch (error) {
      console.error('Failed to update business:', error);
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

  const startEditing = (business: Business) => {
    setEditingBusiness(business.id);
    setBusinessForm({
      name: business.name,
      description: business.description || '',
    });
    setBusinessFormErrors({});
  };

  const cancelEditing = () => {
    setEditingBusiness(null);
    setBusinessForm({ name: '', description: '' });
    setBusinessFormErrors({});
  };

  if (businessesLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Business Management
            </h1>
            <p className="text-muted-foreground">Manage your businesses</p>
          </div>
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
          <p className="text-muted-foreground">Manage your businesses</p>
        </div>
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
                  {editingBusiness === business.id ? (
                    <div className="space-y-2">
                      <Input
                        value={businessForm.name}
                        onChange={(e) => {
                          setBusinessForm({
                            ...businessForm,
                            name: e.target.value,
                          });
                          if (businessFormErrors.name) {
                            setBusinessFormErrors({
                              ...businessFormErrors,
                              name: undefined,
                            });
                          }
                        }}
                        className={
                          businessFormErrors.name ? 'border-destructive' : ''
                        }
                      />
                      {businessFormErrors.name && (
                        <p className="text-destructive text-sm">
                          {businessFormErrors.name}
                        </p>
                      )}
                    </div>
                  ) : (
                    <CardTitle
                      className="hover:text-primary cursor-pointer truncate text-lg"
                      onClick={() => startEditing(business)}
                    >
                      {business.name}
                    </CardTitle>
                  )}
                  {editingBusiness === business.id ? (
                    <div className="space-y-2">
                      <Textarea
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
                        className={
                          businessFormErrors.description
                            ? 'border-destructive'
                            : ''
                        }
                        rows={2}
                      />
                      {businessFormErrors.description && (
                        <p className="text-destructive text-sm">
                          {businessFormErrors.description}
                        </p>
                      )}
                    </div>
                  ) : (
                    <CardDescription
                      className="hover:text-primary mt-1 line-clamp-2 cursor-pointer"
                      onClick={() => startEditing(business)}
                    >
                      {business.description || 'No description'}
                    </CardDescription>
                  )}
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
              <div className="flex items-center justify-end space-x-2">
                {editingBusiness === business.id ? (
                  <>
                    <Button variant="outline" size="sm" onClick={cancelEditing}>
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateBusiness(business.id)}
                      disabled={updateBusinessMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {updateBusinessMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
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
                      <DropdownMenuItem onClick={() => startEditing(business)}>
                        <Save className="mr-2 h-4 w-4" />
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
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!selectedBusiness}
        onOpenChange={(open) => !open && setSelectedBusiness(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Business</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedBusiness?.name}
              &quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBusiness}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
