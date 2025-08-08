import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

export function usePersonalAccountData(
  userId: string,
  partialAccount?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  },
) {
  const client = useSupabase();
  const queryKey = ['account:data', userId];

  const queryFn = async () => {
    if (!userId) {
      return null;
    }

    try {
      const response = await client
        .from('accounts')
        .select(
          `
          id,
          name,
          picture_url
      `,
        )
        .eq('id', userId)
        .single();

      if (response.error) {
        throw response.error;
      }

      // If we have a picture_url, check if it's expired and refresh it
      if (response.data?.picture_url) {
        try {
          // Test if the current URL is accessible
          const testResponse = await fetch(response.data.picture_url, {
            method: 'HEAD',
          });

          if (!testResponse.ok) {
            // Extract the file path from the signed URL
            const signedUrl = response.data.picture_url;
            const urlParts = signedUrl?.split('?')[0];
            const fileName = urlParts?.split('/').pop();

            if (fileName) {
              // Generate a new signed URL
              const { data: signedUrlData, error: signedUrlError } =
                await client.storage
                  .from('account_image')
                  .createSignedUrl(fileName, 3600); // 1 hour

              if (!signedUrlError && signedUrlData) {
                // Update the account with the new signed URL
                await client
                  .from('accounts')
                  .update({ picture_url: signedUrlData.signedUrl })
                  .eq('id', userId);

                // Return the updated data with the new signed URL
                return {
                  ...response.data,
                  picture_url: signedUrlData.signedUrl,
                };
              }
            }
          }
        } catch {
          // If the URL test fails, assume it's expired and refresh it
          const signedUrl = response.data.picture_url;
          const urlParts = signedUrl?.split('?')[0];
          const fileName = urlParts?.split('/').pop();

          if (fileName) {
            // Generate a new signed URL
            const { data: signedUrlData, error: signedUrlError } =
              await client.storage
                .from('account_image')
                .createSignedUrl(fileName, 3600); // 1 hour

            if (!signedUrlError && signedUrlData) {
              // Update the account with the new signed URL
              await client
                .from('accounts')
                .update({ picture_url: signedUrlData.signedUrl })
                .eq('id', userId);

              // Return the updated data with the new signed URL
              return {
                ...response.data,
                picture_url: signedUrlData.signedUrl,
              };
            }
          }
        }
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching account data:', error);

      // If it's a JWT error, try to refresh the session
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('InvalidJWT')
      ) {
        console.log('JWT expired, attempting to refresh session...');

        const {
          data: { session },
          error: refreshError,
        } = await client.auth.refreshSession();

        if (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          throw refreshError;
        }

        if (session) {
          console.log('Session refreshed, retrying query...');
          // Retry the query with the refreshed session
          const retryResponse = await client
            .from('accounts')
            .select('id, name, picture_url')
            .eq('id', userId)
            .single();

          if (retryResponse.error) {
            throw retryResponse.error;
          }

          return retryResponse.data;
        }
      }

      throw error;
    }
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled: !!userId,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    initialData: partialAccount?.id
      ? {
          id: partialAccount.id,
          name: partialAccount.name,
          picture_url: partialAccount.picture_url,
        }
      : undefined,
  });
}

export function useRevalidatePersonalAccountDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) =>
      queryClient.invalidateQueries({
        queryKey: ['account:data', userId],
      }),
    [queryClient],
  );
}

export function useRefetchSignedUrl() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useCallback(
    async (userId: string) => {
      if (!userId) return null;

      try {
        // Get the current account data
        const response = await client
          .from('accounts')
          .select('picture_url')
          .eq('id', userId)
          .single();

        if (response.error || !response.data?.picture_url) {
          return null;
        }

        // Extract the file path from the signed URL
        const signedUrl = response.data.picture_url;
        const urlParts = signedUrl?.split('?')[0];
        const fileName = urlParts?.split('/').pop();

        if (!fileName) {
          return null;
        }

        // Generate a new signed URL
        const { data: signedUrlData, error: signedUrlError } =
          await client.storage
            .from('account_image')
            .createSignedUrl(fileName, 3600); // 1 hour

        if (signedUrlError) {
          throw signedUrlError;
        }

        // Update the account with the new signed URL
        await client
          .from('accounts')
          .update({ picture_url: signedUrlData.signedUrl })
          .eq('id', userId);

        // Invalidate the query to refetch the updated data
        await queryClient.invalidateQueries({
          queryKey: ['account:data', userId],
        });

        return signedUrlData.signedUrl;
      } catch (error) {
        console.error('Error refetching signed URL:', error);
        return null;
      }
    },
    [client, queryClient],
  );
}
