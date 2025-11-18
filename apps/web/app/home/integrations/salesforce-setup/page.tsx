import { AlertCircle, CheckCircle, ExternalLink, Info } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';

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
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>A Salesforce account (Production or Sandbox)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>
                    Salesforce administrator access (for first-time setup)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                  <span>
                    &quot;API Enabled&quot; permission in your user profile
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <Alert
            variant="default"
            className="border-amber-200 bg-amber-50 dark:bg-amber-950"
          >
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100">
              Salesforce Integration Currently in Beta
            </AlertTitle>
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              The Salesforce integration is currently being set up. Please
              contact{' '}
              <a
                href="mailto:support@callhenk.com"
                className="font-medium underline"
              >
                support@callhenk.com
              </a>{' '}
              if you&apos;re interested in early access.
            </AlertDescription>
          </Alert>

          {/* Step 1: How It Will Work */}
          <Card>
            <CardHeader>
              <CardTitle>How It Will Work (Once Available)</CardTitle>
              <CardDescription>
                The setup process for when the integration goes live
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="text-sm font-medium">
                  Once the integration is ready:
                </h4>

                <div className="space-y-3 border-l-2 border-blue-200 pl-4">
                  <div>
                    <p className="mb-1 text-sm font-medium">
                      For Administrators (One-time setup)
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Your Salesforce admin will install the Henk Connected App
                      in your Salesforce organization using a simple
                      installation link we provide.
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-medium">For All Users</p>
                    <p className="text-muted-foreground text-sm">
                      After admin setup, any user can click &quot;Connect&quot;
                      on the Salesforce integration card, sign in to Salesforce,
                      and authorize access - no technical knowledge required.
                    </p>
                  </div>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Interested in beta access?</strong> Email{' '}
                  <a
                    href="mailto:support@callhenk.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@callhenk.com
                  </a>{' '}
                  to learn more about early access options.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle>Why Connect Salesforce?</CardTitle>
              <CardDescription>
                Benefits of the Salesforce integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">
                      Import Contacts Seamlessly
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Sync your Salesforce contacts directly into Henk campaigns
                      without manual data entry.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Keep Data Up-to-Date</p>
                    <p className="text-muted-foreground text-sm">
                      Automatically sync contact information and campaign
                      results back to Salesforce.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">
                      Secure OAuth Authentication
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Industry-standard OAuth 2.0 means no sharing passwords or
                      API keys.
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
                <div className="border-l-4 border-red-500 py-2 pl-4">
                  <h4 className="mb-1 text-sm font-medium">
                    Error: &quot;External client app is not installed&quot;
                  </h4>
                  <p className="text-muted-foreground mb-2 text-sm">
                    This means Step 1 hasn&apos;t been completed yet.
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Contact your Salesforce
                    administrator to install the app in your organization. They
                    need to complete Step 1 above.
                  </p>
                </div>

                {/* Error 2 */}
                <div className="border-l-4 border-amber-500 py-2 pl-4">
                  <h4 className="mb-1 text-sm font-medium">
                    Error: &quot;You denied access&quot;
                  </h4>
                  <p className="text-muted-foreground mb-2 text-sm">
                    You clicked &quot;Deny&quot; when Salesforce asked for
                    permission.
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Try connecting again and click
                    &quot;Allow&quot; when Salesforce asks for permission.
                  </p>
                </div>

                {/* Error 3 */}
                <div className="border-l-4 border-blue-500 py-2 pl-4">
                  <h4 className="mb-1 text-sm font-medium">
                    Missing &quot;API Enabled&quot; permission
                  </h4>
                  <p className="text-muted-foreground mb-2 text-sm">
                    Your Salesforce user profile doesn&apos;t have API access.
                  </p>
                  <p className="text-sm">
                    <strong>Solution:</strong> Ask your Salesforce administrator
                    to enable the &quot;API Enabled&quot; permission in your
                    user profile.
                  </p>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Still having issues?</strong> Contact our support team
                  at{' '}
                  <a
                    href="mailto:support@callhenk.com"
                    className="text-blue-600 hover:underline"
                  >
                    support@callhenk.com
                  </a>{' '}
                  and include the error message you&apos;re seeing.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* What We Access */}
          <Card>
            <CardHeader>
              <CardTitle>What We Access</CardTitle>
              <CardDescription>
                Information we request from your Salesforce account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Contact Records</p>
                    <p className="text-muted-foreground text-sm">
                      Read access to import your contacts for targeted campaigns
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">
                      Basic Account Information
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Your name and email to identify your account
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">API Access</p>
                    <p className="text-muted-foreground text-sm">
                      Permission to sync data in real-time
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="text-muted-foreground text-sm">
                  <strong>Security:</strong> We use industry-standard OAuth 2.0
                  for secure authentication. You can revoke access at any time
                  from your Salesforce Connected Apps settings.
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
