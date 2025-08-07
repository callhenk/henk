import { PageBody, PageHeader } from '@kit/ui/page';

import { AgentDetail } from './_components/agent-detail-refactored';

interface AgentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;

  return (
    <>
      <PageHeader
        title="Agent Details"
        description={'Agent details and performance'}
      />

      <PageBody>
        <AgentDetail agentId={id} />
      </PageBody>
    </>
  );
}
