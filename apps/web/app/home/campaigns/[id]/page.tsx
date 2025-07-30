import { PageBody, PageHeader } from '@kit/ui/page';

import { CampaignDetail } from './_components/campaign-detail';

interface CampaignPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { id } = await params;

  return (
    <>
      <PageHeader description={'Campaign details and performance'} />

      <PageBody>
        <CampaignDetail campaignId={id} />
      </PageBody>
    </>
  );
}
