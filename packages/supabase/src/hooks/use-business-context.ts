import { useQuery } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

export interface BusinessContext {
  business_id: string;
  user_id: string;
  role: string;
  status: string;
}

export function useBusinessContext() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['business-context'],
    queryFn: async (): Promise<BusinessContext | null> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return null;
      }

      // Get the user's active business membership
      const { data: teamMembership, error } = await supabase
        .from('team_members')
        .select('business_id, user_id, role, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (error || !teamMembership) {
        return null;
      }

      return {
        business_id: teamMembership.business_id,
        user_id: teamMembership.user_id,
        role: teamMembership.role,
        status: teamMembership.status,
      };
    },
  });
}

export function useBusinessId() {
  const { data: businessContext } = useBusinessContext();
  return businessContext?.business_id;
}
