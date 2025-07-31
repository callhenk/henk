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
    description:
      'Annual fundraising campaign to support local community programs',
    agent: 'sarah',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-08-31'),
    goal: '50000',
    script: 'Hello, this is Sarah calling on behalf of our organization...',
  };

  return (
    <>
      <PageHeader description={'Edit your AI voice fundraising campaign'} />

      <PageBody className="py-8">
        <CampaignForm
          mode="edit"
          campaignId={id}
          initialData={mockCampaignData}
        />
      </PageBody>
    </>
  );
}
