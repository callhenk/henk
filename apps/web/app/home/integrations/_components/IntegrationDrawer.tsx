'use client';

import { useState } from 'react';

import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@kit/ui/tabs';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@kit/ui/sheet';

import { ConfigForm } from './ConfigForm';
import { CredentialsForm } from './CredentialsForm';
import type { ProviderSchema, TestConnectionResult, UiIntegration } from './types';
import { mockAsync } from './types';

type Step = 'overview' | 'auth' | 'config' | 'review';

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
  const [mode, setMode] = useState<'oauth' | 'api'>('api');
  const [credentials, setCredentials] = useState<Record<string, unknown>>(
    (item.credentials as Record<string, unknown>) ?? {},
  );
  const [config, setConfig] = useState<Record<string, unknown>>(
    (item.config as Record<string, unknown>) ?? {},
  );
  const [saving, setSaving] = useState(false);
  const [tested, setTested] = useState<TestConnectionResult | null>(null);
  const [copiable, setCopiable] = useState(true); // disable copying after first save

  const schema: ProviderSchema = item.schema;

  const canUseOAuth = schema.supportsOAuth;
  const canUseApiKey = schema.supportsApiKey;

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
        : ({ success: false, message: 'Invalid credentials or network error' } as const);
    }, 700);
    setTested(res);
    return res;
  };

  const handleSave = async () => {
    setSaving(true);
    await mockAsync(() => true, 700);
    setSaving(false);
    setCopiable(false);
    const ok = tested?.success ?? true; // if not tested, assume ok
    await onSave({
      credentials,
      config,
      status: ok ? 'connected' : 'needs_attention',
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{item.name}</SheetTitle>
          <SheetDescription>{item.description}</SheetDescription>
        </SheetHeader>

        {/* Steps header */}
        <div className="mt-4 grid grid-cols-4 text-center text-xs">
          {['Overview', 'Authentication', 'Configuration', 'Review'].map((label, i) => (
            <div
              key={label}
              className={`truncate ${
                stepIndex(step) >= i ? 'text-foreground' : 'text-muted-foreground'
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
                {item.id === 'salesforce' ? (
                  <div className="space-y-4">
                    <p className="text-sm">
                      Connect your Salesforce account to import contacts and create targeted campaigns.
                    </p>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">What you&apos;ll need:</h4>
                      <ul className="ml-4 list-disc text-sm space-y-1">
                        <li>A Salesforce account with appropriate permissions</li>
                        <li>Access to your Salesforce Connected App settings</li>
                        <li>Permission to authorize third-party applications</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Integration steps:</h4>
                      <ul className="ml-4 list-disc text-sm space-y-1">
                        <li>Authenticate using OAuth 2.0 for secure access</li>
                        <li>Configure your Salesforce environment (Production or Sandbox)</li>
                        <li>Select which contact fields to sync</li>
                        <li>Test the connection before saving</li>
                      </ul>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-3 text-sm space-y-2">
                      <p className="text-blue-900 dark:text-blue-100">
                        <strong>Tip:</strong> Make sure you have the &quot;API Enabled&quot; permission in your Salesforce user profile.
                      </p>
                      <p className="text-blue-900 dark:text-blue-100">
                        <strong>Need help?</strong> See our{' '}
                        <a
                          href="/SALESFORCE_INTEGRATION_SETUP.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium hover:text-blue-700 dark:hover:text-blue-300"
                        >
                          Salesforce setup guide
                        </a>
                        {' '}for detailed instructions on configuring your Connected App.
                      </p>
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
            {canUseOAuth || canUseApiKey ? (
              <Tabs
                value={mode}
                onValueChange={(v) => setMode(v as 'oauth' | 'api')}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  {canUseOAuth && <TabsTrigger value="oauth">OAuth</TabsTrigger>}
                  {canUseApiKey && <TabsTrigger value="api">API key</TabsTrigger>}
                </TabsList>
                {canUseOAuth && (
                  <TabsContent value="oauth" className="space-y-4">
                    {item.id === 'salesforce' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Salesforce OAuth Authentication</h4>
                          <p className="text-sm text-muted-foreground">
                            You&apos;ll be securely redirected to Salesforce to approve access. This allows us to:
                          </p>
                          <ul className="ml-4 list-disc text-sm text-muted-foreground space-y-1">
                            <li>Read your contact records</li>
                            <li>Access basic account information</li>
                            <li>Sync data in real-time</li>
                          </ul>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-950 rounded-md p-3 text-sm">
                          <p className="text-amber-900 dark:text-amber-100">
                            <strong>Note:</strong> You can revoke access at any time from your Salesforce Connected Apps settings.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/integrations/salesforce/authorize');
                              const data = await response.json();
                              if (data.success && data.authorization_url) {
                                // Redirect to Salesforce OAuth
                                window.location.href = data.authorization_url;
                              } else {
                                console.error('Failed to get authorization URL:', data.error);
                                setTested({ success: false, message: data.error || 'Failed to start OAuth flow' });
                              }
                            } catch (error) {
                              console.error('Error initiating OAuth:', error);
                              setTested({ success: false, message: 'Failed to connect to server' });
                            }
                          }}
                          disabled={!canEdit}
                        >
                          Connect to Salesforce <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
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
                          Continue to provider <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </TabsContent>
                )}
                {canUseApiKey && (
                  <TabsContent value="api">
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
              <p className="text-sm">No authentication is required for this provider.</p>
            )}

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep('overview')}>
                Back
              </Button>
              <Button onClick={() => setStep('config')} disabled={canUseApiKey && !validateCredentials()}>
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'config' && (
          <div className="mt-4 space-y-4">
            <ConfigForm fields={schema.config} value={config} onChange={setConfig} readOnly={!canEdit} />
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
            {tested ? (
              tested.success ? (
                <div className="bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100 rounded-md p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Test passed
                  </div>
                  {tested.message ? <div className="mt-1">{tested.message}</div> : null}
                </div>
              ) : (
                <div className="bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100 rounded-md p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> Test failed
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
                    <div className="text-muted-foreground text-xs">Authentication</div>
                    <div className="text-sm">{canUseOAuth && mode === 'oauth' ? 'OAuth' : 'API key'}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs">Environment</div>
                    <div className="text-sm">{String(config.env ?? '—')}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-muted-foreground text-xs">Secrets</div>
                    <div className="text-sm">Hidden for security</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('config')}>
                  Back
                </Button>
                <Button variant="secondary" onClick={testConnection} disabled={!canEdit}>
                  Test connection
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!canEdit || saving || (canUseApiKey && !validateCredentials())}>
                  {saving ? 'Saving…' : 'Save'}
                </Button>
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
      return 3;
  }
}


