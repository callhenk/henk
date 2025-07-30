import { PageBody, PageHeader } from '@kit/ui/page';

import { CampaignForm } from '../../_components/campaign-form';

interface EditCampaignPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCampaignPage({
  params,
}: EditCampaignPageProps) {
  const { id } = await params;

  // Mock campaign data - in a real app, this would be fetched from an API
  const mockCampaignData = {
    name: 'Summer Fundraiser 2024',
    description: 'Annual summer fundraising campaign for local charities',
    agent: 'sarah',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    goal: '$5,000',
    script:
      "Hello, this is Sarah calling on behalf of our local charity. We're reaching out to discuss our summer fundraising campaign...",
  };

  return (
    <>
      <PageHeader description={'Edit your AI voice fundraising campaign'} />

      <PageBody>
        <CampaignForm
          mode="edit"
          campaignId={id}
          initialData={mockCampaignData}
        />
      </PageBody>
    </>
  );
}
