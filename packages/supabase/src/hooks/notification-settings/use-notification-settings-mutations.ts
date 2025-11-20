'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Database } from '../../database.types';
import { useSupabase } from '../use-supabase';
import { useNotificationSettingsKey } from './use-notification-settings';

type NotificationSettingsUpdate =
  Database['public']['Tables']['notification_settings']['Update'];

interface UpdateNotificationSettingsParams {
  userId: string;
  businessId: string;
  updates: Partial<NotificationSettingsUpdate>;
}

export function useUpdateNotificationSettings() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      businessId,
      updates,
    }: UpdateNotificationSettingsParams) => {
      const { data, error } = await client
        .from('notification_settings')
        .update(updates)
        .eq('user_id', userId)
        .eq('business_id', businessId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch notification settings
      const queryKey = useNotificationSettingsKey(
        variables.userId,
        variables.businessId,
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

interface CreateNotificationSettingsParams {
  userId: string;
  businessId: string;
  settings?: Partial<NotificationSettingsUpdate>;
}

export function useCreateNotificationSettings() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      businessId,
      settings = {},
    }: CreateNotificationSettingsParams) => {
      const { data, error } = await client
        .from('notification_settings')
        .insert({
          user_id: userId,
          business_id: businessId,
          ...settings,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch notification settings
      const queryKey = useNotificationSettingsKey(
        variables.userId,
        variables.businessId,
      );
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
