import type { SupabaseClient, User } from '@supabase/supabase-js';

import { AuthError, ForbiddenError } from './errors';

/**
 * Business context returned from authentication
 */
export interface BusinessContext {
  business_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: string;
  user: User;
}

/**
 * Verify user is authenticated and return user object
 * @throws {AuthError} If user is not authenticated
 */
export async function requireAuth(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthError('Unauthorized');
  }

  return user;
}

/**
 * Get user's business context (business_id, role, status)
 * @throws {ForbiddenError} If user has no active business membership
 */
export async function getBusinessContext(
  supabase: SupabaseClient,
  userId: string,
): Promise<BusinessContext> {
  const { data: teamMember, error } = await supabase
    .from('team_members')
    .select('business_id, role, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error || !teamMember) {
    throw new ForbiddenError('No active business membership found');
  }

  return {
    business_id: teamMember.business_id,
    role: teamMember.role as 'owner' | 'admin' | 'member' | 'viewer',
    status: teamMember.status,
    user: { id: userId } as User,
  };
}

/**
 * Combined authentication and business context retrieval
 * @throws {AuthError} If user is not authenticated
 * @throws {ForbiddenError} If user has no active business membership
 */
export async function requireAuthWithBusiness(
  supabase: SupabaseClient,
): Promise<BusinessContext> {
  const user = await requireAuth(supabase);
  const businessContext = await getBusinessContext(supabase, user.id);

  return {
    ...businessContext,
    user,
  };
}

/**
 * Check if user has required role
 * @throws {ForbiddenError} If user doesn't have required permissions
 */
export function requireRole(
  context: BusinessContext,
  allowedRoles: Array<'owner' | 'admin' | 'member' | 'viewer'>,
): void {
  if (!allowedRoles.includes(context.role)) {
    throw new ForbiddenError(
      `Insufficient permissions. Required role: ${allowedRoles.join(' or ')}`,
    );
  }
}

/**
 * Check if user can write/modify resources (not viewer)
 * @throws {ForbiddenError} If user is a viewer
 */
export function requireWritePermission(context: BusinessContext): void {
  if (context.role === 'viewer') {
    throw new ForbiddenError('Insufficient permissions to modify resources');
  }
}
