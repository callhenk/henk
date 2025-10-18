import { PageBody, PageHeader } from '@kit/ui/page';

import { DonorsList } from './_components/donors-list';

export default function DonorsPage() {
  return (
    <>
      <PageHeader
        title="Donors"
        description="Manage your donors and organize them into lists for campaigns"
      />

      <PageBody>
        <DonorsList />
      </PageBody>
    </>
  );
}
