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
      } catch (error) {
        // Only reset loading on error - keep it active on success for redirect
        setIsRedirecting(false);
      } finally {
        resetCaptchaToken();
      }
    },
    [captchaToken, onSignIn, resetCaptchaToken, signInMutation],
  );

  return (
    <div className="space-y-4 relative">
      <AuthErrorAlert error={signInMutation.error} />

      <PasswordSignInForm onSubmit={onSubmit} loading={isLoading} />
      
      {/* Enhanced loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-md pointer-events-none animate-in fade-in duration-300 z-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3 text-center px-4">
              <div className="relative">
                <div className="w-8 h-8 border-2 border-primary/30 rounded-full"></div>
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin absolute inset-0"></div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Signing you in...</p>
                <p className="text-xs text-muted-foreground">Please wait a moment</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
