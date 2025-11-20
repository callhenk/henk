'use client';

import { useEffect } from 'react';

import { Onborda, OnbordaProvider, useOnborda } from 'onborda';

import featuresFlagConfig from '~/config/feature-flags.config';
import {
  OnboardingProvider as OnboardingStateProvider,
  useOnboarding,
} from '~/lib/hooks/use-onboarding';

import { OnboardingCard } from './onboarding-card';
import { OnboardingWelcomeModal } from './onboarding-welcome-modal';
import { onboardingTours } from './tour-steps.config';

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
        const MAX_RETRIES = 20; // 4 seconds total (20 * 200ms) - increased for reliability
        // Try multiple selectors as fallback
        const firstElement =
          document.querySelector('a[href="/home"]') ||
          document.querySelector('[data-tour="dashboard"]') ||
          document.querySelector('nav a:first-child');

        if (firstElement) {
          console.log('[OnboardingManager] Starting tour');
          try {
            startOnborda('onboarding');
          } catch (error) {
            console.error('[OnboardingManager] Failed to start tour:', error);
          }
        } else if (retries < MAX_RETRIES) {
          const timeoutId = setTimeout(() => startTour(retries + 1), 200);
          timeoutIds.push(timeoutId);
        } else {
          console.error(
            '[OnboardingManager] Failed to find navigation elements after',
            MAX_RETRIES,
            'retries',
          );
          // Gracefully fail by marking tour as skipped
          completeTour();
        }
      };

      const initialTimeoutId = setTimeout(startTour, 500);
      timeoutIds.push(initialTimeoutId);

      // Cleanup function to clear all timeouts
      return () => {
        timeoutIds.forEach((id) => clearTimeout(id));
      };
    }
  }, [isActive, isOnbordaVisible, startOnborda, completeTour]);

  // Track step changes
  useEffect(() => {
    if (isActive && isOnbordaVisible) {
      updateStep(currentStep);

      // Check if tour is completed (reached last step)
      const totalSteps = onboardingTours[0]?.steps.length || 0;
      if (currentStep >= totalSteps - 1) {
        // User reached the last step - give them more time to read
        console.log('[OnboardingManager] Reached last step, completing tour');
        const timeoutId = setTimeout(() => {
          try {
            completeTour();
            closeOnborda();
          } catch (error) {
            console.error('[OnboardingManager] Error completing tour:', error);
          }
        }, 5000); // Increased from 2s to 5s to give users time to read

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

export function OnboardingWrapper({ children }: { children: React.ReactNode }) {
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
