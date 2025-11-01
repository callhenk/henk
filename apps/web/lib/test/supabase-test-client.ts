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
export async function createTestBusiness(name: string, slug?: string) {
  const supabase = createTestClient();

  const businessSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

  const { data: business, error } = await supabase
    .from('businesses')
    .insert({
      name,
      slug: businessSlug,
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

  // Delete business (cascade should handle related data)
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId);

  if (error) {
    console.error(`Failed to cleanup test business: ${error.message}`);
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
