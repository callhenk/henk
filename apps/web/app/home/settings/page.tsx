import { use } from 'react';

import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { PageBody } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Button } from '@kit/ui/button';
import { Building2, Users, User } from 'lucide-react';

import authConfig from '~/config/auth.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

const callbackPath = pathsConfig.auth.callback;

const features = {
  enableAccountDeletion: true,
  enablePasswordUpdate: authConfig.providers.password,
};

const paths = {
  callback: callbackPath + `?next=${pathsConfig.app.profileSettings}`,
};

export const generateMetadata = async () => {
  const i18n = await createI18nServerInstance();
  const title = i18n.t('account:settingsTab');

  return {
    title,
  };
};

function SettingsPage() {
  const userId = use(requireUserInServerComponent()).id;

  return (
    <PageBody>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, businesses, and team settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal Account Settings */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <CardTitle>Personal Account</CardTitle>
              </div>
              <CardDescription>
                Manage your personal account settings, password, and profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <PersonalAccountSettingsContainer
                  userId={userId}
                  paths={paths}
                  features={features}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Settings */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <CardTitle>Business Management</CardTitle>
              </div>
              <CardDescription>
                Create and manage businesses, team members, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <a href="/home/settings/business">
                  Manage Businesses
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Team Settings */}
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <CardTitle>Team Management</CardTitle>
              </div>
              <CardDescription>
                Invite team members, manage roles, and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <a href="/home/settings/business">
                  Manage Team
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageBody>
  );
}

export default withI18n(SettingsPage);
