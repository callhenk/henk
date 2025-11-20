/**
 * Usage Enforcement Middleware
 *
 * This module provides server-side utilities for enforcing usage limits
 * based on the business's subscription plan.
 *
 * Usage:
 * - Import these functions in API routes or server actions
 * - Call before performing the action to check if it's allowed
 * - Increment usage after successful action completion
 */
import { getSupabaseServerClient } from '~/lib/supabase/server';

/**
 * Error thrown when a usage limit is exceeded
 */
export class UsageLimitExceededError extends Error {
  constructor(
    public limitKey: string,
    public currentUsage: number,
    public limit: number,
  ) {
    super(
      `Usage limit exceeded for ${limitKey}. Current: ${currentUsage}, Limit: ${limit}`,
    );
    this.name = 'UsageLimitExceededError';
  }
}

/**
 * Check if a business can perform an action based on usage limits
 *
 * @param businessId - The business ID to check
 * @param limitKey - The limit key to check (e.g., 'agents', 'contacts', 'calls_per_month')
 * @param increment - How much the action will increment the usage (default: 1)
 * @returns Promise<{canPerform: boolean, currentUsage: number, limit: number, reason?: string}>
 */
export async function checkUsageLimit(
  businessId: string,
  limitKey: string,
  increment: number = 1,
): Promise<{
  canPerform: boolean;
  currentUsage: number;
  limit: number;
  reason?: string;
}> {
  const supabase = getSupabaseServerClient();

  // Get subscription and plan
  const { data: subscription, error: subError } = await supabase
    .from('business_subscriptions')
    .select(
      `
      *,
      plan:billing_plans(*)
    `,
    )
    .eq('business_id', businessId)
    .single();

  if (subError || !subscription) {
    throw new Error('No active subscription found for business');
  }

  const limit =
    ((subscription.plan.limits as Record<string, unknown>)?.[
      limitKey
    ] as number) ?? 999999;

  // Get current usage
  const { data: usage, error: usageError } = await supabase
    .from('usage_records')
    .select('*')
    .eq('business_id', businessId)
    .eq('period_start', subscription.current_period_start)
    .eq('period_end', subscription.current_period_end)
    .single();

  // If no usage record exists yet, current usage is 0
  const currentUsage = usageError
    ? 0
    : (((usage?.usage_data as Record<string, unknown>)?.[limitKey] as number) ??
      0);

  const canPerform = currentUsage + increment <= limit;
  const reason = canPerform
    ? undefined
    : `You have reached your ${limitKey} limit of ${limit}. Please upgrade your plan to continue.`;

  return {
    canPerform,
    currentUsage,
    limit,
    reason,
  };
}

/**
 * Enforce a usage limit - throws error if limit is exceeded
 *
 * @param businessId - The business ID to check
 * @param limitKey - The limit key to check
 * @param increment - How much the action will increment the usage (default: 1)
 * @throws UsageLimitExceededError if limit is exceeded
 */
export async function enforceUsageLimit(
  businessId: string,
  limitKey: string,
  increment: number = 1,
): Promise<void> {
  const result = await checkUsageLimit(businessId, limitKey, increment);

  if (!result.canPerform) {
    throw new UsageLimitExceededError(
      limitKey,
      result.currentUsage,
      result.limit,
    );
  }
}

/**
 * Increment usage after a successful action
 *
 * @param businessId - The business ID
 * @param limitKey - The limit key to increment
 * @param increment - How much to increment (default: 1)
 */
export async function incrementUsage(
  businessId: string,
  limitKey: string,
  increment: number = 1,
): Promise<void> {
  const supabase = getSupabaseServerClient();

  const { error } = await supabase.rpc('increment_usage', {
    p_business_id: businessId,
    p_usage_key: limitKey,
    p_increment: increment,
  });

  if (error) {
    console.error('Failed to increment usage:', error);
    throw new Error(`Failed to increment usage: ${error.message}`);
  }
}

/**
 * Set usage to an exact value (useful for syncing counts)
 *
 * @param businessId - The business ID
 * @param limitKey - The limit key to set
 * @param value - The exact value to set
 */
export async function setUsage(
  businessId: string,
  limitKey: string,
  value: number,
): Promise<void> {
  const supabase = getSupabaseServerClient();

  // Get subscription period
  const { data: subscription } = await supabase
    .from('business_subscriptions')
    .select('current_period_start, current_period_end')
    .eq('business_id', businessId)
    .single();

  if (!subscription) {
    throw new Error('No subscription found');
  }

  // Get or create usage record
  const { data: existingUsage } = await supabase
    .from('usage_records')
    .select('*')
    .eq('business_id', businessId)
    .eq('period_start', subscription.current_period_start)
    .eq('period_end', subscription.current_period_end)
    .single();

  const updatedUsageData = {
    ...((existingUsage?.usage_data as Record<string, number>) || {}),
    [limitKey]: value,
  };

  if (existingUsage) {
    // Update existing
    const { error } = await supabase
      .from('usage_records')
      .update({
        usage_data: updatedUsageData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingUsage.id);

    if (error) {
      throw new Error(`Failed to update usage: ${error.message}`);
    }
  } else {
    // Create new
    const { error } = await supabase.from('usage_records').insert({
      business_id: businessId,
      period_start: subscription.current_period_start,
      period_end: subscription.current_period_end,
      usage_data: updatedUsageData,
    });

    if (error) {
      throw new Error(`Failed to create usage record: ${error.message}`);
    }
  }
}

/**
 * Get current usage for a specific limit
 *
 * @param businessId - The business ID
 * @param limitKey - The limit key to check
 * @returns Current usage value
 */
export async function getCurrentUsage(
  businessId: string,
  limitKey: string,
): Promise<number> {
  const supabase = getSupabaseServerClient();

  const { data: subscription } = await supabase
    .from('business_subscriptions')
    .select('current_period_start, current_period_end')
    .eq('business_id', businessId)
    .single();

  if (!subscription) {
    return 0;
  }

  const { data: usage } = await supabase
    .from('usage_records')
    .select('usage_data')
    .eq('business_id', businessId)
    .eq('period_start', subscription.current_period_start)
    .eq('period_end', subscription.current_period_end)
    .single();

  return (
    ((usage?.usage_data as Record<string, unknown>)?.[limitKey] as number) ?? 0
  );
}

/**
 * Sync usage with actual database counts
 * This should be called periodically to ensure accuracy
 *
 * @param businessId - The business ID
 */
export async function syncUsageWithActualCounts(
  businessId: string,
): Promise<void> {
  const supabase = getSupabaseServerClient();

  // Count agents
  const { count: agentsCount } = await supabase
    .from('agents')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  // Count leads (contacts)
  const { count: contactsCount } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  // Count team members
  const { count: teamMembersCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'active');

  // Count campaigns
  const { count: campaignsCount } = await supabase
    .from('campaigns')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId);

  // Count integrations
  const { count: integrationsCount } = await supabase
    .from('integrations')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'active');

  // Update all usage metrics
  if (agentsCount !== null) await setUsage(businessId, 'agents', agentsCount);
  if (contactsCount !== null)
    await setUsage(businessId, 'contacts', contactsCount);
  if (teamMembersCount !== null)
    await setUsage(businessId, 'team_members', teamMembersCount);
  if (campaignsCount !== null)
    await setUsage(businessId, 'campaigns', campaignsCount);
  if (integrationsCount !== null)
    await setUsage(businessId, 'integrations', integrationsCount);
}

/**
 * Check if a feature is available on the business's plan
 *
 * @param businessId - The business ID
 * @param featureKey - The feature key to check
 * @returns Whether the feature is available
 */
export async function hasFeature(
  businessId: string,
  featureKey: string,
): Promise<boolean> {
  const supabase = getSupabaseServerClient();

  const { data: subscription } = await supabase
    .from('business_subscriptions')
    .select(
      `
      plan:billing_plans(features)
    `,
    )
    .eq('business_id', businessId)
    .single();

  if (!subscription?.plan || !subscription.plan.features) {
    return false;
  }

  return (
    ((subscription.plan.features as Record<string, unknown>)?.[
      featureKey
    ] as boolean) === true
  );
}
