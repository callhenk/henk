'use client';

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '../use-supabase';

interface UseNotificationSettingsParams {
  userId: string;
  businessId: string;
}

export function useNotificationSettings({
  userId,
  businessId,
}: UseNotificationSettingsParams) {
  const client = useSupabase();

  const queryKey = ['notification-settings', userId, businessId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await client
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('business_id', businessId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // If no settings exist, create them with defaults
      if (!data) {
        const { data: newSettings, error: createError } = await client
          .from('notification_settings')
          .insert({
            user_id: userId,
            business_id: businessId,
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        return newSettings;
      }

      return data;
    },
    enabled: !!userId && !!businessId,
  });

  return {
    ...query,
    settings: query.data,
  };
}

export function useNotificationSettingsKey(userId: string, businessId: string) {
  return ['notification-settings', userId, businessId] as const;
}
