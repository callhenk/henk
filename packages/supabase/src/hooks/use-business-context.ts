import { useQuery } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

export interface BusinessContext {
  business_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'inactive';
  user_id: string;
}

/**
 * @name useBusinessContext
 * @description Get the current user's business context (business_id, role, status)
 * This is used to ensure all data queries are properly scoped to the user's business
 */
export function useBusinessContext() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['business-context'],
    queryFn: async (): Promise<BusinessContext | null> => {
      // Get authenticated user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        return null;
      }

      // Get user's active business membership
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select('business_id, user_id, role, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (teamError || !teamMember) {
        return null;
      }

      return {
        business_id: teamMember.business_id,
        role: teamMember.role as BusinessContext['role'],
        status: teamMember.status as BusinessContext['status'],
        user_id: teamMember.user_id,
      };
    },
    // Don't refetch on every window focus to avoid unnecessary API calls
    refetchOnWindowFocus: false,
    // Keep the data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });
}
