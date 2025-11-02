import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Lead = Tables<'leads'>;
type CreateLeadData = TablesInsert<'leads'>;
type UpdateLeadData = TablesUpdate<'leads'> & { id: string };
type LeadList = Tables<'lead_lists'>;
type CreateLeadListData = TablesInsert<'lead_lists'>;
type UpdateLeadListData = TablesUpdate<'lead_lists'> & { id: string };
type CreateLeadListMemberData = TablesInsert<'lead_list_members'>;

export interface BulkCreateLeadsData {
  business_id: string;
  leads: Omit<CreateLeadData, 'business_id'>[];
}

export function useCreateLead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadData): Promise<Lead> => {
      const { data: lead, error } = await supabase
        .from('leads')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create lead: ${error.message}`);
      }

      return lead;
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useUpdateLead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateLeadData): Promise<Lead> => {
      const { id, ...updateData } = data;

      const { data: lead, error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update lead: ${error.message}`);
      }

      return lead;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', data.id] });
    },
  });
}

export function useDeleteLead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('leads').delete().eq('id', id);

      if (error) {
        throw new Error(`Failed to delete lead: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useBulkCreateLeads() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BulkCreateLeadsData): Promise<Lead[]> => {
      const leadsData = data.leads.map((lead) => ({
        ...lead,
        business_id: data.business_id,
      }));

      const { data: leads, error } = await supabase
        .from('leads')
        .insert(leadsData)
        .select();

      if (error) {
        throw new Error(`Failed to create leads: ${error.message}`);
      }

      return leads || [];
    },
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

// Lead List Mutations
export function useCreateLeadList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadListData): Promise<LeadList> => {
      const { data: leadList, error } = await supabase
        .from('lead_lists')
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create lead list: ${error.message}`);
      }

      return leadList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
    },
  });
}

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

export function useAddLeadToList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateLeadListMemberData): Promise<void> => {
      const { error } = await supabase
        .from('lead_list_members')
        .insert(data);

      if (error) {
        throw new Error(`Failed to add lead to list: ${error.message}`);
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-lists'] });
      queryClient.invalidateQueries({ queryKey: ['lead-list-members', variables.lead_list_id] });
    },
  });
}

export function useRemoveLeadFromList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { lead_list_id: string; lead_id: string }): Promise<void> => {
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
      queryClient.invalidateQueries({ queryKey: ['lead-list-members', variables.lead_list_id] });
    },
  });
}
