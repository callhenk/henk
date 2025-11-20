import { use } from 'react';

import { Eye, Key, Lock, Shield } from 'lucide-react';

import { MultiFactorAuthFactorsList } from '@kit/accounts/mfa';
import { UpdatePasswordFormContainer } from '@kit/accounts/password';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';

import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  return {
    title: 'Security Settings',
  };
};

function SecuritySettingsPage() {
  const user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Security Settings"
        description="Manage your account security and privacy settings"
      />
      <PageBody>
        <div className="mx-auto w-full max-w-4xl space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Security Overview
                </CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                Current security status and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Two-Factor Auth
                  </p>
                  <Badge variant="secondary" className="mt-1.5 font-medium">
                    Not Enabled
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Last Login
                  </p>
                  <p className="mt-1.5 text-sm">Today at 2:30 PM</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Password Strength
                  </p>
                  <Badge variant="default" className="mt-1.5 font-medium">
                    Strong
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Active Sessions
                  </p>
                  <p className="mt-1.5 text-sm">2 devices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Multi-Factor Authentication
                </CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                Multi-factor authentication (MFA) adds an additional layer of
                security by requiring a second form of verification when signing
                in. Set up MFA with your authenticator app to protect your
                account from unauthorized access.
              </p>
              <MultiFactorAuthFactorsList userId={user.id} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Password
                </CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                Update your account password
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <UpdatePasswordFormContainer
                callbackPath={
                  pathsConfig.auth.callback +
                  `?next=${pathsConfig.app.profileSettings}/security`
                }
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Privacy Settings
                </CardTitle>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                Control your privacy and data sharing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
                Configure how your data is used and shared within the platform.
                Control visibility settings, data export options, and
                third-party integrations.
              </p>
              <Button variant="outline" disabled className="h-10">
                Manage Privacy (Coming Soon)
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(SecuritySettingsPage);
