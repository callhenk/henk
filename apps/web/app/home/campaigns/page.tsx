import { PageBody, PageHeader } from '@kit/ui/page';

import { CampaignsList } from './_components/campaigns-list';

export default function CampaignsPage() {
  return (
    <>
      <PageHeader
        title="Campaigns"
        description="Manage your AI voice fundraising campaigns"
      />

      <PageBody>
        <CampaignsList />
      </PageBody>
    </>
  );
}
