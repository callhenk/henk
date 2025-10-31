import { Metadata } from 'next';

import { AuthLayoutShell } from '@kit/auth/shared';

import { AppLogo } from '~/components/app-logo';

// Auth pages should not be indexed by search engines
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

function AuthLayout({ children }: React.PropsWithChildren) {
  return <AuthLayoutShell Logo={AppLogo}>{children}</AuthLayoutShell>;
}

export default AuthLayout;
