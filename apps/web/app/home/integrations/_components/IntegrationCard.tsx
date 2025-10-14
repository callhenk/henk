'use client';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { OverflowMenu } from './OverflowMenu';
import { StatusBadge } from './StatusBadge';
import { formatRelativeTime } from './types';
import type { UiIntegration } from './types';

export function IntegrationCard({
  item,
  canEdit,
  onConnect,
  onManage,
  onTest,
  onSync,
  onDisconnect,
  onLogs,
  busy,
}: {
  item: UiIntegration;
  canEdit?: boolean;
  onConnect: () => void;
  onManage: () => void;
  onTest: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onLogs: () => void;
  busy?: boolean;
}) {
  const Icon = item.icon;
  const showManage = item.status === 'connected' || item.status === 'needs_attention';

  return (
    <Card className={'glass-panel'}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-lg">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">{item.name}</CardTitle>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs capitalize">
                  {item.type}
                </Badge>
                <StatusBadge status={item.status} />
              </div>
            </div>
          </div>
          <OverflowMenu
            onTest={onTest}
            onSync={onSync}
            onDisconnect={onDisconnect}
            onLogs={onLogs}
            disabled={!canEdit || busy}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
          {item.description}
        </p>
        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">Last sync: {formatRelativeTime(item.last_sync_at)}</div>
          {canEdit && (
            showManage ? (
              <Button size="sm" variant="outline" onClick={onManage} disabled={busy}>
                Manage
              </Button>
            ) : (
              <Button size="sm" onClick={onConnect} disabled={busy}>
                Connect
              </Button>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}


