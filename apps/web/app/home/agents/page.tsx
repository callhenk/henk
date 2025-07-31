import { PageBody, PageHeader } from '@kit/ui/page';

import { AgentsList } from './_components/agents-list';

export default function AgentsPage() {
  return (
    <>
      <PageHeader description={'Manage your AI voice agents'} />

      <PageBody>
        <AgentsList />
      </PageBody>
    </>
  );
} 