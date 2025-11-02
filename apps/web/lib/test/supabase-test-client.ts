import { createClient } from '@supabase/supabase-js';
import type { Database } from '../database.types';

/**
 * Creates a Supabase client for testing with service role key
 * This bypasses RLS policies for test setup
 */
export function createTestClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.',
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Creates a test user with auto-confirmed email
 */
export async function createTestUser(
  email: string,
  password: string = 'TestPassword123!',
) {
  const supabase = createTestClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm for tests
  });

  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }

  return data.user;
}

/**
 * Creates a test business
 */
export async function createTestBusiness(name: string, accountId?: string) {
  const supabase = createTestClient();

  // Create an account first if not provided
  let finalAccountId = accountId;
  if (!finalAccountId) {
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        name: `${name} Account`,
      })
      .select()
      .single();

    if (accountError) {
      throw new Error(`Failed to create test account: ${accountError.message}`);
    }

    finalAccountId = account.id;
  }

  const { data: business, error } = await supabase
    .from('businesses')
    .insert({
      name,
      account_id: finalAccountId,
      status: 'active',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create test business: ${error.message}`);
  }

  return business;
}

/**
 * Adds a user as a team member to a business
 */
export async function addTeamMember(
  businessId: string,
  userId: string,
  role: 'owner' | 'admin' | 'member' = 'member',
) {
  const supabase = createTestClient();

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      business_id: businessId,
      user_id: userId,
      role,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to add team member: ${error.message}`);
  }

  return data;
}

/**
 * Creates a complete test context: user, business, and team membership
 */
export async function createTestContext(options?: {
  email?: string;
  businessName?: string;
  role?: 'owner' | 'admin' | 'member';
}) {
  const email = options?.email || `test-${Date.now()}@henk.dev`;
  const businessName = options?.businessName || 'Test Business';
  const role = options?.role || 'owner';

  const user = await createTestUser(email);
  const business = await createTestBusiness(businessName);
  const teamMember = await addTeamMember(business.id, user.id, role);

  return {
    user,
    business,
    teamMember,
  };
}

/**
 * Cleans up a test user and all associated data
 */
export async function cleanupTestUser(userId: string) {
  const supabase = createTestClient();

  // Delete user (cascade should handle related data)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error(`Failed to cleanup test user: ${error.message}`);
  }
}

/**
 * Cleans up a test business and all associated data
 */
export async function cleanupTestBusiness(businessId: string) {
  const supabase = createTestClient();

  try {
    // Delete dependent records in correct order to avoid foreign key violations

    // 1. Get conversation IDs for this business
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('business_id', businessId);

    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map((c) => c.id);
      // Delete conversation events
      await supabase
        .from('conversation_events')
        .delete()
        .in('conversation_id', conversationIds);
    }

    // 2. Delete conversations (references agents)
    await supabase
      .from('conversations')
      .delete()
      .eq('business_id', businessId);

    // 3. Get campaign IDs for this business
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id')
      .eq('business_id', businessId);

    if (campaigns && campaigns.length > 0) {
      const campaignIds = campaigns.map((c) => c.id);

      // Delete campaign executions
      await supabase
        .from('campaign_executions')
        .delete()
        .in('campaign_id', campaignIds);

      // Delete campaign queue
      await supabase
        .from('campaign_queue')
        .delete()
        .in('campaign_id', campaignIds);
    }

    // 4. Get lead list IDs for this business
    const { data: leadLists } = await supabase
      .from('lead_lists')
      .select('id')
      .eq('business_id', businessId);

    if (leadLists && leadLists.length > 0) {
      const listIds = leadLists.map((l) => l.id);

      // Delete campaign leads (references lead_lists)
      await supabase
        .from('campaign_leads')
        .delete()
        .in('list_id', listIds);

      // Delete lead list members
      await supabase
        .from('lead_list_members')
        .delete()
        .in('list_id', listIds);
    }

    // 5. Delete lead lists
    await supabase.from('lead_lists').delete().eq('business_id', businessId);

    // 6. Delete leads
    await supabase.from('leads').delete().eq('business_id', businessId);

    // 8. Delete integrations
    await supabase.from('integrations').delete().eq('business_id', businessId);

    // 9. Delete agents
    await supabase.from('agents').delete().eq('business_id', businessId);

    // 10. Delete campaigns
    await supabase.from('campaigns').delete().eq('business_id', businessId);

    // 11. Delete team members
    await supabase.from('team_members').delete().eq('business_id', businessId);

    // 12. Finally, delete the business
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (error) {
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to cleanup test business: ${message}`);
    throw error;
  }
}

/**
 * Signs in a test user and returns the session
 */
export async function signInTestUser(email: string, password: string) {
  const supabase = createTestClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to sign in test user: ${error.message}`);
  }

  return data;
}

/**
 * Gets an auth header for API route testing
 */
export async function getAuthHeader(email: string, password: string) {
  const { session } = await signInTestUser(email, password);

  if (!session) {
    throw new Error('No session returned from sign in');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}
