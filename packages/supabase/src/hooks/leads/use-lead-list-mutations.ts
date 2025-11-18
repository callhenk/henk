import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '../../database.types';
import { useSupabase } from '../use-supabase';

type LeadList = Tables<'lead_lists'>;
type CreateLeadListData = TablesInsert<'lead_lists'>;
type UpdateLeadListData = TablesUpdate<'lead_lists'> & { id: string };
type CreateLeadListMemberData = TablesInsert<'lead_list_members'>;

/**
 * Create a new lead list
 */
export function useCreateLeadList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadListData) => {
      const { data: leadList, error } = await supabase
        .from('lead_lists')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create lead list: ${error.message}`);
      }

      return { data: leadList };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
    },
  });
}

/**
 * Update a lead list
 */
export function useUpdateLeadList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLeadListData): Promise<LeadList> => {
      const { id, ...updateData } = data;

      const { data: leadList, error } = await supabase
        .from('lead_lists')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update lead list: ${error.message}`);
      }

      return leadList;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({ queryKey: ['lead-list', data.id] });
    },
  });
}

/**
 * Delete a lead list
 */
export function useDeleteLeadList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('lead_lists').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete lead list: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
    },
  });
}

/**
 * Add a lead to a list
 */
export function useAddLeadToList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadListMemberData): Promise<void> => {
      const { error } = await supabase.from('lead_list_members').insert(data);

      if (error) {
        throw new Error(`Failed to add lead to list: ${error.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({
        queryKey: ['lead-list-members', variables.lead_list_id],
      });
    },
  });
}

/**
 * Remove a lead from a list
 */
export function useRemoveLeadFromList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      lead_list_id: string;
      lead_id: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('lead_list_members')
        .delete()
        .eq('lead_list_id', data.lead_list_id)
        .eq('lead_id', data.lead_id);

      if (error) {
        throw new Error(`Failed to remove lead from list: ${error.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({
        queryKey: ['lead-list-members', variables.lead_list_id],
      });
    },
  });
}

/**
 * Create a lead list from CSV data
 */
export function useCreateLeadListFromCSV() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      business_id: string;
      name: string;
      description?: string;
      leads: Array<{
        first_name: string;
        last_name?: string;
        email?: string;
        phone?: string;
        company?: string;
        [key: string]: unknown;
      }>;
    }) => {
      const { data: result, error } = await supabase.rpc(
        'create_lead_list_from_csv',
        {
          p_business_id: data.business_id,
          p_list_name: data.name,
          p_leads: data.leads as unknown as Json,
        },
      );

      if (error) {
        throw new Error(
          `Failed to create lead list from CSV: ${error.message}`,
        );
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
