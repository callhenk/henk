import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { Tables, TablesInsert, TablesUpdate } from '../../database.types';
import { useSupabase } from '../use-supabase';

type Contact = Tables<'contacts'>['Row'];
type ContactList = Tables<'contact_lists'>['Row'];
type CreateContactData = Omit<TablesInsert<'contacts'>, 'business_id'>;
type UpdateContactData = TablesUpdate<'contacts'> & { id: string };
type CreateContactListData = Omit<TablesInsert<'contact_lists'>, 'business_id'>;
type UpdateContactListData = TablesUpdate<'contact_lists'> & { id: string };

export function useCreateContact() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateContactData): Promise<Contact> => {
      // Get the current user's business_id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the user's active business
      const { data: teamMembership } = await supabase
        .from('team_members')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!teamMembership) {
        throw new Error('No active business found for user');
      }

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert({
          ...data,
          business_id: teamMembership.business_id,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create contact: ${error.message}`);
      }

      return contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateContactData): Promise<Contact> => {
      const { id, ...updateData } = data;

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: contact, error } = await supabase
        .from('contacts')
        .update({
          ...updateData,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update contact: ${error.message}`);
      }

      return contact;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', data.id] });
    },
  });
}

export function useDeleteContact() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete contact: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useCreateContactList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateContactListData): Promise<ContactList> => {
      // Get the current user's business_id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get the user's active business
      const { data: teamMembership } = await supabase
        .from('team_members')
        .select('business_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!teamMembership) {
        throw new Error('No active business found for user');
      }

      const { data: contactList, error } = await supabase
        .from('contact_lists')
        .insert({
          ...data,
          business_id: teamMembership.business_id,
          created_by: user.id,
          updated_by: user.id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create contact list: ${error.message}`);
      }

      return contactList;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    },
  });
}

export function useUpdateContactList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateContactListData): Promise<ContactList> => {
      const { id, ...updateData } = data;

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: contactList, error } = await supabase
        .from('contact_lists')
        .update({
          ...updateData,
          updated_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update contact list: ${error.message}`);
      }

      return contactList;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      queryClient.invalidateQueries({ queryKey: ['contact-list', data.id] });
    },
  });
}

export function useDeleteContactList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete contact list: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    },
  });
}

export function useAddContactToList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      listId,
    }: {
      contactId: string;
      listId: string;
    }): Promise<void> => {
      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('contact_list_members')
        .insert({
          contact_id: contactId,
          contact_list_id: listId,
          added_by: user?.id,
        });

      if (error) {
        throw new Error(`Failed to add contact to list: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact-list-members', variables.listId] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    },
  });
}

export function useRemoveContactFromList() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      listId,
    }: {
      contactId: string;
      listId: string;
    }): Promise<void> => {
      const { error } = await supabase
        .from('contact_list_members')
        .delete()
        .eq('contact_id', contactId)
        .eq('contact_list_id', listId);

      if (error) {
        throw new Error(`Failed to remove contact from list: ${error.message}`);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contact-list-members', variables.listId] });
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
    },
  });
}
