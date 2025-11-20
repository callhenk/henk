/**
 * Test Database Setup Utilities
 *
 * Provides helpers for setting up test data with specific billing plans
 * and usage limits for E2E testing.
 */
import { createClient } from '@supabase/supabase-js';

// Supabase local development defaults
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

export const getTestSupabaseClient = () => {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required. ' +
        'Make sure Supabase is running locally with: pnpm supabase:start',
    );
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

/**
 * Verify billing tables exist in database
 */
export async function verifyBillingTablesExist(): Promise<boolean> {
  const supabase = getTestSupabaseClient();

  try {
    // Check if billing_plans table exists
    const { error: plansError } = await supabase
      .from('billing_plans')
      .select('id')
      .limit(1);

    // Check if business_subscriptions table exists
    const { error: subscriptionsError } = await supabase
      .from('business_subscriptions')
      .select('id')
      .limit(1);

    // Check if usage_records table exists
    const { error: usageError } = await supabase
      .from('usage_records')
      .select('id')
      .limit(1);

    // All queries should work (errors only if table doesn't exist)
    return !plansError && !subscriptionsError && !usageError;
  } catch (error) {
    console.error('Billing tables verification failed:', error);
    return false;
  }
}

/**
 * Get or create default free plan for testing
 */
export async function getOrCreateDefaultPlan() {
  const supabase = getTestSupabaseClient();

  // Try to get existing free plan
  const { data: existingPlan } = await supabase
    .from('billing_plans')
    .select('*')
    .eq('name', 'free')
    .single();

  if (existingPlan) {
    return existingPlan;
  }

  // Create default free plan
  const { data: newPlan, error } = await supabase
    .from('billing_plans')
    .insert({
      name: 'free',
      display_name: 'Free',
      description: 'Free plan for testing',
      price_monthly: 0,
      price_yearly: 0,
      limits: {
        agents: 3,
        campaigns: 5,
        contacts: 100,
        team_members: 3,
      },
      features: {
        workflows: true,
        analytics: true,
        integrations: false,
      },
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create default plan: ${error.message}`);
  }

  return newPlan;
}

/**
 * Create a test user with a business and specific billing plan
 */
export async function createTestUserWithLimitedPlan(params: {
  email: string;
  password: string;
  businessName: string;
  planLimits: {
    agents?: number;
    campaigns?: number;
    contacts?: number;
    team_members?: number;
  };
}) {
  const supabase = getTestSupabaseClient();

  // Create user
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: params.email,
      password: params.password,
      email_confirm: true,
    });

  if (authError) {
    throw new Error(`Failed to create test user: ${authError.message}`);
  }

  const userId = authData.user.id;

  // Create account first (required for business)
  // Use unique email to avoid conflicts when running tests in parallel
  const accountEmail = `account-${Date.now()}-${Math.random().toString(36).substring(7)}@test.com`;
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .insert({
      name: params.businessName,
      email: accountEmail,
    })
    .select()
    .single();

  if (accountError) {
    throw new Error(`Failed to create account: ${accountError.message}`);
  }

  // Create business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .insert({
      name: params.businessName,
      account_id: account.id,
    })
    .select()
    .single();

  if (businessError) {
    throw new Error(`Failed to create business: ${businessError.message}`);
  }

  // Add user to business
  const { error: teamError } = await supabase.from('team_members').insert({
    user_id: userId,
    business_id: business.id,
    role: 'owner',
    status: 'active',
  });

  if (teamError) {
    throw new Error(`Failed to add user to business: ${teamError.message}`);
  }

  // Create a custom billing plan for testing
  // Use unique name with random string to avoid conflicts in parallel tests
  const planName = `e2e-test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const { data: plan, error: planError } = await supabase
    .from('billing_plans')
    .insert({
      name: planName,
      display_name: 'E2E Test Plan',
      description: 'Test plan for E2E testing',
      price_monthly: 0,
      price_yearly: 0,
      limits: params.planLimits,
      features: {
        workflows: true,
        analytics: true,
        integrations: true,
      },
    })
    .select()
    .single();

  if (planError) {
    throw new Error(`Failed to create billing plan: ${planError.message}`);
  }

  // Create subscription for the business
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { error: subscriptionError } = await supabase
    .from('business_subscriptions')
    .insert({
      business_id: business.id,
      plan_id: plan.id,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    });

  if (subscriptionError) {
    throw new Error(
      `Failed to create subscription: ${subscriptionError.message}`,
    );
  }

  // Initialize usage record
  const { error: usageError } = await supabase.from('usage_records').insert({
    business_id: business.id,
    period_start: now.toISOString(),
    period_end: periodEnd.toISOString(),
    usage_data: {
      agents: 0,
      campaigns: 0,
      contacts: 0,
      team_members: 1, // Owner already added
    },
  });

  if (usageError) {
    throw new Error(`Failed to create usage record: ${usageError.message}`);
  }

  return {
    userId,
    businessId: business.id,
    planId: plan.id,
    email: params.email,
  };
}

/**
 * Clean up test user and related data
 */
export async function cleanupTestUser(userId: string) {
  const supabase = getTestSupabaseClient();

  // Get business IDs for the user
  const { data: memberships } = await supabase
    .from('team_members')
    .select('business_id')
    .eq('user_id', userId);

  if (memberships && memberships.length > 0) {
    const businessIds = memberships.map((m) => m.business_id);

    // Get account IDs and plan IDs from businesses and subscriptions
    const { data: businesses } = await supabase
      .from('businesses')
      .select('account_id')
      .in('id', businessIds);

    const { data: subscriptions } = await supabase
      .from('business_subscriptions')
      .select('plan_id')
      .in('business_id', businessIds);

    // Delete usage records
    await supabase
      .from('usage_records')
      .delete()
      .in('business_id', businessIds);

    // Delete subscriptions
    await supabase
      .from('business_subscriptions')
      .delete()
      .in('business_id', businessIds);

    // Delete team members
    await supabase.from('team_members').delete().in('business_id', businessIds);

    // Delete agents, campaigns, leads, etc. (cascade should handle this)
    await supabase.from('agents').delete().in('business_id', businessIds);
    await supabase.from('campaigns').delete().in('business_id', businessIds);
    await supabase.from('leads').delete().in('business_id', businessIds);

    // Delete businesses
    await supabase.from('businesses').delete().in('id', businessIds);

    // Delete accounts
    if (businesses && businesses.length > 0) {
      const accountIds = businesses.map((b) => b.account_id).filter(Boolean);
      if (accountIds.length > 0) {
        await supabase.from('accounts').delete().in('id', accountIds);
      }
    }

    // Delete test billing plans (only delete E2E test plans to avoid affecting real data)
    if (subscriptions && subscriptions.length > 0) {
      const planIds = subscriptions.map((s) => s.plan_id).filter(Boolean);
      if (planIds.length > 0) {
        // Only delete plans that start with 'e2e-test-'
        await supabase
          .from('billing_plans')
          .delete()
          .in('id', planIds)
          .like('name', 'e2e-test-%');
      }
    }
  }

  // Delete user
  await supabase.auth.admin.deleteUser(userId);
}

/**
 * Get current usage for a business
 */
export async function getCurrentUsage(businessId: string) {
  const supabase = getTestSupabaseClient();

  const { data: subscription } = await supabase
    .from('business_subscriptions')
    .select('current_period_start, current_period_end')
    .eq('business_id', businessId)
    .single();

  if (!subscription) {
    return null;
  }

  const { data: usage } = await supabase
    .from('usage_records')
    .select('usage_data')
    .eq('business_id', businessId)
    .eq('period_start', subscription.current_period_start)
    .eq('period_end', subscription.current_period_end)
    .single();

  return usage?.usage_data as Record<string, number> | null;
}

/**
 * Sync usage with actual counts in database
 */
export async function syncUsageForBusiness(businessId: string) {
  const supabase = getTestSupabaseClient();

  const { error } = await supabase.rpc('sync_usage_with_counts', {
    p_business_id: businessId,
  });

  if (error) {
    console.warn('Failed to sync usage:', error);
  }
}
