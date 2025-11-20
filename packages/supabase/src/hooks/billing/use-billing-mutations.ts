import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';
import type { BusinessSubscription } from './use-business-subscription';

/**
 * Data for changing a business's subscription plan
 */
export interface ChangePlanData {
  plan_id: string;
  billing_cycle?: 'monthly' | 'yearly';
  notes?: string;
}

/**
 * Data for updating subscription status
 */
export interface UpdateSubscriptionStatusData {
  status:
    | 'active'
    | 'trial'
    | 'past_due'
    | 'canceled'
    | 'expired'
    | 'suspended';
  notes?: string;
}

/**
 * Data for recording a payment transaction
 */
export interface RecordPaymentData {
  subscription_id: string;
  amount: number;
  currency?: string;
  payment_method: 'manual' | 'stripe' | 'paypal' | 'wire' | 'check' | 'other';
  payment_provider_id?: string;
  invoice_number?: string;
  description?: string;
  notes?: string;
}

/**
 * Hook to change the business's subscription plan
 * This is typically used for manual plan changes by admins
 */
export function useChangePlan() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: businessContext } = useBusinessContext();

  return useMutation({
    mutationFn: async (data: ChangePlanData): Promise<BusinessSubscription> => {
      if (!businessContext?.business_id) {
        throw new Error('No business context available');
      }

      // Check if subscription exists
      const { data: existingSubscription } = await supabase
        .from('business_subscriptions')
        .select('id')
        .eq('business_id', businessContext.business_id)
        .single();

      if (existingSubscription) {
        // Update existing subscription
        const { data: subscription, error } = await supabase
          .from('business_subscriptions')
          .update({
            plan_id: data.plan_id,
            billing_cycle: data.billing_cycle || 'monthly',
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('business_id', businessContext.business_id)
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to update subscription: ${error.message}`);
        }

        return subscription as BusinessSubscription;
      } else {
        // Create new subscription
        const { data: subscription, error } = await supabase
          .from('business_subscriptions')
          .insert({
            business_id: businessContext.business_id,
            plan_id: data.plan_id,
            billing_cycle: data.billing_cycle || 'monthly',
            status: 'active',
            notes: data.notes,
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000,
            ).toISOString(), // 30 days from now
          })
          .select()
          .single();

        if (error) {
          throw new Error(`Failed to create subscription: ${error.message}`);
        }

        return subscription as BusinessSubscription;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['business-subscription', businessContext?.business_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['usage-limits', businessContext?.business_id],
      });
    },
  });
}

/**
 * Hook to update subscription status
 * This is typically used for manual status changes by admins
 */
export function useUpdateSubscriptionStatus() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: businessContext } = useBusinessContext();

  return useMutation({
    mutationFn: async (
      data: UpdateSubscriptionStatusData,
    ): Promise<BusinessSubscription> => {
      if (!businessContext?.business_id) {
        throw new Error('No business context available');
      }

      const updateData: {
        status: string;
        notes?: string;
        updated_at: string;
        canceled_at?: string;
      } = {
        status: data.status,
        notes: data.notes,
        updated_at: new Date().toISOString(),
      };

      // If canceling, set canceled_at
      if (data.status === 'canceled') {
        updateData.canceled_at = new Date().toISOString();
      }

      const { data: subscription, error } = await supabase
        .from('business_subscriptions')
        .update(updateData)
        .eq('business_id', businessContext.business_id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to update subscription status: ${error.message}`,
        );
      }

      return subscription as BusinessSubscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['business-subscription', businessContext?.business_id],
      });
    },
  });
}

/**
 * Hook to cancel subscription at period end
 * This allows the user to continue using the service until the end of the billing period
 */
export function useCancelSubscriptionAtPeriodEnd() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: businessContext } = useBusinessContext();

  return useMutation({
    mutationFn: async (cancel: boolean): Promise<BusinessSubscription> => {
      if (!businessContext?.business_id) {
        throw new Error('No business context available');
      }

      const { data: subscription, error } = await supabase
        .from('business_subscriptions')
        .update({
          cancel_at_period_end: cancel,
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessContext.business_id)
        .select()
        .single();

      if (error) {
        throw new Error(
          `Failed to update subscription cancellation: ${error.message}`,
        );
      }

      return subscription as BusinessSubscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['business-subscription', businessContext?.business_id],
      });
    },
  });
}

/**
 * Hook to record a payment transaction
 * This is used for manual billing to record payments made outside the system
 */
export function useRecordPayment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: businessContext } = useBusinessContext();

  return useMutation({
    mutationFn: async (data: RecordPaymentData) => {
      if (!businessContext?.business_id) {
        throw new Error('No business context available');
      }

      const { data: transaction, error } = await supabase
        .from('payment_transactions')
        .insert({
          business_id: businessContext.business_id,
          subscription_id: data.subscription_id,
          amount: data.amount,
          currency: data.currency || 'USD',
          payment_method: data.payment_method,
          payment_provider_id: data.payment_provider_id,
          invoice_number: data.invoice_number,
          description: data.description,
          notes: data.notes,
          status: 'completed',
          paid_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to record payment: ${error.message}`);
      }

      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['payment-transactions', businessContext?.business_id],
      });
      queryClient.invalidateQueries({
        queryKey: ['business-subscription', businessContext?.business_id],
      });
    },
  });
}

/**
 * Hook to extend the current billing period
 * Useful for manual billing to extend a subscription
 */
export function useExtendBillingPeriod() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { data: businessContext } = useBusinessContext();

  return useMutation({
    mutationFn: async (days: number): Promise<BusinessSubscription> => {
      if (!businessContext?.business_id) {
        throw new Error('No business context available');
      }

      // Get current subscription
      const { data: subscription } = await supabase
        .from('business_subscriptions')
        .select('current_period_end')
        .eq('business_id', businessContext.business_id)
        .single();

      if (!subscription) {
        throw new Error('No subscription found');
      }

      // Extend period by specified days
      const currentEnd = new Date(subscription.current_period_end);
      const newEnd = new Date(
        currentEnd.getTime() + days * 24 * 60 * 60 * 1000,
      );

      const { data: updatedSubscription, error } = await supabase
        .from('business_subscriptions')
        .update({
          current_period_end: newEnd.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('business_id', businessContext.business_id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to extend billing period: ${error.message}`);
      }

      return updatedSubscription as BusinessSubscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['business-subscription', businessContext?.business_id],
      });
    },
  });
}
