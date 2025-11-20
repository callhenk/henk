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
        <div className="mx-auto w-full max-w-4xl space-y-6 sm:space-y-8">

          <Card className="shadow-sm">
            <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Update your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
              <PersonalAccountSettingsContainer
                userId={user.id}
                paths={paths}
                features={features}
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Account Overview
              </CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Quick overview of your account status and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Account Status
                </p>
                <Badge variant="default" className="mt-1.5 font-medium">
                  Active
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Member Since
                </p>
                <p className="mt-1.5 text-sm">
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
                <Badge variant="default" className="mt-1.5 font-medium">
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
