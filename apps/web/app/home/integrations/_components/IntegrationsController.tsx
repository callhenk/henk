'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { AlertCircle, Info } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const [filters, setFilters] = useQueryFilters();
  const [data, setData] = useState<UiIntegration[]>(
    items ?? SEED_INTEGRATIONS(businessId),
  );
  const [_loadingAction, setLoadingAction] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null); // drawer
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [logsOpenFor, setLogsOpenFor] = useState<string | null>(null);
  const [oauthError, setOauthError] = useState<{
    error: string;
    description?: string;
  } | null>(null);
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

  // Check for OAuth callback errors
  useEffect(() => {
    const error = searchParams?.get('error');
    const errorDescription = searchParams?.get('error_description');
    const success = searchParams?.get('success');

    if (error) {
      setOauthError({
        error,
        description: errorDescription || undefined,
      });
    } else if (success === 'salesforce_connected') {
      // Show success message
      appendLog('salesforce', {
        level: 'success',
        event: 'oauth',
        message: 'Successfully connected to Salesforce',
      });
    }
  }, [searchParams]);

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
          {oauthError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>OAuth Connection Failed</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>{getErrorMessage(oauthError.error, oauthError.description)}</p>
                  <p className="text-sm">
                    See the{' '}
                    <a
                      href="/home/integrations/salesforce-setup"
                      className="underline font-medium hover:text-red-800 dark:hover:text-red-200"
                    >
                      setup guide
                    </a>
                    {' '}for troubleshooting steps.
                    <button
                      onClick={() => setOauthError(null)}
                      className="ml-2 underline"
                    >
                      Dismiss
                    </button>
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

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
    case 'coming_soon':
      return 5;
  }
}

function getErrorMessage(error: string, description?: string): string {
  // Check for specific error descriptions
  if (description) {
    if (description.includes('External client app is not installed')) {
      return 'The Salesforce Connected App is not properly configured in your Salesforce organization. Please follow the setup guide to create and configure the Connected App in Salesforce Setup → App Manager.';
    }
    if (description.includes('redirect_uri_mismatch') || description.includes('redirect_uri')) {
      return `OAuth configuration error: The redirect URI does not match. Expected callback URL must be configured in your Salesforce Connected App. ${description}`;
    }
    if (description.includes('invalid_client_id') || description.includes('client_id')) {
      return `Invalid Client ID. Please verify your SALESFORCE_CLIENT_ID environment variable matches the Consumer Key from your Connected App. ${description}`;
    }
  }

  switch (error) {
    case 'session_expired':
      return 'Your session expired during the OAuth flow. Please sign in again and try connecting to Salesforce.';
    case 'access_denied':
      return 'You denied access to Salesforce. Please try again and approve the connection.';
    case 'redirect_uri_mismatch':
      return 'OAuth configuration error: The redirect URI does not match. Please verify your callback URL is correctly configured in your Salesforce Connected App.';
    case 'invalid_client_id':
      return 'OAuth configuration error: Invalid client ID. Please verify your Consumer Key in the Connected App settings.';
    case 'token_exchange_failed':
      return 'Failed to exchange authorization code for access token. Please try again.';
    case 'missing_parameters':
      return 'OAuth callback missing required parameters. Please try again.';
    case 'invalid_state':
      return 'Invalid OAuth state parameter. Please try again.';
    case 'configuration_error':
      return 'Server configuration error. Please verify your environment variables are set correctly.';
    case 'save_failed':
      return 'Successfully connected to Salesforce but failed to save the integration. Please try again.';
    case 'internal_error':
      return 'An internal error occurred. Please try again or contact support.';
    case 'oauth_error':
    default:
      return description || 'An OAuth error occurred. Please try again or contact support if the issue persists.';
  }
}
