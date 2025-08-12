'use client';

import { Fragment } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';

import { IntegrationCard } from './IntegrationCard';
import type { UiIntegration } from './types';

export function IntegrationsGrid({
  items,
  canEdit,
  onConnect,
  onManage,
  onTest,
  onSync,
  onDisconnect,
  onLogs,
}: {
  items: UiIntegration[];
  canEdit?: boolean;
  onConnect: (id: string) => void;
  onManage: (id: string) => void;
  onTest: (id: string) => void;
  onSync: (id: string) => void;
  onDisconnect: (id: string) => void;
  onLogs: (id: string) => void;
}) {
  const popular = items.filter((i) => i.schema.popular);
  const rest = items.filter((i) => !i.schema.popular);

  if (items.length === 0) {
    return (
      <Card className={'glass-panel'}>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">No integrations match your filters.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {popular.length > 0 && (
        <div>
          <div className="mb-2 text-sm font-medium">Popular</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {popular.map((i) => (
              <IntegrationCard
                key={i.id}
                item={i}
                canEdit={canEdit}
                onConnect={() => onConnect(i.id)}
                onManage={() => onManage(i.id)}
                onTest={() => onTest(i.id)}
                onSync={() => onSync(i.id)}
                onDisconnect={() => onDisconnect(i.id)}
                onLogs={() => onLogs(i.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rest.map((i) => (
          <IntegrationCard
            key={i.id}
            item={i}
            canEdit={canEdit}
            onConnect={() => onConnect(i.id)}
            onManage={() => onManage(i.id)}
            onTest={() => onTest(i.id)}
            onSync={() => onSync(i.id)}
            onDisconnect={() => onDisconnect(i.id)}
            onLogs={() => onLogs(i.id)}
          />
        ))}
      </div>
    </div>
  );
}

export function GridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <Card key={idx} className={'glass-panel'}>
          <CardHeader>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-3 h-3 w-48" />
            <Skeleton className="h-8 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


