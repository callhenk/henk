import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Lead = Tables<'leads'>['Row'];
type CreateLeadData = TablesInsert<'leads'>;
type UpdateLeadData = TablesUpdate<'leads'> & { id: string };

export interface BulkCreateLeadsData {
  campaign_id: string;
  leads: Omit<CreateLeadData, 'campaign_id'>[];
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({
        queryKey: ['leads', 'campaign', data.campaign_id],
      });
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
      queryClient.invalidateQueries({
        queryKey: ['leads', 'campaign', data.campaign_id],
      });
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
        campaign_id: data.campaign_id,
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
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['leads'] });
        queryClient.invalidateQueries({
          queryKey: ['leads', 'campaign', data[0]?.campaign_id],
        });
      }
    },
  });
}
