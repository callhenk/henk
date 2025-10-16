'use client';

import { Suspense, useEffect, useState } from 'react';

import { useBusinessContext } from '@kit/supabase/hooks/use-business-context';

import { GridSkeleton } from './IntegrationsGrid';
import { IntegrationsController } from './IntegrationsController';
import { SEED_INTEGRATIONS } from './mock-data';
import type { UiIntegration } from './types';

export function ClientController() {
  const { data: businessContext } = useBusinessContext();
  const businessId = businessContext?.business_id ?? 'business_demo';
  const [items, setItems] = useState<UiIntegration[]>(SEED_INTEGRATIONS(businessId));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIntegrations() {
      try {
        const response = await fetch('/api/integrations');
        const data = await response.json();

        if (data.success && data.integrations) {
          // Merge database integrations with seed data
          const seedIntegrations = SEED_INTEGRATIONS(businessId);
          const mergedIntegrations = seedIntegrations.map(seed => {
            const dbIntegration = data.integrations.find(
              (db: any) => db.name === seed.name || db.type === seed.type && db.name.toLowerCase().includes(seed.id)
            );

            if (dbIntegration) {
              // Merge database data with seed data
              return {
                ...seed,
                id: dbIntegration.id,
                status: dbIntegration.status,
                config: dbIntegration.config,
                credentials: dbIntegration.credentials,
                last_sync_at: dbIntegration.last_sync_at,
              };
            }

            return seed;
          });

          setItems(mergedIntegrations);
        }
      } catch (error) {
        console.error('Failed to fetch integrations:', error);
        // Keep using seed data if fetch fails
      } finally {
        setLoading(false);
      }
    }

    if (businessId !== 'business_demo') {
      fetchIntegrations();
    } else {
      setLoading(false);
    }
  }, [businessId]);

  if (loading) {
    return <GridSkeleton />;
  }

  return (
    <Suspense fallback={<GridSkeleton />}>
      <IntegrationsController businessId={businessId} items={items} canEdit />
    </Suspense>
  );
}


