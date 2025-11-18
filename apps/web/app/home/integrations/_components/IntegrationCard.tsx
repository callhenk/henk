'use client';

import { BookOpen } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import { OverflowMenu } from './OverflowMenu';
import { IntegrationStatusBadge } from './integration-status-badge';
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
  const showManage =
    item.status === 'connected' || item.status === 'needs_attention';
  const isComingSoon = item.status === 'coming_soon';

  return (
    <Card className={`glass-panel ${isComingSoon ? 'opacity-75' : ''}`}>
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
                <IntegrationStatusBadge status={item.status} />
              </div>
            </div>
          </div>
          <OverflowMenu
            onTest={onTest}
            onSync={onSync}
            onDisconnect={onDisconnect}
            onLogs={onLogs}
            disabled={!canEdit || busy || isComingSoon}
          />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
          {item.description}
        </p>

        {/* Show setup guide link for Salesforce */}
        {item.id === 'salesforce' && item.status === 'disconnected' && (
          <a
            href="/home/integrations/salesforce-guide"
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span className="underline">Setup Guide (5 min)</span>
          </a>
        )}

        <div className="flex items-center justify-between text-xs">
          <div className="text-muted-foreground">
            Last sync: {formatRelativeTime(item.last_sync_at)}
          </div>
          {canEdit &&
            !isComingSoon &&
            (showManage ? (
              <Button
                size="sm"
                variant="outline"
                onClick={onManage}
                disabled={busy}
              >
                Manage
              </Button>
            ) : (
              <Button size="sm" onClick={onConnect} disabled={busy}>
                Connect
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
