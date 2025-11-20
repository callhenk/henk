import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../use-supabase';

/**
 * Billing plan structure
 * Note: These types will be auto-generated after running migration
 * For now, we define them manually based on the schema
 */
export interface BillingPlan {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  limits: {
    agents?: number;
    contacts?: number;
    calls_per_month?: number;
    team_members?: number;
    campaigns?: number;
    integrations?: number;
    storage_gb?: number;
    api_requests_per_day?: number;
  };
  features: {
    advanced_analytics?: boolean;
    custom_branding?: boolean;
    api_access?: boolean;
    sso?: boolean;
    dedicated_support?: boolean;
    custom_voice_cloning?: boolean;
    priority_support?: boolean;
  };
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BillingPlansFilters {
  is_active?: boolean;
  is_public?: boolean;
}

/**
 * Hook to fetch all billing plans
 * Typically used on pricing/billing pages
 */
export function useBillingPlans(filters?: BillingPlansFilters) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['billing-plans', filters],
    queryFn: async (): Promise<BillingPlan[]> => {
      let query = supabase
        .from('billing_plans')
        .select('*')
        .order('sort_order', { ascending: true });

      // Apply filters (defaults to active public plans)
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active);
      } else {
        query = query.eq('is_active', true);
      }

      if (filters?.is_public !== undefined) {
        query = query.eq('is_public', filters.is_public);
      } else {
        query = query.eq('is_public', true);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch billing plans: ${error.message}`);
      }

      return (data || []) as BillingPlan[];
    },
  });
}

/**
 * Hook to fetch a single billing plan by ID
 */
export function useBillingPlan(planId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['billing-plan', planId],
    queryFn: async (): Promise<BillingPlan | null> => {
      if (!planId) {
        return null;
      }

      const { data, error } = await supabase
        .from('billing_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch billing plan: ${error.message}`);
      }

      return data as BillingPlan;
    },
    enabled: !!planId,
  });
}

/**
 * Hook to fetch a billing plan by name (e.g., 'free', 'starter', 'professional')
 */
export function useBillingPlanByName(planName: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ['billing-plan-by-name', planName],
    queryFn: async (): Promise<BillingPlan | null> => {
      if (!planName) {
        return null;
      }

      const { data, error } = await supabase
        .from('billing_plans')
        .select('*')
        .eq('name', planName)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch billing plan: ${error.message}`);
      }

      return data as BillingPlan;
    },
    enabled: !!planName,
  });
}
