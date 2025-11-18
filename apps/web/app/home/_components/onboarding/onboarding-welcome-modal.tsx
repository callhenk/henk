'use client';

import { useOnboarding } from '~/lib/hooks/use-onboarding';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { Button } from '@kit/ui/button';
import { Sparkles } from 'lucide-react';
import featuresFlagConfig from '~/config/feature-flags.config';

export function OnboardingWelcomeModal() {
  const { showWelcome, startTour, skipTour } = useOnboarding();

  // Check feature flag
  const isOnboardingEnabled = featuresFlagConfig.enableUserOnboarding;
  const shouldShow = isOnboardingEnabled && showWelcome;

  return (
    <Dialog open={shouldShow} onOpenChange={(open) => !open && skipTour()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Welcome to Henk!
          </DialogTitle>
          <DialogDescription className="text-center">
            Take a quick 2-minute tour to learn how to create AI agents, import
            donors, and launch your first fundraising campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              1
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Create AI Agents</p>
              <p className="text-xs text-muted-foreground">
                Set up voice agents to make fundraising calls
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              2
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Import Donors</p>
              <p className="text-xs text-muted-foreground">
                Upload contacts or sync from your CRM
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border p-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              3
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Launch Campaigns</p>
              <p className="text-xs text-muted-foreground">
                Put it all together and start fundraising
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={startTour} size="lg" className="w-full">
            <Sparkles className="mr-2 h-4 w-4" />
            Start Tour
          </Button>
          <Button
            onClick={skipTour}
            variant="ghost"
            size="lg"
            className="w-full"
          >
            Skip - I&apos;ll explore on my own
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
