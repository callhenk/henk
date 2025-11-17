import { redirect } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';

import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

import { CallsController } from './_components/calls-controller';

export const metadata = {
  title: 'Calls | Henk',
  description: 'Make calls to your prospects',
};

export default async function CallsPage() {
  // Check if user has access to this page
  const user = await requireUserInServerComponent();

  // Restrict access to callhenk.com users only
  if (!user.email || !user.email.endsWith('@callhenk.com')) {
    redirect('/home');
  }

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
