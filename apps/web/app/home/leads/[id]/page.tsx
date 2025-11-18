import { PageBody, PageHeader } from '@kit/ui/page';

import { LeadDetail } from './_components/lead-detail';

interface LeadPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LeadPage({ params }: LeadPageProps) {
  const { id } = await params;

  return (
    <>
      <PageHeader description={'Lead details and activity history'} />
      <PageBody>
        <LeadDetail leadId={id} />
      </PageBody>
    </>
  );
}
