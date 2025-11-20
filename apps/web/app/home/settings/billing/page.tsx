import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { BillingSettingsContainer } from './_components/billing-settings-container';

export const generateMetadata = async () => {
  return {
    title: 'Billing Settings',
  };
};

function BillingSettingsPage() {
  const _user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Billing & Subscription"
        description="Manage your subscription, billing information, and payment methods"
      />
      <PageBody>
        <BillingSettingsContainer />
      </PageBody>
    </>
  );
}

export default withI18n(BillingSettingsPage);
