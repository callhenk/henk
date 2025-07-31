import { PageBody, PageHeader } from '@kit/ui/page';

import { AgentForm } from '../_components/agent-form';

export default function CreateAgentPage() {
  return (
    <>
      <PageHeader description={'Create a new AI voice agent'} />

      <PageBody>
        <AgentForm mode="create" />
      </PageBody>
    </>
  );
} 