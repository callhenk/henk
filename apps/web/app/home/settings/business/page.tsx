import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { BusinessSettingsContainer } from './_components/business-settings-container';

export const generateMetadata = async () => {
  return {
    title: 'Business Settings',
  };
};

function BusinessSettingsPage() {
  const user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Business Settings"
        description="Manage your businesses and related preferences"
      />
      <PageBody>
        <div className={'w-full max-w-4xl'}>
          <BusinessSettingsContainer userId={user.id} hideHeader />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(BusinessSettingsPage);
