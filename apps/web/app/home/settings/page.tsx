import { use } from 'react';

import { PersonalAccountSettingsContainer } from '@kit/accounts/personal-account-settings';
import { Badge } from '@kit/ui/badge';
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
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

const callbackPath = pathsConfig.auth.callback;

const features = {
  enableAccountDeletion: true,
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

function AccountSettingsPageContent() {
  const user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Account Settings"
        description="Manage your personal account information and preferences"
      />

      <PageBody>
        <div className="w-full space-y-4 sm:space-y-6 lg:max-w-3xl">
          <Card className="glass-panel border-0 shadow-sm sm:border sm:shadow-none">
            <CardHeader className="space-y-1 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm">
                Update your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <PersonalAccountSettingsContainer
                userId={user.id}
                paths={paths}
                features={features}
              />
            </CardContent>
          </Card>

          <Card className="glass-panel border-0 shadow-sm sm:border sm:shadow-none">
            <CardHeader className="space-y-1 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl">
                Account Overview
              </CardTitle>
              <CardDescription className="text-sm">
                Quick overview of your account status and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-4 sm:px-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Account Status
                  </p>
                  <Badge variant="default" className="mt-1">
                    Active
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Member Since
                  </p>
                  <p className="text-sm">
                    {new Date(user.created_at || Date.now()).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'long',
                      },
                    )}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Email Verification
                  </p>
                  <Badge variant="default" className="mt-1">
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(AccountSettingsPageContent);
