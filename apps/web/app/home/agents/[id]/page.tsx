import { PageBody, PageHeader } from '@kit/ui/page';

import { AgentDetail } from './_components/agent-detail';

interface AgentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { id } = await params;

  return (
    <>
      <PageHeader description={'Agent details and performance'} />

      <PageBody>
        <AgentDetail agentId={id} />
      </PageBody>
    </>
  );
} 