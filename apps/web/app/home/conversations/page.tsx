import { PageBody, PageHeader } from '@kit/ui/page';

import { ConversationsList } from './_components/conversations-list';

export default function ConversationsPage() {
  return (
    <>
      <PageHeader
        title="Conversations"
        description="View and analyze all AI voice conversations"
      />
      <PageBody>
        <ConversationsList />
      </PageBody>
    </>
  );
}
