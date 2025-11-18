'use client';

import { useState } from 'react';

import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

import {
  useCreateIntegration,
  useUpdateIntegration,
} from '@kit/supabase/hooks/integrations/use-integration-mutations';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@kit/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';

import { ConfigForm } from './ConfigForm';
import { CredentialsForm } from './CredentialsForm';
import type {
  IntegrationType,
  ProviderSchema,
  TestConnectionResult,
  UiIntegration,
} from './types';
import { mockAsync } from './types';

type Step = 'overview' | 'auth' | 'config' | 'review';

// Map UI integration types to database enum types
function mapToDatabaseType(
  uiType: IntegrationType,
): 'crm' | 'payment' | 'communication' | 'analytics' | 'voice' {
  const typeMap: Record<
    IntegrationType,
    'crm' | 'payment' | 'communication' | 'analytics' | 'voice'
  > = {
    telephony: 'voice',
    tts: 'voice',
    nlp: 'analytics',
    crm: 'crm',
    email: 'communication',
    analytics: 'analytics',
    payments: 'payment',
    storage: 'analytics', // Default storage to analytics
    captcha: 'analytics',
    other: 'analytics',
  };
  return typeMap[uiType] || 'analytics';
}

export function IntegrationDrawer({
  open,
  onOpenChange,
  item,
  onSave,
  canEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: UiIntegration;
  onSave: (next: Partial<UiIntegration>) => Promise<void> | void;
  canEdit?: boolean;
}) {
  const [step, setStep] = useState<Step>('overview');

  const schema: ProviderSchema = item.schema;
  const canUseOAuth = schema.supportsOAuth;
  const canUseApiKey = schema.supportsApiKey;

  // Default to OAuth if only OAuth is supported, otherwise default to API key
  const defaultMode: 'oauth' | 'api' =
    canUseOAuth && !canUseApiKey ? 'oauth' : 'api';
  const [mode, setMode] = useState<'oauth' | 'api'>(defaultMode);

  const [credentials, setCredentials] = useState<Record<string, unknown>>(
    (item.credentials as Record<string, unknown>) ?? {},
  );
  const [config, setConfig] = useState<Record<string, unknown>>(
    (item.config as Record<string, unknown>) ?? {},
  );
  const [saving, setSaving] = useState(false);
  const [tested, setTested] = useState<TestConnectionResult | null>(null);
  const [copiable, setCopiable] = useState(true); // disable copying after first save

  const createIntegration = useCreateIntegration();
  const updateIntegration = useUpdateIntegration();

  const validateCredentials = () => {
    const required = (schema.credentials ?? []).filter((f) => f.required);
    for (const f of required) {
      const v = credentials[f.key];
      if (!v || String(v).trim() === '') return false;
    }
    return true;
  };

  const testConnection = async () => {
    const res = await mockAsync(() => {
      const ok = Math.random() > 0.25; // 75% success
      return ok
        ? ({ success: true, message: 'Connection successful' } as const)
        : ({
            success: false,
            message: 'Invalid credentials or network error',
          } as const);
    }, 700);
    setTested(res);
    return res;
  };

  const handleSave = async () => {
    setSaving(true);
    setCopiable(false);

    try {
      // Determine if this is a database-backed integration (has UUID id)
      const isDbIntegration = item.id.length > 20; // UUIDs are longer than simple string IDs like 'salesforce'

      if (isDbIntegration) {
        // Update existing integration
        await updateIntegration.mutateAsync({
          id: item.id,
          credentials: JSON.parse(JSON.stringify(credentials)),
          config: JSON.parse(JSON.stringify(config)),
          status: 'inactive', // Will be set to 'active' after OAuth flow
        });
      } else {
        // Create new integration
        await createIntegration.mutateAsync({
          name: item.name,
          description: item.description,
          type: mapToDatabaseType(item.type),
          status: 'inactive', // Will be set to 'active' after OAuth flow
          credentials: JSON.parse(JSON.stringify(credentials)),
          config: JSON.parse(JSON.stringify(config)),
        });
      }

      // Call the onSave callback for UI update
      await onSave({
        credentials,
        config,
        status: 'disconnected', // Status will be updated to 'connected' after OAuth
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save integration:', error);
      setTested({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to save integration',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{item.name}</SheetTitle>
          <SheetDescription>{item.description}</SheetDescription>
        </SheetHeader>

        {/* Steps header */}
        <div className="mt-4 grid grid-cols-3 text-center text-xs">
          {['Overview', 'Authentication', 'Review'].map((label, i) => (
            <div
              key={label}
              className={`truncate ${
                stepIndex(step) >= i
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {step === 'overview' && (
          <div className="mt-4 space-y-4">
            <Card className={'glass-panel'}>
              <CardHeader>
                <CardTitle className="text-base">Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {item.type === 'crm' && item.name === 'Salesforce' ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      Connect your Salesforce account to import contacts and
                      create targeted campaigns using secure OAuth 2.0
                      authentication.
                    </p>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Connection Process (2 Simple Steps):
                      </h4>
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            1
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Enter Connected App Credentials
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              Provide your Client ID and Client Secret
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            2
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Authorize Access
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs">
                              Log in to Salesforce Production and approve the
                              connection
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 rounded-md bg-blue-50 p-4 dark:bg-blue-950">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        📖 First Time? Create a Connected App
                      </p>
                      <p className="text-xs text-blue-900 dark:text-blue-100">
                        Before you can connect, you need to create a Salesforce
                        Connected App (one-time setup, takes ~5 minutes).
                      </p>
                      <a
                        href="/home/integrations/salesforce-guide"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-xs font-medium text-blue-700 underline hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                      >
                        View Setup Guide →
                      </a>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        What you&apos;ll need:
                      </h4>
                      <ul className="text-muted-foreground space-y-1.5 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-green-600 dark:text-green-400">
                            ✓
                          </span>
                          <span>
                            Salesforce Connected App (Client ID &amp; Secret)
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-green-600 dark:text-green-400">
                            ✓
                          </span>
                          <span>
                            Salesforce account with &quot;API Enabled&quot;
                            permission
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="mt-0.5 text-green-600 dark:text-green-400">
                            ✓
                          </span>
                          <span>
                            Admin access to create the Connected App (or ask
                            your admin)
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <ul className="ml-4 list-disc text-sm">
                    <li>Securely authenticate using OAuth or API keys.</li>
                    <li>Configure environment, region, and webhooks.</li>
                    <li>Run a test before saving.</li>
                  </ul>
                )}
              </CardContent>
            </Card>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setStep('auth')}>Continue</Button>
            </div>
          </div>
        )}

        {step === 'auth' && (
          <div className="mt-4 space-y-4">
            {item.type === 'crm' && item.name === 'Salesforce' ? (
              // Salesforce OAuth-only flow with credential input
              <div className="space-y-4">
                <div className="space-y-2 rounded-md bg-blue-50 p-4 text-sm dark:bg-blue-950">
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    📋 Step 1: Enter Your Connected App Credentials
                  </p>
                  <p className="text-xs text-blue-900 dark:text-blue-100">
                    Enter the Client ID and Client Secret from your Salesforce
                    Connected App. Don&apos;t have a Connected App yet?{' '}
                    <a
                      href="/home/integrations/salesforce-guide"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Follow our 5-minute setup guide →
                    </a>
                  </p>
                </div>

                <CredentialsForm
                  fields={schema.credentials}
                  value={credentials}
                  onChange={setCredentials}
                  readOnly={!canEdit}
                  disableCopy={!copiable}
                />

                {tested && !tested.success && (
                  <div className="rounded-md bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> {tested.message}
                    </div>
                  </div>
                )}
              </div>
            ) : canUseOAuth || canUseApiKey ? (
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as 'oauth' | 'api')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  {canUseOAuth && (
                    <TabsTrigger value="oauth">OAuth</TabsTrigger>
                  )}
                  {canUseApiKey && (
                    <TabsTrigger value="api">API key</TabsTrigger>
                  )}
                </TabsList>
                {canUseOAuth && (
                  <TabsContent value="oauth" className="space-y-4">
                    <p className="text-sm">
                      You will be redirected to the provider to approve access.
                    </p>
                    <Button
                      type="button"
                      onClick={async () => {
                        setTested({ success: true });
                      }}
                      disabled={!canEdit}
                    >
                      Continue to provider{' '}
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </TabsContent>
                )}
                {canUseApiKey && (
                  <TabsContent value="api" className="space-y-4">
                    <CredentialsForm
                      fields={schema.credentials}
                      value={credentials}
                      onChange={setCredentials}
                      readOnly={!canEdit}
                      disableCopy={!copiable}
                    />
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              <p className="text-sm">
                No authentication is required for this provider.
              </p>
            )}

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep('overview')}>
                Back
              </Button>
              <Button
                onClick={() => {
                  // For Salesforce, set environment to production and skip to review
                  if (item.type === 'crm' && item.name === 'Salesforce') {
                    setConfig({ env: 'production' });
                    setStep('review');
                  } else {
                    setStep('config');
                  }
                }}
                disabled={
                  item.type === 'crm' && item.name === 'Salesforce'
                    ? !validateCredentials()
                    : canUseApiKey && !validateCredentials()
                }
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'config' &&
          item.type !== 'crm' &&
          item.name !== 'Salesforce' && (
            <div className="mt-4 space-y-4">
              <ConfigForm
                fields={schema.config}
                value={config}
                onChange={setConfig}
                readOnly={!canEdit}
              />
              <div className="flex justify-between gap-2">
                <Button variant="outline" onClick={() => setStep('auth')}>
                  Back
                </Button>
                <Button onClick={() => setStep('review')}>Continue</Button>
              </div>
            </div>
          )}

        {step === 'review' && (
          <div className="mt-4 space-y-4">
            {item.type === 'crm' && item.name === 'Salesforce' && (
              <div className="space-y-2 rounded-md bg-blue-50 p-4 text-sm dark:bg-blue-950">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  🔐 Step 2: Connect to Salesforce
                </p>
                <p className="text-xs text-blue-900 dark:text-blue-100">
                  Review your settings and click &quot;Connect to
                  Salesforce&quot; to authorize access. You&apos;ll be
                  redirected to Salesforce to approve the connection.
                </p>
              </div>
            )}

            {tested ? (
              tested.success ? (
                <div className="rounded-md bg-green-50 p-3 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Test passed
                  </div>
                  {tested.message ? (
                    <div className="mt-1">{tested.message}</div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950 dark:text-red-100">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />{' '}
                    {item.type === 'crm' && item.name === 'Salesforce'
                      ? 'Connection failed'
                      : 'Test failed'}
                  </div>
                  <div className="mt-1">{tested.message}</div>
                </div>
              )
            ) : null}

            <Card className={'glass-panel'}>
              <CardHeader>
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-muted-foreground text-xs">
                      Authentication
                    </div>
                    <div className="text-sm">
                      {item.type === 'crm' && item.name === 'Salesforce'
                        ? 'OAuth 2.0'
                        : canUseOAuth && mode === 'oauth'
                          ? 'OAuth'
                          : 'API key'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">
                      Environment
                    </div>
                    <div className="text-sm capitalize">
                      {item.type === 'crm' && item.name === 'Salesforce'
                        ? 'Production'
                        : String(config.env ?? '—')}
                    </div>
                  </div>
                  {item.type === 'crm' && item.name === 'Salesforce' && (
                    <>
                      <div>
                        <div className="text-muted-foreground text-xs">
                          Client ID
                        </div>
                        <div className="truncate font-mono text-sm text-xs">
                          {String(credentials.clientId ?? '—').substring(0, 20)}
                          ...
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs">
                          Client Secret
                        </div>
                        <div className="text-sm">•••••••• (hidden)</div>
                      </div>
                    </>
                  )}
                  {!(item.type === 'crm' && item.name === 'Salesforce') && (
                    <div className="col-span-2">
                      <div className="text-muted-foreground text-xs">
                        Secrets
                      </div>
                      <div className="text-sm">Hidden for security</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('auth')}>
                  Back
                </Button>
                {!(item.type === 'crm' && item.name === 'Salesforce') && (
                  <Button
                    variant="secondary"
                    onClick={testConnection}
                    disabled={!canEdit}
                  >
                    Test connection
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                {item.type === 'crm' && item.name === 'Salesforce' ? (
                  <Button
                    onClick={async () => {
                      // First save the credentials
                      await handleSave();
                      // Then initiate OAuth flow
                      try {
                        const response = await fetch(
                          '/api/integrations/salesforce/authorize',
                        );
                        const data = await response.json();
                        if (data.success && data.authorization_url) {
                          window.location.href = data.authorization_url;
                        } else {
                          console.error(
                            'Failed to get authorization URL:',
                            data.error,
                          );
                          setTested({
                            success: false,
                            message: data.error || 'Failed to start OAuth flow',
                          });
                        }
                      } catch (error) {
                        console.error('Error initiating OAuth:', error);
                        setTested({
                          success: false,
                          message: 'Failed to connect to server',
                        });
                      }
                    }}
                    disabled={!canEdit || saving || !validateCredentials()}
                  >
                    {saving ? 'Saving…' : 'Connect to Salesforce'}{' '}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    disabled={
                      !canEdit ||
                      saving ||
                      (canUseApiKey && !validateCredentials())
                    }
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function stepIndex(step: Step): number {
  switch (step) {
    case 'overview':
      return 0;
    case 'auth':
      return 1;
    case 'config':
      return 2;
    case 'review':
      return 2; // For Salesforce, review is step 2 (skipping config)
  }
}
