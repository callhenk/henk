'use client';

import { useState } from 'react';

import { Calendar, Check, Mail } from 'lucide-react';
import { toast } from 'sonner';

import type { BillingPlan } from '@kit/supabase/hooks/billing';
import { useBillingPlans } from '@kit/supabase/hooks/billing';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Label } from '@kit/ui/label';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import { Separator } from '@kit/ui/separator';
import { Skeleton } from '@kit/ui/skeleton';

interface UpgradePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlanName: string;
}

export function UpgradePlanDialog({
  open,
  onOpenChange,
  currentPlanName,
}: UpgradePlanDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: plans, isLoading } = useBillingPlans();

  // Filter out current plan and free plan, show only upgrade options
  const upgradePlans = plans?.filter(
    (plan) => plan.name !== 'free' && plan.name !== currentPlanName,
  );

  const handleSendRequest = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan to request an upgrade.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/billing/request-upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          planName: selectedPlan.display_name,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send upgrade request');
      }

      toast.success('Upgrade request sent! Our team will contact you shortly.');

      onOpenChange(false);
    } catch {
      toast.error('Failed to send request. Please try again or book a call.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookCall = () => {
    window.open('https://calendly.com/jerome-callhenk/30min', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upgrade Your Plan</DialogTitle>
          <DialogDescription>
            Select a plan to upgrade to, then either send us a request or book a
            call to discuss.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <UpgradePlanSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Plan Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Plan</Label>
              <RadioGroup
                value={selectedPlan?.id || ''}
                onValueChange={(value) => {
                  const plan = upgradePlans?.find((p) => p.id === value);
                  setSelectedPlan(plan || null);
                }}
              >
                <div className="space-y-3">
                  {upgradePlans?.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      selected={selectedPlan?.id === plan.id}
                    />
                  ))}
                </div>
              </RadioGroup>
            </div>

            {selectedPlan && (
              <>
                <Separator />

                {/* Plan Features */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    {selectedPlan.display_name} Features
                  </Label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {selectedPlan.features &&
                      Object.entries(
                        selectedPlan.features as Record<string, boolean>,
                      )
                        .filter(([_, enabled]) => enabled)
                        .map(([key]) => (
                          <div key={key} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            <span className="text-sm capitalize">
                              {key.replace(/_/g, ' ')}
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Next Steps</Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                  onClick={handleSendRequest}
                  disabled={!selectedPlan || isSubmitting}
                  className="h-auto flex-col gap-2 py-4"
                >
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">Send Upgrade Request</span>
                  <span className="text-xs opacity-90">
                    We&apos;ll email you shortly
                  </span>
                </Button>

                <Button
                  onClick={handleBookCall}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Book a Call</span>
                  <span className="text-xs opacity-90">
                    Talk to us directly
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface PlanCardProps {
  plan: BillingPlan;
  selected: boolean;
}

function PlanCard({ plan, selected }: PlanCardProps) {
  const priceMonthly = plan.price_monthly / 100;
  const priceYearly = plan.price_yearly / 100;

  return (
    <Label
      htmlFor={plan.id}
      className={`relative flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      }`}
    >
      <RadioGroupItem value={plan.id} id={plan.id} className="mt-1" />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{plan.display_name}</span>
        </div>
        {plan.description && (
          <p className="text-muted-foreground mt-1 text-sm">
            {plan.description}
          </p>
        )}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold">${priceMonthly}</span>
          <span className="text-muted-foreground text-sm">/month</span>
          {priceYearly > 0 && (
            <span className="text-muted-foreground text-sm">
              or ${priceYearly}/year
            </span>
          )}
        </div>
      </div>
    </Label>
  );
}

function UpgradePlanSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
