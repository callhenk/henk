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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, billing information, and payment methods
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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

        <Card>
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
            <Button variant="outline">Manage Payment Methods</Button>
          </CardContent>
        </Card>

        <Card>
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
            <Button variant="outline">View Billing History</Button>
          </CardContent>
        </Card>

        <Card>
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
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}

export default withI18n(BillingSettingsPage);
