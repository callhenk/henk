import Link from 'next/link';

import {
  AlertCircle,
  CheckCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Key,
  Link as LinkIcon,
  Lock,
  Settings,
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';

export default function SalesforceGuidePage() {
  return (
    <>
      <PageHeader
        title="Salesforce Integration Guide"
        description="5-minute setup guide to connect your Salesforce account"
      />
      <PageBody>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Connecting Salesforce to Henk is a one-time setup that enables
                your entire team to import contacts and sync data seamlessly.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">
                      Salesforce Admin Access
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Create Connected Apps
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">API Enabled</p>
                    <p className="text-muted-foreground text-xs">
                      User profile permission
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">10 minutes</p>
                    <p className="text-muted-foreground text-xs">
                      One-time setup
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  1
                </div>
                Create a Salesforce Connected App
              </CardTitle>
              <CardDescription>
                Set up OAuth authentication in your Salesforce org
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 1.1 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  1.1 Open Salesforce Setup
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-sm">
                  <li>
                    Log in to Salesforce at{' '}
                    <code className="bg-muted rounded px-1">
                      login.salesforce.com
                    </code>
                  </li>
                  <li>
                    Click the <strong>gear icon (⚙️)</strong> in the top-right
                    corner
                  </li>
                  <li>
                    Select <strong>Setup</strong>
                  </li>
                </ol>
              </div>

              {/* 1.2 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  1.2 Navigate to App Manager
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-sm">
                  <li>
                    In the <strong>Quick Find</strong> box (left sidebar), type{' '}
                    <code className="bg-muted rounded px-1">App Manager</code>
                  </li>
                  <li>
                    Click <strong>App Manager</strong> under Apps
                  </li>
                  <li>
                    Click the <strong>New Connected App</strong> button
                    (top-right)
                  </li>
                </ol>
              </div>

              {/* 1.3 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  1.3 Fill in Basic Information
                </h4>
                <div className="rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Field</th>
                        <th className="p-2 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-2 font-medium">Connected App Name</td>
                        <td className="p-2">
                          <code className="bg-muted rounded px-1">
                            Henk Integration
                          </code>
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-medium">API Name</td>
                        <td className="text-muted-foreground p-2">
                          Auto-filled: Henk_Integration
                        </td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-2 font-medium">Contact Email</td>
                        <td className="text-muted-foreground p-2">
                          Your email address
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 1.4 */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">
                  1.4 Enable OAuth Settings
                </h4>

                <div className="space-y-2">
                  <p className="text-sm">
                    1. Check ✅ <strong>Enable OAuth Settings</strong>
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    2. <strong>Callback URL</strong>: Enter this exact URL:
                  </p>
                  <Alert>
                    <LinkIcon className="h-4 w-4" />
                    <AlertTitle>Callback URL (copy exactly)</AlertTitle>
                    <AlertDescription>
                      <code className="bg-muted mt-2 block rounded px-2 py-1 text-xs">
                        https://app.callhenk.com/api/integrations/salesforce/callback
                      </code>
                      <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                        ⚠️ This must match exactly - no trailing slashes!
                      </p>
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    3. <strong>Selected OAuth Scopes</strong>: Add these three
                    scopes:
                  </p>
                  <ul className="ml-4 list-inside list-disc space-y-1 text-sm">
                    <li>
                      Access the identity URL service (id, profile, email,
                      address, phone)
                    </li>
                    <li>Access and manage your data (api)</li>
                    <li>
                      Perform requests on your behalf at any time
                      (refresh_token, offline_access)
                    </li>
                  </ul>
                  <p className="text-muted-foreground ml-4 text-xs">
                    Click <strong>Add</strong> to move them to &quot;Selected
                    OAuth Scopes&quot;
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    4. <strong>Additional Settings</strong> (recommended):
                  </p>
                  <ul className="ml-4 list-none space-y-1 text-sm">
                    <li>✅ Require Secret for Web Server Flow</li>
                    <li>✅ Require Secret for Refresh Token Flow</li>
                  </ul>
                </div>
              </div>

              {/* 1.5 */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">1.5 Save and Wait</h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-sm">
                  <li>
                    Click <strong>Save</strong> at the bottom
                  </li>
                  <li>
                    Click <strong>Continue</strong> on the confirmation page
                  </li>
                  <li>
                    ⏰ <strong>Wait 2-10 minutes</strong> for the app to become
                    active
                  </li>
                </ol>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Salesforce needs time to propagate your Connected App across
                    their systems. Grab a coffee while you wait! ☕
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  2
                </div>
                Copy Your OAuth Credentials
              </CardTitle>
              <CardDescription>
                Get your Client ID and Client Secret
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                You&apos;ll now see your Connected App details page with the API
                section.
              </p>

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <Key className="h-4 w-4" />
                  Copy Consumer Key (Client ID)
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-sm">
                  <li>
                    Find the <strong>Consumer Key</strong> field
                  </li>
                  <li>
                    Click the <strong>📋 Copy</strong> button or select and copy
                    the entire key
                  </li>
                  <li>
                    <strong>Paste it somewhere safe</strong> - you&apos;ll need
                    it in Step 3
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="flex items-center gap-2 text-sm font-medium">
                  <Lock className="h-4 w-4" />
                  Copy Consumer Secret (Client Secret)
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-sm">
                  <li>
                    Click <strong>&quot;Click to reveal&quot;</strong> next to
                    Consumer Secret
                  </li>
                  <li>Copy the revealed secret</li>
                  <li>
                    <strong>Paste it somewhere safe</strong> - you&apos;ll need
                    it in Step 3
                  </li>
                </ol>
              </div>

              <Alert
                variant="default"
                className="border-amber-200 bg-amber-50 dark:bg-amber-950"
              >
                <Lock className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-900 dark:text-amber-100">
                  Security Note
                </AlertTitle>
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                  Keep these credentials private. Never share them or commit
                  them to version control.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  3
                </div>
                Connect to Henk
              </CardTitle>
              <CardDescription>
                Enter your credentials in the Henk integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  3.1 Navigate to Integrations
                </h4>
                <ol className="ml-4 list-inside list-decimal space-y-2 text-sm">
                  <li>Go to Settings → Integrations</li>
                  <li>
                    Find the <strong>Salesforce</strong> card
                  </li>
                  <li>
                    Click <strong>Connect</strong>
                  </li>
                </ol>
                <div className="mt-2">
                  <Link href="/home/integrations">
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Go to Integrations
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">
                  3.2 Complete the 2-Step Setup Wizard
                </h4>
                <p className="mb-3 text-sm">
                  You&apos;ll see a guided setup wizard with two steps:
                </p>

                <div className="space-y-4">
                  {/* Step 1: Authentication */}
                  <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        1
                      </div>
                      <p className="text-sm font-medium">Authentication</p>
                    </div>
                    <div className="ml-8 space-y-2">
                      <div>
                        <p className="text-sm font-medium">
                          Client ID (Consumer Key)
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Paste the Consumer Key from Step 2
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Client Secret (Consumer Secret)
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Paste the Consumer Secret from Step 2
                        </p>
                      </div>
                      <p className="text-muted-foreground text-xs italic">
                        Then click Continue
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Connect */}
                  <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        2
                      </div>
                      <p className="text-sm font-medium">Review & Connect</p>
                    </div>
                    <div className="ml-8 space-y-2">
                      <ol className="list-inside list-decimal space-y-1 text-sm">
                        <li>
                          Review your settings (automatically set to Production
                          environment)
                        </li>
                        <li>
                          Click <strong>Connect to Salesforce</strong>
                        </li>
                        <li>
                          You&apos;ll be redirected to Salesforce Production
                        </li>
                        <li>
                          Review the permissions and click{' '}
                          <strong>Allow</strong>
                        </li>
                        <li>You&apos;ll be redirected back to Henk</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>

              <Alert
                variant="default"
                className="border-green-200 bg-green-50 dark:bg-green-950"
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900 dark:text-green-100">
                  Done!
                </AlertTitle>
                <AlertDescription className="text-xs text-green-800 dark:text-green-200">
                  Your Salesforce integration is now connected. You can start
                  importing contacts!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-l-4 border-red-500 py-2 pl-4">
                <h4 className="mb-1 text-sm font-medium">
                  &quot;External client app is not installed&quot;
                </h4>
                <p className="text-muted-foreground mb-2 text-sm">
                  The Connected App hasn&apos;t been created yet or isn&apos;t
                  active.
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Verify you created the Connected App in Step 1</li>
                  <li>
                    Make sure you&apos;re logging into the same Salesforce
                    organization
                  </li>
                  <li>Wait 2-10 minutes after creating the app</li>
                  <li>
                    Check the app is enabled in Salesforce Setup → App Manager
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-amber-500 py-2 pl-4">
                <h4 className="mb-1 text-sm font-medium">
                  &quot;redirect_uri_mismatch&quot;
                </h4>
                <p className="text-muted-foreground mb-2 text-sm">
                  The callback URL doesn&apos;t match.
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Go back to your Connected App in Salesforce</li>
                  <li>
                    Verify the callback URL is exactly:{' '}
                    <code className="bg-muted rounded px-1 text-xs">
                      https://app.callhenk.com/api/integrations/salesforce/callback
                    </code>
                  </li>
                  <li>No extra spaces, no trailing slashes</li>
                  <li>Save changes and wait 2 minutes</li>
                </ul>
              </div>

              <div className="border-l-4 border-blue-500 py-2 pl-4">
                <h4 className="mb-1 text-sm font-medium">
                  &quot;Invalid Client ID&quot; or &quot;Invalid Client
                  Secret&quot;
                </h4>
                <p className="text-muted-foreground mb-2 text-sm">
                  The credentials were copied incorrectly.
                </p>
                <ul className="list-inside list-disc space-y-1 text-sm">
                  <li>Go back to Salesforce → Setup → App Manager</li>
                  <li>
                    Find your Connected App and click <strong>View</strong>
                  </li>
                  <li>Copy the Consumer Key and Secret again carefully</li>
                  <li>Make sure you didn&apos;t include extra spaces</li>
                  <li>Re-enter them in Henk</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Still having issues?</strong> Contact support at{' '}
                  <a
                    href="mailto:support@callhenk.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@callhenk.com
                  </a>{' '}
                  and include the specific error message you&apos;re seeing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/home/integrations"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <Settings className="h-4 w-4" />
                  Go to Integrations
                </Link>
                <Link
                  href="/home/integrations/salesforce-setup"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Detailed Setup Guide
                </Link>
                <a
                  href="https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Salesforce Documentation
                </a>
                <a
                  href="mailto:support@callhenk.com"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Contact Support
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
