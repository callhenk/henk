import { PageBody, PageHeader } from '@kit/ui/page';

import { RealtimeVoiceChat } from '../_components/realtime-voice-chat';

interface AgentChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AgentChatPage({ params }: AgentChatPageProps) {
  const { id } = await params;

  return (
    <>
      <PageHeader
        title="Voice Chat"
        description="Real-time voice conversation with your AI agent - starting automatically"
      />

      <PageBody>
        <RealtimeVoiceChat
          agentId={id}
          agentName="Your AI Agent"
          voiceId="default"
          elevenlabsAgentId="default"
        />
      </PageBody>
    </>
  );
}
