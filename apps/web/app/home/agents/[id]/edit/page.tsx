import { PageBody, PageHeader } from '@kit/ui/page';

import { AgentForm } from '../../_components/agent-form';

interface EditAgentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAgentPage({ params }: EditAgentPageProps) {
  const { id } = await params;

  // Mock agent data - in a real app, this would be fetched from an API
  const mockAgentData = {
    name: 'Sarah',
    language: 'english',
    tone: 'warm-friendly',
    voiceId: 'voice_sarah_001',
    voiceName: 'Sarah (ElevenLabs)',
    defaultScript:
      "Hello, this is Sarah calling on behalf of [Organization]. We're reaching out to discuss our current fundraising campaign...",
  };

  return (
    <>
      <PageHeader description={'Edit your AI voice agent'} />

      <PageBody className="py-8">
        <AgentForm mode="edit" agentId={id} initialData={mockAgentData} />
      </PageBody>
    </>
  );
}
