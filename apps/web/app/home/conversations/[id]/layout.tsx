import { Suspense } from 'react';

import { LoadingOverlay } from '@kit/ui/loading-overlay';

export default function ConversationDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<LoadingOverlay />}>{children}</Suspense>;
}
