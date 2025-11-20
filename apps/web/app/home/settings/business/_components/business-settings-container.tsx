'use client';

import React, { useState } from 'react';

import { Save } from 'lucide-react';
import { toast } from 'sonner';

import type { Tables } from '@kit/supabase/database';
import { useUpdateBusiness } from '@kit/supabase/hooks/businesses/use-business-mutations';
import { useUserBusinesses } from '@kit/supabase/hooks/businesses/use-businesses';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';
import { Textarea } from '@kit/ui/textarea';

type Business = Tables<'businesses'>;

interface BusinessSettingsContainerProps {
  userId: string;
}

function BusinessFormSkeleton() {
  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="rounded-lg border-2 border-border bg-card shadow-sm">
        <div className="space-y-8 p-6 sm:p-8">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-3 w-64" />
          </div>
          <div className="flex justify-end pt-2">
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessSettingsContainer({
  userId: _userId,
}: BusinessSettingsContainerProps) {
  const { data: businesses, isLoading: businessesLoading } =
    useUserBusinesses();
  const updateBusinessMutation = useUpdateBusiness();
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
      toast.success('Business settings saved successfully');
    } catch (error) {
      console.error('Error updating business:', error);
      toast.error('Failed to save business settings. Please try again.');
    }
  };

  if (businessesLoading) {
    return (
      <div className="space-y-10">
        {Array.from({ length: 2 }).map((_, index) => (
          <BusinessFormSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">

      <div className="space-y-8">
        {businesses?.map((business, index) => (
          <div key={business.id}>
            {/* Header with title, description, and status badge */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <h2 className="text-foreground text-lg font-semibold tracking-tight">
                  Business {index + 1}
                </h2>
                <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                  Manage your business information and settings
                </p>
              </div>
              <div className="flex items-center">
                <Badge
                  variant={business.status === 'active' ? 'default' : 'secondary'}
                  className="px-3 py-1 text-xs font-medium"
                >
                  {business.status}
                </Badge>
              </div>
            </div>

            {/* Form card with elevation */}
            <div className="rounded-lg border-2 border-border bg-card shadow-sm">
              <div className="space-y-6 p-5 sm:space-y-8 sm:p-8">
                {/* Business Name Field */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor={`name-${business.id}`}
                    className="text-sm font-medium"
                  >
                    Business Name
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id={`name-${business.id}`}
                    value={formStates[business.id]?.name || ''}
                    onChange={(e) =>
                      handleChange(business.id, 'name', e.target.value)
                    }
                    className={`h-10 ${
                      formStates[business.id]?.errors?.name
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }`}
                    placeholder="Enter your business name"
                  />
                  {formStates[business.id]?.errors?.name ? (
                    <p className="text-destructive text-sm leading-relaxed">
                      {formStates[business.id]?.errors?.name}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      This is the name that will be displayed throughout the
                      platform
                    </p>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-2.5">
                  <Label
                    htmlFor={`description-${business.id}`}
                    className="text-sm font-medium"
                  >
                    Description
                    <span className="text-muted-foreground ml-1 text-xs font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Textarea
                    id={`description-${business.id}`}
                    value={formStates[business.id]?.description || ''}
                    onChange={(e) =>
                      handleChange(business.id, 'description', e.target.value)
                    }
                    className={
                      formStates[business.id]?.errors?.description
                        ? 'border-destructive focus-visible:ring-destructive'
                        : ''
                    }
                    placeholder="Provide a brief description of your business"
                    rows={4}
                  />
                  {formStates[business.id]?.errors?.description ? (
                    <p className="text-destructive text-sm leading-relaxed">
                      {formStates[business.id]?.errors?.description}
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      Help others understand what your business does (max 500
                      characters)
                    </p>
                  )}
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => handleSave(business)}
                    disabled={updateBusinessMutation.isPending}
                    size="default"
                    className="h-10 w-full sm:w-auto"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {updateBusinessMutation.isPending
                      ? 'Saving...'
                      : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>

            {index < businesses.length - 1 && <Separator className="my-10" />}
          </div>
        ))}
      </div>
    </div>
  );
}
