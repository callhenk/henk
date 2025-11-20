# Billing System Documentation

This document describes the billing and subscription management system for the Henk platform.

## Overview

The billing system supports:

- **Multiple subscription tiers** (Free, Starter, Professional, Enterprise)
- **Usage-based limits** (agents, contacts, calls, etc.)
- **Manual billing** (current) with future support for automated payments (Stripe/PayPal)
- **Usage tracking and enforcement** to restrict features based on plan limits
- **Flexible JSONB-based limits and features** for easy plan customization

## Database Schema

### Tables

#### 1. `billing_plans`

Defines available subscription tiers with features and limits.

**Key Columns:**

- `name` - Unique plan identifier ('free', 'starter', 'professional', 'enterprise')
- `display_name` - User-friendly name
- `price_monthly` - Monthly price in cents
- `price_yearly` - Yearly price in cents (typically discounted)
- `limits` - JSONB object with usage limits
- `features` - JSONB object with feature flags
- `is_active` - Whether the plan can be assigned
- `is_public` - Whether the plan appears on pricing pages

**Default Plans:**

| Plan         | Price (Monthly) | Agents    | Contacts  | Calls/Month | Team Members |
| ------------ | --------------- | --------- | --------- | ----------- | ------------ |
| Free         | $0              | 1         | 100       | 50          | 1            |
| Starter      | $49             | 3         | 1,000     | 500         | 3            |
| Professional | $149            | 10        | 10,000    | 5,000       | 10           |
| Enterprise   | Custom          | Unlimited | Unlimited | Unlimited   | Unlimited    |

#### 2. `business_subscriptions`

Links businesses to billing plans with subscription details.

**Key Columns:**

- `business_id` - Foreign key to businesses table
- `plan_id` - Foreign key to billing_plans table
- `status` - 'active', 'trial', 'past_due', 'canceled', 'expired', 'suspended'
- `billing_cycle` - 'monthly' or 'yearly'
- `current_period_start` - Start of current billing period
- `current_period_end` - End of current billing period
- `trial_ends_at` - Trial expiration date (if applicable)
- `cancel_at_period_end` - Whether to cancel at end of period
- `stripe_customer_id` - For future Stripe integration
- `paypal_subscription_id` - For future PayPal integration
- `notes` - Internal notes for manual billing

**Constraint:** One active subscription per business.

#### 3. `usage_records`

Tracks actual usage per business per billing period.

**Key Columns:**

- `business_id` - Foreign key to businesses table
- `period_start` - Start of tracking period (matches subscription period)
- `period_end` - End of tracking period
- `usage_data` - JSONB object with usage metrics

**Example `usage_data`:**

```json
{
  "agents": 3,
  "contacts": 450,
  "calls": 120,
  "team_members": 2,
  "campaigns": 5,
  "integrations": 1,
  "storage_gb": 2.5,
  "api_requests": 850
}
```

**Constraint:** One record per business per period.

#### 4. `payment_transactions`

Records all payment transactions (manual and automated).

**Key Columns:**

- `business_id` - Foreign key to businesses table
- `subscription_id` - Foreign key to business_subscriptions table
- `amount` - Amount in cents
- `currency` - Currency code (default: 'USD')
- `status` - 'pending', 'completed', 'failed', 'refunded', 'canceled'
- `payment_method` - 'manual', 'stripe', 'paypal', 'wire', 'check', 'other'
- `payment_provider_id` - External transaction ID
- `invoice_number` - Invoice reference
- `notes` - Internal notes for manual payments

## React Query Hooks

### Querying Billing Plans

```typescript
import { useBillingPlans, useBillingPlan } from '@kit/supabase/hooks/billing';

// Get all active public plans
function PricingPage() {
  const { data: plans, isLoading } = useBillingPlans();

  return (
    <div>
      {plans?.map(plan => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

// Get a specific plan
function PlanDetails({ planId }: { planId: string }) {
  const { data: plan, isLoading } = useBillingPlan(planId);

  if (!plan) return null;

  return <div>{plan.display_name}: ${plan.price_monthly / 100}/mo</div>;
}
```

### Querying Subscription

```typescript
import {
  useBusinessSubscription,
  useCurrentPlan,
  useHasFeature,
  useIsOnTrial,
} from '@kit/supabase/hooks/billing';

// Get full subscription with plan details
function SubscriptionPage() {
  const { data: subscription, isLoading } = useBusinessSubscription();

  if (!subscription) return <div>No subscription found</div>;

  return (
    <div>
      <h1>Current Plan: {subscription.plan.display_name}</h1>
      <p>Status: {subscription.status}</p>
      <p>Period ends: {new Date(subscription.current_period_end).toLocaleDateString()}</p>
    </div>
  );
}

// Check if on trial
function TrialBanner() {
  const { isOnTrial, daysRemaining } = useIsOnTrial();

  if (!isOnTrial) return null;

  return (
    <div className="bg-yellow-100 p-4">
      Your trial ends in {daysRemaining} days
    </div>
  );
}

// Check for specific feature
function AdvancedAnalyticsButton() {
  const { hasFeature } = useHasFeature('advanced_analytics');

  if (!hasFeature) {
    return <UpgradeBanner feature="Advanced Analytics" />;
  }

  return <Link href="/analytics">View Analytics</Link>;
}
```

### Checking Usage Limits

```typescript
import {
  useCheckUsageLimit,
  useCanPerformAction,
  useAllUsageLimits,
} from '@kit/supabase/hooks/billing';

// Check a specific limit
function AgentsList() {
  const check = useCheckUsageLimit('agents');

  return (
    <div>
      <h2>AI Agents ({check.currentUsage} / {check.limit})</h2>
      <ProgressBar percentage={check.percentageUsed} />
      {check.isExceeded && (
        <div className="text-red-500">
          You've reached your limit. Upgrade to add more agents.
        </div>
      )}
    </div>
  );
}

// Check before performing action
function CreateAgentButton() {
  const { canPerform, reason } = useCanPerformAction('agents');

  if (!canPerform) {
    return (
      <Tooltip content={reason}>
        <Button disabled>Create Agent</Button>
      </Tooltip>
    );
  }

  return <Button onClick={createAgent}>Create Agent</Button>;
}

// Display all usage limits
function UsageDashboard() {
  const { limits, isLoading } = useAllUsageLimits();

  if (isLoading) return <Spinner />;

  return (
    <div>
      {limits.map(limit => (
        <UsageLimitCard
          key={limit.limitKey}
          label={limit.limitKey}
          current={limit.currentUsage}
          limit={limit.limit}
          percentage={limit.percentageUsed}
          exceeded={limit.isExceeded}
        />
      ))}
    </div>
  );
}
```

### Incrementing Usage

```typescript
import { useIncrementUsage, useSetUsage } from '@kit/supabase/hooks/billing';

// Increment usage after action
function useCreateAgent() {
  const incrementUsage = useIncrementUsage();

  return useMutation({
    mutationFn: async (data: CreateAgentData) => {
      // Create the agent
      const agent = await createAgent(data);

      // Increment usage counter
      await incrementUsage.mutateAsync({ limitKey: 'agents' });

      return agent;
    },
  });
}

// Set usage to exact count (for syncing)
function useSyncAgentCount() {
  const setUsage = useSetUsage();

  return async () => {
    const count = await countAgents();
    await setUsage.mutateAsync({ limitKey: 'agents', value: count });
  };
}
```

### Managing Subscriptions (Admin)

```typescript
import {
  useChangePlan,
  useUpdateSubscriptionStatus,
  useRecordPayment,
  useExtendBillingPeriod,
} from '@kit/supabase/hooks/billing';

// Change plan (manual billing)
function ChangePlanForm() {
  const changePlan = useChangePlan();

  const handleSubmit = async (planId: string) => {
    await changePlan.mutateAsync({
      plan_id: planId,
      billing_cycle: 'monthly',
      notes: 'Upgraded by admin',
    });
  };

  return <PlanSelector onSelect={handleSubmit} />;
}

// Record manual payment
function RecordPaymentForm() {
  const recordPayment = useRecordPayment();

  const handleSubmit = async (data: PaymentFormData) => {
    await recordPayment.mutateAsync({
      subscription_id: data.subscriptionId,
      amount: data.amount * 100, // Convert to cents
      payment_method: 'wire',
      invoice_number: data.invoiceNumber,
      notes: data.notes,
    });
  };

  return <PaymentForm onSubmit={handleSubmit} />;
}
```

## Server-Side Usage Enforcement

For API routes and server actions, use the enforcement middleware:

```typescript
import {
  enforceUsageLimit,
  incrementUsage,
  checkUsageLimit,
  hasFeature,
} from '@/lib/middleware/usage-enforcement';

// API route: Create agent
export async function POST(request: NextRequest) {
  const { businessId } = await getBusinessContext();

  try {
    // Enforce limit before creating
    await enforceUsageLimit(businessId, 'agents');

    // Create the agent
    const agent = await createAgent(data);

    // Increment usage after success
    await incrementUsage(businessId, 'agents');

    return NextResponse.json({ agent });
  } catch (error) {
    if (error instanceof UsageLimitExceededError) {
      return NextResponse.json(
        { error: error.message },
        { status: 429 }, // Too Many Requests
      );
    }
    throw error;
  }
}

// Check without enforcing
export async function GET(request: NextRequest) {
  const { businessId } = await getBusinessContext();

  const result = await checkUsageLimit(businessId, 'agents');

  return NextResponse.json({
    canCreate: result.canPerform,
    current: result.currentUsage,
    limit: result.limit,
    reason: result.reason,
  });
}

// Check feature availability
export async function GET(request: NextRequest) {
  const { businessId } = await getBusinessContext();

  const hasAdvancedAnalytics = await hasFeature(businessId, 'advanced_analytics');

  if (!hasAdvancedAnalytics) {
    return NextResponse.json(
      { error: 'Feature not available on your plan' },
      { status: 403 },
    );
  }

  // Proceed with feature...
}
```

## Database Functions

The migration includes helpful database functions:

### `get_business_subscription(p_business_id uuid)`

Returns the current subscription with plan details.

```sql
SELECT * FROM get_business_subscription('business-uuid-here');
```

Returns:

- subscription_id
- plan_id
- plan_name
- plan_display_name
- status
- limits (jsonb)
- features (jsonb)
- current_period_end

### `check_usage_limit(p_business_id uuid, p_limit_key text)`

Checks if a usage limit has been exceeded.

```sql
SELECT * FROM check_usage_limit('business-uuid-here', 'agents');
```

Returns:

- current_usage
- limit_value
- is_exceeded

### `increment_usage(p_business_id uuid, p_usage_key text, p_increment numeric)`

Increments a usage counter.

```sql
SELECT increment_usage('business-uuid-here', 'agents', 1);
```

## Manual Billing Workflow

Since billing is currently manual, here's the typical workflow:

### 1. New Customer Onboarding

1. Customer signs up → automatically assigned to **Free** plan
2. Customer requests upgrade
3. Admin negotiates pricing and terms
4. Admin manually updates subscription in database

### 2. Updating a Subscription (SQL)

```sql
-- Change plan
UPDATE business_subscriptions
SET
  plan_id = (SELECT id FROM billing_plans WHERE name = 'professional'),
  billing_cycle = 'monthly',
  notes = 'Upgraded on 2025-01-15, paid via wire transfer',
  updated_at = NOW()
WHERE business_id = 'customer-business-id';
```

### 3. Recording a Payment (SQL)

```sql
-- Record payment
INSERT INTO payment_transactions (
  business_id,
  subscription_id,
  amount,
  currency,
  status,
  payment_method,
  invoice_number,
  description,
  notes,
  paid_at
) VALUES (
  'customer-business-id',
  'subscription-id',
  14900, -- $149.00
  'USD',
  'completed',
  'wire',
  'INV-2025-001',
  'Professional Plan - January 2025',
  'Wire transfer received on 2025-01-15',
  NOW()
);
```

### 4. Extending Billing Period (SQL)

```sql
-- Extend period by 30 days
UPDATE business_subscriptions
SET
  current_period_end = current_period_end + INTERVAL '30 days',
  updated_at = NOW()
WHERE business_id = 'customer-business-id';
```

## Future: Automated Billing with Stripe/PayPal

The schema is ready for automated billing integration:

### Stripe Integration

1. Create Stripe customer → Store `stripe_customer_id`
2. Create Stripe subscription → Store `stripe_subscription_id`
3. Handle webhooks to update subscription status
4. Record payments automatically via webhook events

### PayPal Integration

1. Create PayPal subscription → Store `paypal_subscription_id`
2. Handle IPN/webhooks to update subscription status
3. Record payments automatically via webhook events

## Usage Tracking Best Practices

### 1. Sync Usage Periodically

Run a cron job to sync usage with actual counts:

```typescript
import { syncUsageWithActualCounts } from '@/lib/middleware/usage-enforcement';

// Run daily via cron
async function syncAllBusinessUsage() {
  const businesses = await getAllBusinesses();

  for (const business of businesses) {
    await syncUsageWithActualCounts(business.id);
  }
}
```

### 2. Check Limits Before Actions

Always check limits before allowing actions:

```typescript
// ❌ BAD: Create first, check later
const agent = await createAgent(data);
await incrementUsage(businessId, 'agents');

// ✅ GOOD: Check first, create if allowed
await enforceUsageLimit(businessId, 'agents');
const agent = await createAgent(data);
await incrementUsage(businessId, 'agents');
```

### 3. Handle Errors Gracefully

```typescript
try {
  await enforceUsageLimit(businessId, 'agents');
  // Proceed with action
} catch (error) {
  if (error instanceof UsageLimitExceededError) {
    // Show upgrade prompt
    toast.error('You've reached your agent limit. Upgrade to add more.');
    showUpgradeModal();
  } else {
    // Handle other errors
    toast.error('Something went wrong');
  }
}
```

## Testing

### Reset Usage for Testing

```sql
-- Reset usage for a business
DELETE FROM usage_records WHERE business_id = 'test-business-id';
```

### Create Test Plans

```sql
-- Create a test plan
INSERT INTO billing_plans (
  name,
  display_name,
  price_monthly,
  price_yearly,
  limits,
  features,
  is_public
) VALUES (
  'test',
  'Test Plan',
  0,
  0,
  '{"agents": 2, "contacts": 50}',
  '{"advanced_analytics": false}',
  false
);
```

## Migration Application

Once the Supabase environment is working:

```bash
# Apply the migration
pnpm supabase:reset

# Generate TypeScript types
pnpm supabase:typegen

# Verify tables were created
psql -U postgres -h localhost -p 54322 -d postgres -c "\dt billing_*"
```

## Next Steps

1. **Apply the migration** when Supabase environment is fixed
2. **Generate types** with `pnpm supabase:typegen`
3. **Add usage enforcement** to existing API routes
4. **Create billing UI** in settings (pricing page, usage dashboard)
5. **Set up cron job** for usage syncing
6. **Test manually** with different plans
7. **Integrate Stripe/PayPal** when ready for automated billing

## Support

For questions or issues:

- Check the CLAUDE.md file for project guidelines
- Review the database migration file for schema details
- Consult the React Query hooks for usage examples

## Upgrade Plan Flow

The platform provides a manual upgrade flow that allows users to request plan upgrades via email or book a call.

### User Experience

1. User clicks "Upgrade Plan" button on the billing settings page
2. A dialog appears showing available upgrade plans (excluding current and free plans)
3. User selects desired plan and sees:
   - Plan features and pricing
   - Two action options:
     - **Send Upgrade Request**: Sends email to admin team
     - **Book a Call**: Opens Calendly link in new tab

### Email Notifications

When a user requests an upgrade:

1. **Admin Notification Emails** sent to:
   - `jerome+upgrade-plan-request@callhenk.com`
   - Email configured in `ADMIN_EMAIL` environment variable (defaults to `cyrus@callhenk.com`)

2. **User Confirmation Email** sent to the requesting user

### API Endpoint

**POST** `/api/billing/request-upgrade`

**Request Body:**

```json
{
  "planId": "uuid",
  "planName": "Professional"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Upgrade request sent successfully"
}
```

**Authentication:** Required (authenticated user with business context)

**Email Service:** Uses Resend with `RESEND_API_KEY`

### Calendly Integration

**Direct Call Booking:** `https://calendly.com/jerome-callhenk/30min`

Users can book a 30-minute call to discuss their upgrade directly with the team.

### Environment Variables

Add to `.env.local`:

```bash
# Email service (required)
RESEND_API_KEY=your_resend_api_key

# Admin email for upgrade notifications (optional, defaults to cyrus@callhenk.com)
ADMIN_EMAIL=cyrus@callhenk.com
```

### Components

- **Dialog:** `apps/web/app/home/settings/billing/_components/upgrade-plan-dialog.tsx`
- **API Route:** `apps/web/app/api/billing/request-upgrade/route.ts`
- **Integration:** `apps/web/app/home/settings/billing/_components/current-plan-card.tsx`

### Processing Upgrades Manually

When an upgrade request is received:

1. Review admin notification email with user details
2. Contact user at provided email
3. Discuss pricing and confirm upgrade
4. Update subscription in database:
   ```sql
   UPDATE business_subscriptions
   SET plan_id = 'new-plan-uuid',
       billing_cycle = 'monthly',
       updated_at = NOW()
   WHERE business_id = 'business-uuid';
   ```
5. Send confirmation email to user

### Future Automation

The system is designed to support future integration with:

- **Stripe:** For automated payment processing
- **PayPal:** For alternative payment method
- Webhooks for automatic subscription updates
- Self-service plan changes
