import { PageBody, PageHeader } from '@kit/ui/page';

import { VoiceTestComponent } from '../_components/voice-test-component';

export default function VoiceTestPage() {
  return (
    <>
      <PageHeader
        title="Voice Testing"
        description="Test AI voice generation with your agents"
      />
      <PageBody>
        <VoiceTestComponent />
      </PageBody>
    </>
  );
}
