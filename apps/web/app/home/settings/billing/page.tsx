import { use } from 'react';

import { CreditCard, DollarSign, Receipt, Zap } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Separator } from '@kit/ui/separator';

import { withI18n } from '~/lib/i18n/with-i18n';
import { requireUserInServerComponent } from '~/lib/server/require-user-in-server-component';

export const generateMetadata = async () => {
  return {
    title: 'Billing Settings',
  };
};

function BillingSettingsPage() {
  const _user = use(requireUserInServerComponent());

  return (
    <>
      <PageHeader
        title="Billing & Subscription"
        description="Manage your subscription, billing information, and payment methods"
      />
      <PageBody>
        <div className="w-full max-w-3xl space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <CardTitle>Current Plan</CardTitle>
              </div>
              <CardDescription>
                Your current subscription and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Plan
                  </p>
                  <Badge variant="default" className="mt-1">
                    Pro Plan
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Status
                  </p>
                  <Badge variant="default" className="mt-1">
                    Active
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Next Billing
                  </p>
                  <p className="text-sm">January 15, 2025</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Amount
                  </p>
                  <p className="text-sm">$29/month</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <CardTitle>Payment Methods</CardTitle>
              </div>
              <CardDescription>
                Manage your payment methods and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Add, remove, or update your payment methods for subscription billing. Securely store credit cards, debit cards, or bank accounts for automatic payments.
              </p>
              <Button variant="outline" disabled>Manage Payment Methods (Coming Soon)</Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5" />
                <CardTitle>Billing History</CardTitle>
              </div>
              <CardDescription>
                View your past invoices and billing history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Access and download your past invoices and billing statements. View payment history, transaction details, and export records for accounting purposes.
              </p>
              <Button variant="outline" disabled>View Billing History (Coming Soon)</Button>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <CardTitle>Usage & Limits</CardTitle>
              </div>
              <CardDescription>
                Monitor your usage and plan limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Campaigns
                  </p>
                  <p className="text-sm">5 / 10</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Agents
                  </p>
                  <p className="text-sm">3 / 5</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Calls/Month
                  </p>
                  <p className="text-sm">1,250 / 2,000</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Storage
                  </p>
                  <p className="text-sm">2.5 GB / 10 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(BillingSettingsPage);
