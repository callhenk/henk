import { PageBody, PageHeader } from '@kit/ui/page';

import { CampaignForm } from '../_components/campaign-form';

export default function CreateCampaignPage() {
  return (
    <>
      <PageHeader description={'Create a new AI voice fundraising campaign'} />

      <PageBody className="py-8">
        <CampaignForm mode="create" />
      </PageBody>
    </>
  );
}
