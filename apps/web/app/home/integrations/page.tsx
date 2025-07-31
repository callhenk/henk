import { PageBody, PageHeader } from '@kit/ui/page';

import { IntegrationsList } from './_components/integrations-list';

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect your favorite tools to streamline your fundraising workflow"
      />
      <PageBody>
        <IntegrationsList />
      </PageBody>
    </>
  );
} 