import { useQuery } from '@tanstack/react-query';

import type { Tables } from '../../database.types';
import { useBusinessContext } from '../use-business-context';
import { useSupabase } from '../use-supabase';

type Contact = Tables<'contacts'>['Row'];
type ContactList = Tables<'contact_lists'>['Row'];

export interface ContactsFilters {
  source?: Contact['source'];
  tags?: string[];
  do_not_call?: boolean;
  search?: string;
}

export function useContacts(filters?: ContactsFilters) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['contacts', filters, businessContext?.business_id],
    queryFn: async (): Promise<Contact[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      let query = supabase
        .from('contacts')
        .select('*')
        .eq('business_id', businessContext.business_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.source) {
        query = query.eq('source', filters.source);
      }

      if (filters?.do_not_call !== undefined) {
        query = query.eq('do_not_call', filters.do_not_call);
      }

      if (filters?.tags && filters.tags.length > 0) {
        // Filter by tags using JSONB contains
        query = query.contains('tags', filters.tags);
      }

      if (filters?.search) {
        query = query.or(
          `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company.ilike.%${filters.search}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!businessContext?.business_id,
  });
}

export function useContact(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['contact', id, businessContext?.business_id],
    queryFn: async (): Promise<Contact | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch contact: ${error.message}`);
      }

      return data;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}

export function useContactLists() {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['contact-lists', businessContext?.business_id],
    queryFn: async (): Promise<ContactList[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('business_id', businessContext.business_id)
        .order('name', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch contact lists: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!businessContext?.business_id,
  });
}

export function useContactList(id: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['contact-list', id, businessContext?.business_id],
    queryFn: async (): Promise<ContactList | null> => {
      // Return null if no business context
      if (!businessContext?.business_id) {
        return null;
      }

      const { data, error } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('id', id)
        .eq('business_id', businessContext.business_id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch contact list: ${error.message}`);
      }

      return data;
    },
    enabled: !!id && !!businessContext?.business_id,
  });
}

export function useContactListMembers(listId: string) {
  const supabase = useSupabase();
  const { data: businessContext } = useBusinessContext();

  return useQuery({
    queryKey: ['contact-list-members', listId, businessContext?.business_id],
    queryFn: async (): Promise<Contact[]> => {
      // Return empty array if no business context
      if (!businessContext?.business_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('contact_list_members')
        .select('contact_id, contacts(*)')
        .eq('contact_list_id', listId);

      if (error) {
        throw new Error(`Failed to fetch contact list members: ${error.message}`);
      }

      // Extract contacts from the join result
      return (data || [])
        .map((item: any) => item.contacts)
        .filter((contact): contact is Contact => contact !== null);
    },
    enabled: !!listId && !!businessContext?.business_id,
  });
}
