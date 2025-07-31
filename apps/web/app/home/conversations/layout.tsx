import { Suspense } from 'react';

import { LoadingOverlay } from '@kit/ui/loading-overlay';

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<LoadingOverlay />}>{children}</Suspense>;
}
