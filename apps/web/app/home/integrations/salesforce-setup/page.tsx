import { PageBody, PageHeader } from '@kit/ui/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { AlertCircle, CheckCircle, ExternalLink, Info } from 'lucide-react';

export default function SalesforceSetupPage() {
  return (
    <>
      <PageHeader
        title="Salesforce Integration Setup"
        description="Step-by-step guide to connect your Salesforce account"
      />
      <PageBody>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* What You Need */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                What You&apos;ll Need
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>A Salesforce account (Production or Sandbox)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Salesforce administrator access (for first-time setup)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>&quot;API Enabled&quot; permission in your user profile</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Alert variant="default" className="border-amber-200 bg-amber-50 dark:bg-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">
              One-Time Administrator Setup Required
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              Before anyone in your organization can connect to Salesforce, a Salesforce
              administrator needs to install our app in your Salesforce organization. This only
              needs to be done once.
            </AlertDescription>
          </Alert>

          {/* Step 1: Administrator Setup */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Step 1: Administrator Installation</CardTitle>
                  <CardDescription>This step requires Salesforce admin privileges</CardDescription>
                </div>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                  One-time only
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">For Salesforce Administrators:</h4>

                <div className="pl-4 space-y-3 border-l-2 border-blue-200">
                  <div>
                    <p className="text-sm font-medium mb-1">1. Request installation access</p>
                    <p className="text-sm text-muted-foreground">
                      Contact <a href="mailto:support@callhenk.com" className="text-blue-600 hover:underline">support@callhenk.com</a> to
                      request access to install the Henk Connected App in your Salesforce organization.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">2. Install the package</p>
                    <p className="text-sm text-muted-foreground">
                      We&apos;ll provide you with an installation link. Click it while logged into your Salesforce org to begin installation.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">3. Approve the installation</p>
                    <p className="text-sm text-muted-foreground">
                      Select &quot;Install for All Users&quot; to allow everyone in your organization to use the integration.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">4. Notify your team</p>
                    <p className="text-sm text-muted-foreground">
                      Once installed, all users can connect their individual Salesforce accounts from the Integrations page.
                    </p>
                  </div>
                </div>

                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Technical Note:</strong> This installs a pre-configured Connected App that allows
                    secure OAuth authentication. Each user will authorize access to their own Salesforce data.
                  </AlertDescription>
                </Alert>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Not an administrator?</strong> Contact your Salesforce administrator or IT team
                  to complete this setup. Share this guide with them.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Step 2: User Connection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Step 2: Connect Your Account</CardTitle>
                  <CardDescription>After the administrator has installed the app</CardDescription>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                  Easy setup
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-sm">For All Users:</h4>

                <div className="pl-4 space-y-3 border-l-2 border-green-200">
                  <div>
                    <p className="text-sm font-medium mb-1">1. Go to Integrations page</p>
                    <p className="text-sm text-muted-foreground">
                      Navigate to <a href="/home/integrations" className="text-blue-600 hover:underline">Integrations</a> in
                      your dashboard.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">2. Click Connect on Salesforce</p>
                    <p className="text-sm text-muted-foreground">
                      Find the Salesforce integration card and click the &quot;Connect&quot; button.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">3. Authorize access</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be redirected to Salesforce. Sign in and click &quot;Allow&quot; to grant access.
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">4. You&apos;re connected!</p>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll be redirected back and can start importing your Salesforce contacts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      No API keys or technical setup needed!
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                      Just sign in to Salesforce and approve - we handle all the technical details.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Troubleshooting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {/* Error 1 */}
                <div className="border-l-4 border-red-500 pl-4 py-2">
                  <h4 className="font-medium text-sm mb-1">
                    Error: &quot;External client app is not installed&quot;
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    This means Step 1 hasn&apos;t been completed yet.
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Contact your Salesforce administrator to install the app
                    in your organization. They need to complete Step 1 above.
                  </p>
                </div>

                {/* Error 2 */}
                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <h4 className="font-medium text-sm mb-1">
                    Error: &quot;You denied access&quot;
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    You clicked &quot;Deny&quot; when Salesforce asked for permission.
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Try connecting again and click &quot;Allow&quot; when Salesforce
                    asks for permission.
                  </p>
                </div>

                {/* Error 3 */}
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-medium text-sm mb-1">
                    Missing &quot;API Enabled&quot; permission
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your Salesforce user profile doesn&apos;t have API access.
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Ask your Salesforce administrator to enable the
                    &quot;API Enabled&quot; permission in your user profile.
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Still having issues?</strong> Contact our support team at{' '}
                  <a href="mailto:support@callhenk.com" className="text-blue-600 hover:underline">
                    support@callhenk.com
                  </a>
                  {' '}and include the error message you&apos;re seeing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* What We Access */}
          <Card>
            <CardHeader>
              <CardTitle>What We Access</CardTitle>
              <CardDescription>Information we request from your Salesforce account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Contact Records</p>
                    <p className="text-sm text-muted-foreground">
                      Read access to import your contacts for targeted campaigns
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Basic Account Information</p>
                    <p className="text-sm text-muted-foreground">
                      Your name and email to identify your account
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">API Access</p>
                    <p className="text-sm text-muted-foreground">
                      Permission to sync data in real-time
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  <strong>Security:</strong> We use industry-standard OAuth 2.0 for secure authentication.
                  You can revoke access at any time from your Salesforce Connected Apps settings.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="/home/integrations"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Go to Integrations
                </a>
                <a
                  href="https://help.salesforce.com/s/articleView?id=sf.remoteaccess_about.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Salesforce OAuth Documentation
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
