'use client';

import { Suspense, useMemo } from 'react';

import type { Tables } from '@kit/supabase/database';
import { useIntegrations } from '@kit/supabase/hooks/integrations/use-integrations';
import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';

import { IntegrationsController } from './IntegrationsController';
import { GridSkeleton } from './IntegrationsGrid';
import { SEED_INTEGRATIONS } from './mock-data';
import type { UiIntegration } from './types';

type Integration = Tables<'integrations'>['Row'];

export function ClientController() {
  const { data: businessContext } = useBusinessContext();
  const businessId = businessContext?.business_id ?? 'business_demo';

  // Fetch integrations from database using React Query
  const { data: dbIntegrations = [], isLoading } = useIntegrations();

  // Merge database integrations with seed data (template)
  const items = useMemo(() => {
    const seedIntegrations = SEED_INTEGRATIONS(businessId);

    return seedIntegrations.map((seed) => {
      // Find matching integration in database
      const dbIntegration = dbIntegrations.find(
        (db: Integration) =>
          db.name === seed.name ||
          (db.type === seed.type && db.name.toLowerCase().includes(seed.id)),
      );

      if (dbIntegration) {
        // Merge database data with seed data (keeping UI properties like icon and schema)
        return {
          ...seed,
          id: dbIntegration.id,
          status: dbIntegration.status,
          config: dbIntegration.config,
          credentials: dbIntegration.credentials,
          last_sync_at: dbIntegration.last_sync_at,
        } as UiIntegration;
      }

      return seed;
    });
  }, [businessId, dbIntegrations]);

  if (isLoading) {
    return <GridSkeleton />;
  }

  return (
    <Suspense fallback={<GridSkeleton />}>
      <IntegrationsController businessId={businessId} items={items} canEdit />
    </Suspense>
  );
}
