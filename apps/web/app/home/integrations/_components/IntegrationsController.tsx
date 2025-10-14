'use client';

import { useMemo, useState } from 'react';

import { Info } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { IntegrationDrawer } from './IntegrationDrawer';
import { IntegrationsFilters, useQueryFilters } from './IntegrationsFilters';
import { GridSkeleton, IntegrationsGrid } from './IntegrationsGrid';
import { IntegrationsStats } from './IntegrationsStats';
import { LogsDrawer } from './LogsDrawer';
import { SEED_INTEGRATIONS } from './mock-data';
import type {
  IntegrationsControllerProps,
  IntegrationsFiltersState,
  UiIntegration,
} from './types';
import { mockAsync } from './types';

export function IntegrationsController({
  businessId,
  canEdit = true,
  items,
}: IntegrationsControllerProps) {
  const [filters, setFilters] = useQueryFilters();
  const [data, setData] = useState<UiIntegration[]>(
    items ?? SEED_INTEGRATIONS(businessId),
  );
  const [_loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null); // drawer
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [logsOpenFor, setLogsOpenFor] = useState<string | null>(null);
  const [logs, setLogs] = useState<
    Record<
      string,
      {
        id: string;
        ts: string;
        level: 'info' | 'error' | 'success';
        message: string;
        event: string;
      }[]
    >
  >({});

  const filtered = useMemo(() => applyFilters(data, filters), [data, filters]);

  const connectedCount = filtered.filter(
    (i) => i.status === 'connected',
  ).length;
  const availableCount = filtered.length;
  const popularCount = filtered.filter((i) => i.schema.popular).length;

  const select = (id: string) => data.find((i) => i.id === id)!;

  const update = (id: string, patch: Partial<UiIntegration>) =>
    setData((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  const appendLog = (
    id: string,
    entry: {
      level: 'info' | 'error' | 'success';
      message: string;
      event: string;
    },
  ) => {
    setLogs((prev) => {
      const list = prev[id] ?? [];
      return {
        ...prev,
        [id]: [
          { id: crypto.randomUUID(), ts: new Date().toISOString(), ...entry },
          ...list,
        ],
      };
    });
  };

  const handleConnect = (id: string) => setActiveId(id);
  const handleManage = (id: string) => setActiveId(id);

  const handleSave = async (patch: Partial<UiIntegration>) => {
    if (!activeId) return;
    update(activeId, patch);
    appendLog(activeId, {
      level: 'success',
      event: 'save',
      message: 'Integration settings saved',
    });
  };

  const handleTest = async (id: string) => {
    setLoadingAction(`test:${id}`);
    const ok = await mockAsync(() => Math.random() > 0.2, 800);
    setLoadingAction(null);
    appendLog(id, {
      level: ok ? 'success' : 'error',
      event: 'test',
      message: ok ? 'Connection ok' : 'Connection failed',
    });
    if (!ok) update(id, { status: 'needs_attention' });
  };

  const handleSync = async (id: string) => {
    setLoadingAction(`sync:${id}`);
    await mockAsync(() => true, 1000);
    setLoadingAction(null);
    update(id, { last_sync_at: new Date().toISOString() });
    appendLog(id, {
      level: 'success',
      event: 'sync',
      message: 'Sync completed',
    });
  };

  const handleDisconnect = async (id: string) => {
    setConfirmId(id);
  };

  const confirmDisconnect = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    update(id, { status: 'disconnected', credentials: null });
    appendLog(id, {
      level: 'info',
      event: 'disconnect',
      message: 'Integration disconnected',
    });
  };

  return (
    <div className="space-y-6">
      <IntegrationsStats
        connected={connectedCount}
        available={availableCount}
        popular={popularCount}
      />

      <Card className={'glass-panel'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect your favorite tools to streamline your fundraising
                workflow.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>Coming soon</AlertTitle>
            <AlertDescription>
              Integration connections are coming soon. This page is a preview
              and actions may be limited until release.
            </AlertDescription>
          </Alert>

          <IntegrationsFilters value={filters} onChange={setFilters} />

          {data.length === 0 ? (
            <GridSkeleton />
          ) : (
            <IntegrationsGrid
              items={filtered}
              canEdit={canEdit}
              onConnect={handleConnect}
              onManage={handleManage}
              onTest={handleTest}
              onSync={handleSync}
              onDisconnect={handleDisconnect}
              onLogs={(id) => setLogsOpenFor(id)}
            />
          )}
        </CardContent>
      </Card>

      {/* Manage drawer */}
      {activeId && (
        <IntegrationDrawer
          open={!!activeId}
          onOpenChange={(o) => !o && setActiveId(null)}
          item={select(activeId)}
          onSave={async (patch) => handleSave(patch)}
          canEdit={canEdit}
        />
      )}

      {/* Logs drawer */}
      {logsOpenFor && (
        <LogsDrawer
          open={!!logsOpenFor}
          onOpenChange={(o) => !o && setLogsOpenFor(null)}
          logs={logs[logsOpenFor] ?? []}
        />
      )}

      {/* Disconnect confirm */}
      <AlertDialog
        open={!!confirmId}
        onOpenChange={(o) => !o && setConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect integration?</AlertDialogTitle>
            <AlertDialogDescription>
              Disconnecting will stop all jobs that use this integration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDisconnect}
              className="bg-red-600 hover:bg-red-700"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function applyFilters(
  items: UiIntegration[],
  f: IntegrationsFiltersState,
): UiIntegration[] {
  let out = items;
  if (f.search) {
    const q = f.search.toLowerCase();
    out = out.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q),
    );
  }
  if (f.type !== 'all') out = out.filter((i) => i.type === f.type);
  if (f.status !== 'all') out = out.filter((i) => i.status === f.status);

  out = [...out].sort((a, b) => {
    let cmp = 0;
    switch (f.sortBy) {
      case 'name':
        cmp = a.name.localeCompare(b.name);
        break;
      case 'status':
        cmp = statusRank(a.status) - statusRank(b.status);
        break;
      case 'last_sync_at':
        cmp =
          new Date(b.last_sync_at ?? 0).getTime() -
          new Date(a.last_sync_at ?? 0).getTime();
        break;
    }
    return f.sortOrder === 'asc' ? cmp : -cmp;
  });

  return out;
}

function statusRank(s: UiIntegration['status']): number {
  switch (s) {
    case 'connected':
      return 0;
    case 'needs_attention':
      return 1;
    case 'error':
      return 2;
    case 'disconnected':
      return 3;
    case 'deprecated':
      return 4;
  }
}
