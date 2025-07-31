import { PageBody, PageHeader } from '@kit/ui/page';

import { AgentsList } from './_components/agents-list';

export default function AgentsPage() {
  return (
    <>
      <PageHeader
        title="AI Voice Agents"
        description="Create, manage, and optimize your AI voice agents for fundraising campaigns"
      />

      <PageBody>
        <AgentsList />
      </PageBody>
    </>
  );
}
