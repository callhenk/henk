'use client';

import { CreditCard } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

export function PaymentMethodsCard() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5 px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <CardTitle className="text-lg font-semibold tracking-tight">
            Payment Methods
          </CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">
          Manage your payment methods and billing information
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="rounded-lg border border-dashed p-4">
          <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
            Payment methods are currently managed manually. For billing
            inquiries or to update your payment information, please contact
            support.
          </p>
          <Button variant="outline" disabled className="h-10">
            Manage Payment Methods (Coming Soon)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
