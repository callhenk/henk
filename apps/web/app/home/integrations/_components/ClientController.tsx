'use client';

import { Suspense } from 'react';

import { useBusinessId } from '@kit/supabase/hooks/use-business-context';

import { GridSkeleton } from './IntegrationsGrid';
import { IntegrationsController } from './IntegrationsController';
import { SEED_INTEGRATIONS } from './mock-data';

export function ClientController() {
  const businessId = useBusinessId() ?? 'business_demo';
  const items = SEED_INTEGRATIONS(businessId);
  return (
    <Suspense fallback={<GridSkeleton />}>
      <IntegrationsController businessId={businessId} items={items} canEdit />
    </Suspense>
  );
}


