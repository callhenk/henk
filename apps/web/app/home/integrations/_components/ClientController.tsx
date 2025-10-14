'use client';

import { Suspense } from 'react';

import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';

import { GridSkeleton } from './IntegrationsGrid';
import { IntegrationsController } from './IntegrationsController';
import { SEED_INTEGRATIONS } from './mock-data';

export function ClientController() {
  const { data: businessContext } = useBusinessContext();
  const businessId = businessContext?.business_id ?? 'business_demo';
  const items = SEED_INTEGRATIONS(businessId);
  return (
    <Suspense fallback={<GridSkeleton />}>
      <IntegrationsController businessId={businessId} items={items} canEdit />
    </Suspense>
  );
}


