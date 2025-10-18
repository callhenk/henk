import { PageBody, PageHeader } from '@kit/ui/page';

import { LeadsList } from './_components/leads-list';

export default function LeadsPage() {
  return (
    <>
      <PageHeader
        title="Leads"
        description="Manage your leads and organize them into lists for campaigns"
      />

      <PageBody>
        <LeadsList />
      </PageBody>
    </>
  );
}
