import { PageBody, PageHeader } from '@kit/ui/page';
import { ConversationDetail } from './_components/conversation-detail';

interface ConversationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;

  return (
    <>
      <PageHeader description={'Conversation details and analysis'} />
      <PageBody>
        <ConversationDetail conversationId={id} />
      </PageBody>
    </>
  );
} 