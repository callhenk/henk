'use client';

import { useState } from 'react';

import { PageBody, PageHeader } from '@kit/ui/page';

import { RealtimeVoiceChat } from '../_components/realtime-voice-chat';

interface AgentChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AgentChatPage({ params: _params }: AgentChatPageProps) {
  const [showVoiceChat, setShowVoiceChat] = useState(true);

  return (
    <>
      <PageHeader
        title="Voice Chat"
        description="Real-time voice conversation with your AI agent - starting automatically"
      />

      <PageBody>
        {showVoiceChat && (
          <RealtimeVoiceChat
            agentId="default"
            agentName="Your AI Agent"
            elevenlabsAgentId="default"
            onClose={() => setShowVoiceChat(false)}
          />
        )}
      </PageBody>
    </>
  );
}
