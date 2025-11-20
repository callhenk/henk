import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { NotificationSettingsForm } from './_components/notification-settings-form';

export const generateMetadata = async () => {
  return {
    title: 'Notification Settings',
  };
};

function NotificationSettingsPage() {
  const user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Notification Settings"
        description="Manage your notification preferences and communication settings"
      />
      <PageBody>
        <NotificationSettingsForm userId={user.id} />
      </PageBody>
    </>
  );
}

export default withI18n(NotificationSettingsPage);
