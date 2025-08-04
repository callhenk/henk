'use client';

import React, { useState } from 'react';

import { Save, Trash2 } from 'lucide-react';

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
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { Textarea } from '@kit/ui/textarea';

type Business = Tables<'businesses'>['Row'];

interface BusinessSettingsContainerProps {
  userId: string;
}

function BusinessFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex justify-end space-x-2">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

export function BusinessSettingsContainer({
  userId: _userId,
}: BusinessSettingsContainerProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null,
  );
  const { data: businesses, isLoading: businessesLoading } =
    useUserBusinesses();
  const updateBusinessMutation = useUpdateBusiness();
  const deleteBusinessMutation = useDeleteBusiness();
  type FormState = {
    name: string;
    description: string;
    errors?: { name?: string; description?: string };
  };

  const [formStates, setFormStates] = useState<Record<string, FormState>>({});

  // Initialize form state for each business
  React.useEffect(() => {
    if (businesses) {
      const newStates: typeof formStates = {};
      businesses.forEach((b) => {
        newStates[b.id] = {
          name: b.name,
          description: b.description || '',
          errors: {},
        };
      });
      setFormStates(newStates);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businesses?.map((b) => b.id).join(',')]);

  const validate = (name: string, description: string) => {
    const errors: { name?: string; description?: string } = {};
    if (!name.trim()) {
      errors.name = 'Business name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Business name must be at least 2 characters';
    } else if (name.trim().length > 100) {
      errors.name = 'Business name must be less than 100 characters';
    }
    if (description && description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    return errors;
  };

  const handleChange = (
    id: string,
    field: 'name' | 'description',
    value: string,
  ) => {
    setFormStates((prev) => {
      const current = prev[id];
      if (!current) return prev;

      return {
        ...prev,
        [id]: {
          ...current,
          [field]: value,
          errors: {
            ...current.errors,
            [field]: undefined,
          },
        },
      };
    });
  };

  const handleSave = async (business: Business) => {
    const formState = formStates[business.id];
    if (!formState) return;

    const { name, description } = formState;
    const errors = validate(name, description);
    if (Object.keys(errors).length > 0) {
      setFormStates((prev) => {
        const current = prev[business.id];
        if (!current) return prev;

        return {
          ...prev,
          [business.id]: {
            ...current,
            errors,
          },
        };
      });
      return;
    }
    try {
      await updateBusinessMutation.mutateAsync({
        id: business.id,
        name: name.trim(),
        description: description.trim() || null,
      });
    } catch {
      // Optionally show a toast
    }
  };

  const handleDelete = async () => {
    if (!selectedBusiness) return;
    try {
      await deleteBusinessMutation.mutateAsync(selectedBusiness.id);
      setSelectedBusiness(null);
    } catch {
      // Handle error
    }
  };

  if (businessesLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Business Management
          </h1>
          <p className="text-muted-foreground">Manage your businesses</p>
        </div>
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
              <BusinessFormSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Business Management
        </h1>
        <p className="text-muted-foreground">Manage your businesses</p>
      </div>

      <div className="space-y-8">
        {businesses?.map((business, index) => (
          <div key={business.id}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium">Business {index + 1}</h2>
              <Badge
                variant={business.status === 'active' ? 'default' : 'secondary'}
              >
                {business.status}
              </Badge>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={`name-${business.id}`}>Business Name</Label>
                <Input
                  id={`name-${business.id}`}
                  value={formStates[business.id]?.name || ''}
                  onChange={(e) =>
                    handleChange(business.id, 'name', e.target.value)
                  }
                  className={
                    formStates[business.id]?.errors?.name
                      ? 'border-destructive'
                      : ''
                  }
                  placeholder="Enter business name"
                />
                {formStates[business.id]?.errors?.name && (
                  <p className="text-destructive text-sm">
                    {formStates[business.id]?.errors?.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`description-${business.id}`}>
                  Description (Optional)
                </Label>
                <Textarea
                  id={`description-${business.id}`}
                  value={formStates[business.id]?.description || ''}
                  onChange={(e) =>
                    handleChange(business.id, 'description', e.target.value)
                  }
                  className={
                    formStates[business.id]?.errors?.description
                      ? 'border-destructive'
                      : ''
                  }
                  placeholder="Brief description of your business"
                  rows={4}
                />
                {formStates[business.id]?.errors?.description && (
                  <p className="text-destructive text-sm">
                    {formStates[business.id]?.errors?.description}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => handleSave(business)}
                  disabled={updateBusinessMutation.isPending}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateBusinessMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setSelectedBusiness(business)}
                  disabled={deleteBusinessMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>

            {index < businesses.length - 1 && <Separator className="my-8" />}
          </div>
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
              onClick={handleDelete}
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
