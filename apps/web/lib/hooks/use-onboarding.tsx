'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';

import { getSupabaseBrowserClient } from '@kit/supabase/browser-client';

interface OnboardingState {
  isActive: boolean;
  currentStep: number;
  isCompleted: boolean;
  isSkipped: boolean;
  showWelcome: boolean;
}

interface OnboardingContextType extends OnboardingState {
  isLoading: boolean;
  startTour: () => Promise<void>;
  skipTour: () => Promise<void>;
  completeTour: () => Promise<void>;
  updateStep: (step: number) => Promise<void>;
  restartTour: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined,
);

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<OnboardingState>({
    isActive: false,
    currentStep: 0,
    isCompleted: false,
    isSkipped: false,
    showWelcome: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  // Helper to update team member onboarding data
  const updateTeamMemberOnboarding = useCallback(
    async (
      updateData: Record<string, unknown>,
      errorContext: string,
    ): Promise<{ success: boolean; user?: { id: string } }> => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error(
            `[useOnboarding] ${errorContext} auth error:`,
            authError,
          );
          return { success: false };
        }

        const { error: updateError } = await supabase
          .from('team_members')
          .update(updateData)
          .eq('user_id', user.id);

        if (updateError) {
          console.error(
            `[useOnboarding] ${errorContext} update error:`,
            updateError,
          );
          return { success: false };
        }

        return { success: true, user };
      } catch (error) {
        console.error(
          `[useOnboarding] ${errorContext} unexpected error:`,
          error,
        );
        return { success: false };
      }
    },
    [supabase],
  );

  // Load onboarding state from database
  useEffect(() => {
    async function loadOnboardingState() {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error('[useOnboarding] Auth error:', authError);
          setIsLoading(false);
          return;
        }

        if (!user) {
          setIsLoading(false);
          return;
        }

        const { data: teamMember, error: queryError } = await supabase
          .from('team_members')
          .select(
            'onboarding_completed, onboarding_skipped, onboarding_current_step',
          )
          .eq('user_id', user.id)
          .single();

        if (queryError) {
          console.error('[useOnboarding] Query error:', queryError);
          setIsLoading(false);
          return;
        }

        if (teamMember) {
          setState({
            isActive: false,
            currentStep: teamMember.onboarding_current_step || 0,
            isCompleted: teamMember.onboarding_completed || false,
            isSkipped: teamMember.onboarding_skipped || false,
            showWelcome:
              !teamMember.onboarding_completed &&
              !teamMember.onboarding_skipped,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('[useOnboarding] Unexpected error:', error);
        setIsLoading(false);
      }
    }

    loadOnboardingState();
  }, [supabase]);

  // Start the tour
  const startTour = useCallback(async () => {
    setState((prev) => ({ ...prev, isActive: true, showWelcome: false }));
    router.push('/home');
  }, [router]);

  // Skip the tour
  const skipTour = useCallback(async () => {
    const result = await updateTeamMemberOnboarding(
      { onboarding_skipped: true },
      'Skip tour',
    );

    if (result.success) {
      setState((prev) => ({
        ...prev,
        isSkipped: true,
        showWelcome: false,
        isActive: false,
      }));
    }
  }, [updateTeamMemberOnboarding]);

  // Complete the tour
  const completeTour = useCallback(async () => {
    const result = await updateTeamMemberOnboarding(
      {
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      },
      'Complete tour',
    );

    if (result.success) {
      setState((prev) => ({
        ...prev,
        isCompleted: true,
        isActive: false,
      }));
    }
  }, [updateTeamMemberOnboarding]);

  // Update current step
  const updateStep = useCallback(
    async (step: number) => {
      const result = await updateTeamMemberOnboarding(
        { onboarding_current_step: step },
        'Update step',
      );

      if (result.success) {
        setState((prev) => ({ ...prev, currentStep: step }));
      }
    },
    [updateTeamMemberOnboarding],
  );

  // Restart tour
  const restartTour = useCallback(async () => {
    const result = await updateTeamMemberOnboarding(
      {
        onboarding_completed: false,
        onboarding_skipped: false,
        onboarding_current_step: 0,
      },
      'Restart tour',
    );

    if (result.success) {
      setState({
        isActive: true,
        currentStep: 0,
        isCompleted: false,
        isSkipped: false,
        showWelcome: false,
      });

      router.push('/home');
    }
  }, [updateTeamMemberOnboarding, router]);

  const value: OnboardingContextType = {
    ...state,
    isLoading,
    startTour,
    skipTour,
    completeTour,
    updateStep,
    restartTour,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }

  return context;
}
