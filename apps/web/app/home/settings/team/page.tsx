import { use } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { TeamSettingsContainer } from './_components/team-settings-container';

export const generateMetadata = async () => {
  return {
    title: 'Team Management',
  };
};

function TeamSettingsPage() {
  const user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Team Management"
        description="Manage team members, roles, and permissions"
      />
      <PageBody>
        <div className={'w-full max-w-5xl'}>
          <TeamSettingsContainer _userId={user.id} hideHeader />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(TeamSettingsPage);
