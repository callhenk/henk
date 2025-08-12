import { PageBody, PageHeader } from '@kit/ui/page';

import { ClientController } from './_components/ClientController';

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="Connect your favorite tools to streamline your fundraising workflow."
      />
      <PageBody>
        <ClientController />
      </PageBody>
    </>
  );
}

// ClientController is in separate client file
