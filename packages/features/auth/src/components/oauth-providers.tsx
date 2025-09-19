'use client';

import { useCallback, useState } from 'react';

import type { Provider } from '@supabase/supabase-js';

import { useSignInWithProvider } from '@kit/supabase/hooks/use-sign-in-with-provider';
import { Trans } from '@kit/ui/trans';

import { AuthErrorAlert } from './auth-error-alert';
import { AuthProviderButton } from './auth-provider-button';

/**
 * @name OAUTH_SCOPES
 * @description
 * The OAuth scopes are used to specify the permissions that the application is requesting from the user.
 *
 * Please add your OAuth providers here and the scopes you want to use.
 *
 * @see https://supabase.com/docs/guides/auth/social-login
 */
const OAUTH_SCOPES: Partial<Record<Provider, string>> = {
  azure: 'email',
  // add your OAuth providers here
};

export function OauthProviders(props: {
  shouldCreateUser: boolean;
  enabledProviders: Provider[];

  paths: {
    callback: string;
    returnPath: string;
  };
}) {
  const signInWithProviderMutation = useSignInWithProvider();
  const [loadingProvider, setLoadingProvider] = useState<Provider | null>(null);
  const [redirectingProvider, setRedirectingProvider] =
    useState<Provider | null>(null);

  // we make the UI "busy" until the next page is fully loaded
  const loading = signInWithProviderMutation.isPending;

  const onSignInWithProvider = useCallback(
    async (provider: Provider, signInRequest: () => Promise<unknown>) => {
      try {
        setLoadingProvider(provider);
        const credential = await signInRequest();

        if (!credential) {
          return Promise.reject(new Error('Failed to sign in with provider'));
        }

        // OAuth successful - set redirecting state to maintain loading during redirect
        setLoadingProvider(null);
        setRedirectingProvider(provider);
      } catch (error) {
        // Only clear loading on error
        setLoadingProvider(null);
        setRedirectingProvider(null);
        throw error;
      }
    },
    [],
  );

  const enabledProviders = props.enabledProviders;

  if (!enabledProviders?.length) {
    return null;
  }

  return (
    <div className="relative">
      <div className={'flex w-full flex-1 flex-col space-y-3'}>
        <div className={'flex-col space-y-2'}>
          {enabledProviders.map((provider) => {
            return (
              <AuthProviderButton
                key={provider}
                providerId={provider}
                loading={
                  loadingProvider === provider ||
                  redirectingProvider === provider
                }
                disabled={loading || redirectingProvider !== null}
                onClick={() => {
                  const origin = window.location.origin;
                  const queryParams = new URLSearchParams();

                  if (props.paths.returnPath) {
                    queryParams.set('next', props.paths.returnPath);
                  }

                  const redirectPath = [
                    props.paths.callback,
                    queryParams.toString(),
                  ].join('?');

                  const redirectTo = [origin, redirectPath].join('');
                  const scopesOpts = OAUTH_SCOPES[provider] ?? {};

                  const credentials = {
                    provider,
                    options: {
                      shouldCreateUser: props.shouldCreateUser,
                      redirectTo,
                      ...scopesOpts,
                    },
                  };

                  return onSignInWithProvider(provider, () =>
                    signInWithProviderMutation.mutateAsync(credentials),
                  );
                }}
              >
                <Trans
                  i18nKey={'auth:signInWithProvider'}
                  values={{
                    provider: getProviderName(provider),
                  }}
                />
              </AuthProviderButton>
            );
          })}
        </div>

        <AuthErrorAlert error={signInWithProviderMutation.error} />
      </div>

      {/* Enhanced loading overlay */}
      {(loading || redirectingProvider !== null) && (
        <div className="bg-background/80 animate-in fade-in pointer-events-none absolute inset-0 z-10 backdrop-blur-md duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-3 px-4 text-center">
              <div className="relative">
                <div className="border-primary/30 h-8 w-8 rounded-full border-2"></div>
                <div className="border-primary absolute inset-0 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"></div>
              </div>
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">
                  {redirectingProvider
                    ? `Redirecting to ${getProviderName(redirectingProvider)}...`
                    : 'Connecting...'}
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

function getProviderName(providerId: string) {
  const capitalize = (value: string) =>
    value.slice(0, 1).toUpperCase() + value.slice(1);

  if (providerId.endsWith('.com')) {
    return capitalize(providerId.split('.com')[0]!);
  }

  return capitalize(providerId);
}
