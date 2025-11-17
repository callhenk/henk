import { PageBody, PageHeader } from '@kit/ui/page';

import { CallsController } from './_components/calls-controller';

export const metadata = {
  title: 'Calls | Henk',
  description: 'Make calls to your prospects',
};

export default function CallsPage() {
  return (
    <>
      <PageHeader
        title="Calls"
        description="Make outbound calls to your prospects using Twilio Voice"
      />
      <PageBody>
        <CallsController />
      </PageBody>
    </>
  );
}
