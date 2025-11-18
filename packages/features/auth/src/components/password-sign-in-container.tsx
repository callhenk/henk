'use client';

import { useCallback, useState } from 'react';

import type { z } from 'zod';

import { useSignInWithEmailPassword } from '@kit/supabase/hooks/use-sign-in-with-email-password';

import { useCaptchaToken } from '../captcha/client';
import type { PasswordSignInSchema } from '../schemas/password-sign-in.schema';
import { AuthErrorAlert } from './auth-error-alert';
import { PasswordSignInForm } from './password-sign-in-form';

export function PasswordSignInContainer({
  onSignIn,
}: {
  onSignIn?: (userId?: string) => unknown;
}) {
  const { captchaToken, resetCaptchaToken } = useCaptchaToken();
  const signInMutation = useSignInWithEmailPassword();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Keep loading state active during redirect to prevent flash
  const isLoading = signInMutation.isPending || isRedirecting;

  const onSubmit = useCallback(
    async (credentials: z.infer<typeof PasswordSignInSchema>) => {
      try {
        const data = await signInMutation.mutateAsync({
          ...credentials,
          options: { captchaToken },
        });

        if (onSignIn) {
          const userId = data?.user?.id;

          // Set redirecting state to maintain loading during redirect
          setIsRedirecting(true);
          onSignIn(userId);
        }
      } catch {
        // Only reset loading on error - keep it active on success for redirect
        setIsRedirecting(false);
      } finally {
        resetCaptchaToken();
      }
    },
    [captchaToken, onSignIn, resetCaptchaToken, signInMutation],
  );

  return (
    <div className="relative space-y-4">
      <AuthErrorAlert error={signInMutation.error} />

      <PasswordSignInForm onSubmit={onSubmit} loading={isLoading} />

      {/* Enhanced loading overlay */}
      {isLoading && (
        <div className="bg-background/80 animate-in fade-in pointer-events-none absolute inset-0 z-10 backdrop-blur-md duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3 px-4 text-center">
              <div className="relative">
                <div className="border-primary/30 h-8 w-8 rounded-full border-2"></div>
                <div className="border-primary absolute inset-0 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
              </div>
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  Signing you in...
                </p>
                <p className="text-muted-foreground text-xs">
                  Please wait a moment
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
