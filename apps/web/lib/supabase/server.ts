import type { Database } from '@kit/supabase/database';
import { getSupabaseServerClient as createSupabaseServerClient } from '@kit/supabase/server-client';

/**
 * @name getSupabaseServerClient
 * @description Get a Supabase client for use in API routes
 */
export function getSupabaseServerClient() {
  return createSupabaseServerClient<Database>();
}
