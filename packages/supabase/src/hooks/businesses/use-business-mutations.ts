import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Business = Tables<'businesses'>;
type CreateBusinessData = Omit<TablesInsert<'businesses'>, 'account_id'>;
type UpdateBusinessData = TablesUpdate<'businesses'> & { id: string };

export function useCreateBusiness() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBusinessData): Promise<Business> => {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: business, error } = await supabase
        .from('businesses')
        .insert({
          ...data,
          account_id: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create business: ${error.message}`);
      }

      return business;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['user-businesses'] });
    },
  });
}

export function useUpdateBusiness() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateBusinessData): Promise<Business> => {
      const { id, ...updateData } = data;

      const { data: business, error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update business: ${error.message}`);
      }

      return business;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      queryClient.invalidateQueries({ queryKey: ['business', data.id] });
      queryClient.invalidateQueries({ queryKey: ['user-businesses'] });
    },
  });
}

/**
 * @deprecated Business deletion is permanently disabled.
 * This function is kept for type compatibility but will always throw an error.
 * Businesses cannot be deleted - only created and updated.
 */
export function useDeleteBusiness() {
  return useMutation({
    mutationFn: async (_id: string): Promise<void> => {
      throw new Error(
        'Business deletion is disabled. Businesses cannot be deleted from the system. Contact support if you need assistance.',
      );
    },
  });
}
