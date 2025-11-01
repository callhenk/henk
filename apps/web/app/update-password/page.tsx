import { UpdatePasswordForm } from '@kit/auth/password-reset';
import { AuthLayoutShell } from '@kit/auth/shared';

import { AppLogo } from '~/components/app-logo';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { createClient } from '~/lib/supabase/server';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('auth:updatePassword'),
  };
};

const Logo = () => <AppLogo href={''} />;

interface UpdatePasswordPageProps {
  searchParams: Promise<{
    callback?: string;
    token?: string;
    type?: string;
  }>;
}

async function UpdatePasswordPage(props: UpdatePasswordPageProps) {
  const searchParams = await props.searchParams;
  const { callback, token, type } = searchParams;

  // Check if this is a password recovery link (has token and type=recovery)
  const isPasswordRecovery = token && type === 'recovery';

  // Only require authentication if this is NOT a password recovery flow
  if (!isPasswordRecovery) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Redirect to sign in if user is not authenticated and not using recovery link
    if (!user) {
      return (
        <AuthLayoutShell Logo={Logo}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Please sign in to update your password
            </p>
          </div>
        </AuthLayoutShell>
      );
    }
  }

  const redirectTo = callback ?? pathsConfig.app.home;

  return (
    <AuthLayoutShell Logo={Logo}>
      <UpdatePasswordForm redirectTo={redirectTo} />
    </AuthLayoutShell>
  );
}

export default withI18n(UpdatePasswordPage);
