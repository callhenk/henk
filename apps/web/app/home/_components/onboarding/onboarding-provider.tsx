'use client';

import { useEffect } from 'react';
import { Onborda, OnbordaProvider, useOnborda } from 'onborda';

import { onboardingTours } from './tour-steps.config';
import {
  useOnboarding,
  OnboardingProvider as OnboardingStateProvider,
} from '~/lib/hooks/use-onboarding';
import { OnboardingWelcomeModal } from './onboarding-welcome-modal';
import { OnboardingCard } from './onboarding-card';
import featuresFlagConfig from '~/config/feature-flags.config';

function OnboardingManager() {
  const { isActive, completeTour, updateStep } = useOnboarding();
  const { currentStep, startOnborda, closeOnborda, isOnbordaVisible } =
    useOnborda();

  // Start onboarding when isActive becomes true
  useEffect(() => {
    // Check if onboarding is enabled via feature flag
    if (!featuresFlagConfig.enableUserOnboarding) {
      return;
    }

    if (isActive && !isOnbordaVisible) {
      // Validate tour exists and has steps
      const tour = onboardingTours[0];
      if (!tour || !tour.steps || tour.steps.length === 0) {
        console.error('[OnboardingManager] No valid tour steps found');
        return;
      }

      const timeoutIds: NodeJS.Timeout[] = [];

      // Wait for DOM to be ready and navigation to render
      const startTour = (retries = 0) => {
        const MAX_RETRIES = 10; // 2 seconds total (10 * 200ms)
        const firstElement = document.querySelector('a[href="/home"]');

        if (firstElement) {
          startOnborda('onboarding');
        } else if (retries < MAX_RETRIES) {
          const timeoutId = setTimeout(() => startTour(retries + 1), 200);
          timeoutIds.push(timeoutId);
        } else {
          console.error(
            '[OnboardingManager] Failed to find home navigation element after retries',
          );
        }
      };

      const initialTimeoutId = setTimeout(startTour, 500);
      timeoutIds.push(initialTimeoutId);

      // Cleanup function to clear all timeouts
      return () => {
        timeoutIds.forEach((id) => clearTimeout(id));
      };
    }
  }, [isActive, isOnbordaVisible, startOnborda]);

  // Track step changes
  useEffect(() => {
    if (isActive && isOnbordaVisible) {
      updateStep(currentStep);

      // Check if tour is completed (reached last step)
      const totalSteps = onboardingTours[0]?.steps.length || 0;
      if (currentStep >= totalSteps - 1) {
        // User reached the last step
        const timeoutId = setTimeout(() => {
          completeTour();
          closeOnborda();
        }, 2000);

        // Cleanup timeout on unmount or dependency change
        return () => {
          clearTimeout(timeoutId);
        };
      }
    }
  }, [
    currentStep,
    isActive,
    isOnbordaVisible,
    updateStep,
    completeTour,
    closeOnborda,
  ]);

  return null;
}

export function OnboardingWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingStateProvider>
      <OnboardingWelcomeModal />
      <OnbordaProvider>
        <Onborda steps={onboardingTours} cardComponent={OnboardingCard}>
          <OnboardingManager />
          {children}
        </Onborda>
      </OnbordaProvider>
    </OnboardingStateProvider>
  );
}
