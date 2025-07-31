import { PageBody, PageHeader } from '@kit/ui/page';

import { AgentsList } from './_components/agents-list';

export default function AgentsPage() {
  return (
    <>
      <PageHeader
        title="AI Voice Agents"
        description="Manage and configure your automated calling agents"
      />
      <PageBody>
        <AgentsList />
      </PageBody>
    </>
  );
}
