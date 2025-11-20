-- =====================================================
-- Billing System Migration
-- =====================================================
-- Creates tables for subscription billing, usage tracking,
-- and payment management. Supports manual billing now,
-- with future Stripe/PayPal integration ready.
-- =====================================================

-- =====================================================
-- 1. BILLING PLANS TABLE
-- =====================================================
-- Defines available subscription tiers with features and limits

CREATE TABLE IF NOT EXISTS public.billing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Plan identification
  name text NOT NULL UNIQUE, -- e.g., 'free', 'starter', 'professional', 'enterprise'
  display_name text NOT NULL, -- e.g., 'Free Plan', 'Starter'
  description text,

  -- Pricing (in cents to avoid floating point issues)
  price_monthly integer NOT NULL DEFAULT 0, -- Monthly price in cents
  price_yearly integer NOT NULL DEFAULT 0, -- Yearly price in cents (usually discounted)

  -- Features and limits (flexible JSONB structure)
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "agents": 5,
  --   "contacts": 1000,
  --   "calls_per_month": 500,
  --   "team_members": 3,
  --   "campaigns": 10,
  --   "integrations": 2,
  --   "storage_gb": 5,
  --   "api_requests_per_day": 1000,
  --   "custom_voice_cloning": false,
  --   "priority_support": false
  -- }

  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "advanced_analytics": true,
  --   "custom_branding": false,
  --   "api_access": true,
  --   "sso": false,
  --   "dedicated_support": false
  -- }

  -- Display and ordering
  is_active boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true, -- If false, only available via manual assignment
  sort_order integer NOT NULL DEFAULT 0,

  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for active public plans
CREATE INDEX idx_billing_plans_active_public ON public.billing_plans(is_active, is_public, sort_order);

-- =====================================================
-- 2. BUSINESS SUBSCRIPTIONS TABLE
-- =====================================================
-- Links businesses to billing plans with subscription details

CREATE TABLE IF NOT EXISTS public.business_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES public.billing_plans(id) ON DELETE RESTRICT,

  -- Subscription status
  status text NOT NULL DEFAULT 'active' CHECK (status IN (
    'active',      -- Subscription is active and paid
    'trial',       -- In trial period
    'past_due',    -- Payment failed, grace period
    'canceled',    -- Canceled but still active until period end
    'expired',     -- Subscription ended
    'suspended'    -- Manually suspended (non-payment, etc.)
  )),

  -- Billing cycle
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),

  -- Period tracking
  trial_ends_at timestamptz,
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),

  -- Cancellation
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,

  -- Payment provider integration (future use)
  stripe_customer_id text,
  stripe_subscription_id text,
  paypal_subscription_id text,

  -- Metadata
  notes text, -- For manual billing notes (e.g., "Custom enterprise deal")
  metadata jsonb DEFAULT '{}'::jsonb,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Ensure one active subscription per business
  CONSTRAINT unique_active_subscription UNIQUE (business_id)
);

-- Indexes
CREATE INDEX idx_business_subscriptions_business ON public.business_subscriptions(business_id);
CREATE INDEX idx_business_subscriptions_plan ON public.business_subscriptions(plan_id);
CREATE INDEX idx_business_subscriptions_status ON public.business_subscriptions(status);
CREATE INDEX idx_business_subscriptions_period_end ON public.business_subscriptions(current_period_end);

-- =====================================================
-- 3. USAGE RECORDS TABLE
-- =====================================================
-- Tracks actual usage per business per period for limit enforcement

CREATE TABLE IF NOT EXISTS public.usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  -- Period tracking (typically monthly, resets at subscription renewal)
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,

  -- Usage data (flexible JSONB structure matching plan limits)
  usage_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Example structure:
  -- {
  --   "agents": 3,
  --   "contacts": 450,
  --   "calls": 120,
  --   "team_members": 2,
  --   "campaigns": 5,
  --   "integrations": 1,
  --   "storage_gb": 2.5,
  --   "api_requests": 850
  -- }

  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  -- Ensure one record per business per period
  CONSTRAINT unique_usage_period UNIQUE (business_id, period_start, period_end)
);

-- Indexes
CREATE INDEX idx_usage_records_business ON public.usage_records(business_id);
CREATE INDEX idx_usage_records_period ON public.usage_records(business_id, period_start, period_end);
CREATE INDEX idx_usage_records_period_end ON public.usage_records(period_end);

-- =====================================================
-- 4. PAYMENT TRANSACTIONS TABLE
-- =====================================================
-- Records all payment transactions (manual and automated)

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  business_id uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.business_subscriptions(id) ON DELETE SET NULL,

  -- Transaction details
  amount integer NOT NULL, -- Amount in cents
  currency text NOT NULL DEFAULT 'USD',

  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Transaction initiated
    'completed',  -- Successfully processed
    'failed',     -- Payment failed
    'refunded',   -- Payment refunded
    'canceled'    -- Transaction canceled
  )),

  -- Payment method
  payment_method text NOT NULL DEFAULT 'manual' CHECK (payment_method IN (
    'manual',     -- Manually recorded by admin
    'stripe',     -- Stripe payment
    'paypal',     -- PayPal payment
    'wire',       -- Wire transfer
    'check',      -- Check payment
    'other'       -- Other payment method
  )),

  -- External references
  payment_provider_id text, -- Stripe payment intent ID, PayPal transaction ID, etc.
  invoice_number text,

  -- Additional details
  description text,
  notes text, -- Internal notes for manual transactions
  metadata jsonb DEFAULT '{}'::jsonb,

  -- Timestamps
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_payment_transactions_business ON public.payment_transactions(business_id);
CREATE INDEX idx_payment_transactions_subscription ON public.payment_transactions(subscription_id);
CREATE INDEX idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX idx_payment_transactions_payment_provider ON public.payment_transactions(payment_provider_id);
CREATE INDEX idx_payment_transactions_created ON public.payment_transactions(created_at DESC);

-- =====================================================
-- 5. UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_billing_plans
  BEFORE UPDATE ON public.billing_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_business_subscriptions
  BEFORE UPDATE ON public.business_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_usage_records
  BEFORE UPDATE ON public.usage_records
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_payment_transactions
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Billing Plans: Anyone can read active public plans
CREATE POLICY "Anyone can view active public billing plans"
  ON public.billing_plans
  FOR SELECT
  USING (is_active = true AND is_public = true);

-- Business Subscriptions: Team members can view their business subscription
CREATE POLICY "Team members can view their business subscription"
  ON public.business_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.business_id = business_subscriptions.business_id
        AND team_members.user_id = auth.uid()
    )
  );

-- Usage Records: Team members can view their business usage
CREATE POLICY "Team members can view their business usage"
  ON public.usage_records
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.business_id = usage_records.business_id
        AND team_members.user_id = auth.uid()
    )
  );

-- Payment Transactions: Team members can view their business transactions
CREATE POLICY "Team members can view their business transactions"
  ON public.payment_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.business_id = payment_transactions.business_id
        AND team_members.user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to get current subscription for a business
CREATE OR REPLACE FUNCTION public.get_business_subscription(p_business_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_id uuid,
  plan_name text,
  plan_display_name text,
  status text,
  limits jsonb,
  features jsonb,
  current_period_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bs.id as subscription_id,
    bp.id as plan_id,
    bp.name as plan_name,
    bp.display_name as plan_display_name,
    bs.status,
    bp.limits,
    bp.features,
    bs.current_period_end
  FROM public.business_subscriptions bs
  JOIN public.billing_plans bp ON bs.plan_id = bp.id
  WHERE bs.business_id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if business has exceeded usage limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_business_id uuid,
  p_limit_key text
)
RETURNS TABLE (
  current_usage numeric,
  limit_value numeric,
  is_exceeded boolean
) AS $$
DECLARE
  v_subscription record;
  v_usage record;
  v_current_usage numeric;
  v_limit_value numeric;
BEGIN
  -- Get subscription and plan limits
  SELECT * INTO v_subscription
  FROM public.get_business_subscription(p_business_id)
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active subscription found for business';
  END IF;

  -- Get current period usage
  SELECT * INTO v_usage
  FROM public.usage_records
  WHERE business_id = p_business_id
    AND period_start <= now()
    AND period_end >= now()
  ORDER BY created_at DESC
  LIMIT 1;

  -- Extract values from JSONB
  v_current_usage := COALESCE((v_usage.usage_data->>p_limit_key)::numeric, 0);
  v_limit_value := COALESCE((v_subscription.limits->>p_limit_key)::numeric, 999999);

  -- Return result
  RETURN QUERY SELECT
    v_current_usage as current_usage,
    v_limit_value as limit_value,
    v_current_usage >= v_limit_value as is_exceeded;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_business_id uuid,
  p_usage_key text,
  p_increment numeric DEFAULT 1
)
RETURNS void AS $$
DECLARE
  v_subscription record;
  v_period_start timestamptz;
  v_period_end timestamptz;
BEGIN
  -- Get subscription period
  SELECT current_period_start, current_period_end
  INTO v_subscription
  FROM public.business_subscriptions
  WHERE business_id = p_business_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active subscription found for business';
  END IF;

  v_period_start := v_subscription.current_period_start;
  v_period_end := v_subscription.current_period_end;

  -- Insert or update usage record
  INSERT INTO public.usage_records (business_id, period_start, period_end, usage_data)
  VALUES (
    p_business_id,
    v_period_start,
    v_period_end,
    jsonb_build_object(p_usage_key, p_increment)
  )
  ON CONFLICT (business_id, period_start, period_end)
  DO UPDATE SET
    usage_data = jsonb_set(
      public.usage_records.usage_data,
      ARRAY[p_usage_key],
      to_jsonb(COALESCE((public.usage_records.usage_data->>p_usage_key)::numeric, 0) + p_increment)
    ),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. SEED DATA - DEFAULT BILLING PLANS
-- =====================================================

INSERT INTO public.billing_plans (name, display_name, description, price_monthly, price_yearly, limits, features, sort_order)
VALUES
  -- Free Plan
  (
    'free',
    'Free',
    'Perfect for trying out the platform',
    0, -- $0/month
    0, -- $0/year
    '{
      "agents": 1,
      "contacts": 100,
      "calls_per_month": 50,
      "team_members": 1,
      "campaigns": 2,
      "integrations": 1,
      "storage_gb": 1,
      "api_requests_per_day": 100
    }'::jsonb,
    '{
      "advanced_analytics": false,
      "custom_branding": false,
      "api_access": false,
      "sso": false,
      "dedicated_support": false,
      "custom_voice_cloning": false,
      "priority_support": false
    }'::jsonb,
    1
  ),

  -- Starter Plan
  (
    'starter',
    'Starter',
    'Great for small teams getting started',
    4900, -- $49/month
    47040, -- $470.40/year (20% discount)
    '{
      "agents": 3,
      "contacts": 1000,
      "calls_per_month": 500,
      "team_members": 3,
      "campaigns": 10,
      "integrations": 3,
      "storage_gb": 10,
      "api_requests_per_day": 1000
    }'::jsonb,
    '{
      "advanced_analytics": true,
      "custom_branding": false,
      "api_access": true,
      "sso": false,
      "dedicated_support": false,
      "custom_voice_cloning": false,
      "priority_support": false
    }'::jsonb,
    2
  ),

  -- Professional Plan
  (
    'professional',
    'Professional',
    'For growing organizations with advanced needs',
    14900, -- $149/month
    143040, -- $1430.40/year (20% discount)
    '{
      "agents": 10,
      "contacts": 10000,
      "calls_per_month": 5000,
      "team_members": 10,
      "campaigns": 50,
      "integrations": 999,
      "storage_gb": 100,
      "api_requests_per_day": 10000
    }'::jsonb,
    '{
      "advanced_analytics": true,
      "custom_branding": true,
      "api_access": true,
      "sso": false,
      "dedicated_support": false,
      "custom_voice_cloning": true,
      "priority_support": true
    }'::jsonb,
    3
  ),

  -- Enterprise Plan
  (
    'enterprise',
    'Enterprise',
    'Custom solutions for large organizations',
    0, -- Custom pricing
    0, -- Custom pricing
    '{
      "agents": 999999,
      "contacts": 999999,
      "calls_per_month": 999999,
      "team_members": 999999,
      "campaigns": 999999,
      "integrations": 999999,
      "storage_gb": 999999,
      "api_requests_per_day": 999999
    }'::jsonb,
    '{
      "advanced_analytics": true,
      "custom_branding": true,
      "api_access": true,
      "sso": true,
      "dedicated_support": true,
      "custom_voice_cloning": true,
      "priority_support": true
    }'::jsonb,
    4
  )
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 9. ASSIGN FREE PLAN TO EXISTING BUSINESSES
-- =====================================================

-- Get the free plan ID
DO $$
DECLARE
  v_free_plan_id uuid;
BEGIN
  SELECT id INTO v_free_plan_id
  FROM public.billing_plans
  WHERE name = 'free';

  -- Assign free plan to all businesses without a subscription
  INSERT INTO public.business_subscriptions (
    business_id,
    plan_id,
    status,
    billing_cycle,
    current_period_start,
    current_period_end
  )
  SELECT
    b.id,
    v_free_plan_id,
    'active',
    'monthly',
    now(),
    now() + interval '1 month'
  FROM public.businesses b
  WHERE NOT EXISTS (
    SELECT 1 FROM public.business_subscriptions
    WHERE business_id = b.id
  );
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run: pnpm supabase:typegen
-- 2. Create usage enforcement middleware
-- 3. Add billing UI to settings
-- 4. Integrate Stripe/PayPal when ready
-- =====================================================
