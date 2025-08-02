import { use } from 'react';

import { PageBody } from '@kit/ui/page';

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
    <PageBody>
      <div className={'flex w-full flex-1 flex-col lg:max-w-4xl'}>
        <BusinessSettingsContainer userId={user.id} />
      </div>
    </PageBody>
  );
}

export default withI18n(BusinessSettingsPage); 