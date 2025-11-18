'use client';

import { GraduationCap } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { useOnboarding } from '~/lib/hooks/use-onboarding';

export function RestartOnboardingButton() {
  const { restartTour, isLoading } = useOnboarding();

  return (
    <Button
      onClick={restartTour}
      variant="ghost"
      size="sm"
      disabled={isLoading}
      className="w-full justify-start"
    >
      <GraduationCap className="mr-2 h-4 w-4" />
      Restart Product Tour
    </Button>
  );
}
