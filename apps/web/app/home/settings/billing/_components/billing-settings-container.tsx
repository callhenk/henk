'use client';

import { CurrentPlanCard } from './current-plan-card';
import { PaymentMethodsCard } from './payment-methods-card';
import { UsageLimitsCard } from './usage-limits-card';

export function BillingSettingsContainer() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <CurrentPlanCard />
      <UsageLimitsCard />
      <PaymentMethodsCard />
    </div>
  );
}
