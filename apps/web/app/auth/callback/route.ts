import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';

import { createAuthCallbackService } from '@kit/supabase/auth';
import { getSupabaseServerClient } from '@kit/supabase/server-client';

import pathsConfig from '~/config/paths.config';

export async function GET(request: NextRequest) {
  try {
    const service = createAuthCallbackService(getSupabaseServerClient());

    const { nextPath } = await service.exchangeCodeForSession(request, {
      redirectPath: pathsConfig.app.home,
      errorPath: '/auth/callback/error',
    });

    // Ensure we have a valid redirect path
    if (!nextPath || nextPath === '') {
      console.error('[Auth Callback] Invalid nextPath, defaulting to home');
      return redirect(pathsConfig.app.home);
    }

    return redirect(nextPath);
  } catch (error) {
    console.error('[Auth Callback] Unexpected error during code exchange:', error);

    // On error, redirect to sign-in with an error message
    const errorParams = new URLSearchParams({
      error: 'callback_failed',
      message: 'Authentication failed. Please try signing in again.',
    });

    return redirect(`${pathsConfig.auth.signIn}?${errorParams.toString()}`);
  }
}
