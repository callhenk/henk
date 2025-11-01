import { faker } from '@faker-js/faker';
import type { Database } from '../database.types';
import { createTestClient } from './supabase-test-client';

type Contact = Database['public']['Tables']['contacts']['Insert'];
type Campaign = Database['public']['Tables']['campaigns']['Insert'];
type Agent = Database['public']['Tables']['agents']['Insert'];
type Integration = Database['public']['Tables']['integrations']['Insert'];
type ContactList = Database['public']['Tables']['contact_lists']['Insert'];

/**
 * Factory for creating contact test data
 */
export function createContactData(overrides?: Partial<Contact>): Contact {
  return {
    business_id: overrides?.business_id || faker.string.uuid(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number('+1##########'),
    source: 'manual',
    tags: [],
    custom_fields: {},
    source_metadata: {},
    ...overrides,
  };
}

/**
 * Creates a contact in the database
 */
export async function createContact(
  businessId: string,
  overrides?: Partial<Contact>,
) {
  const supabase = createTestClient();
  const data = createContactData({ business_id: businessId, ...overrides });

  const { data: contact, error } = await supabase
    .from('contacts')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create contact: ${error.message}`);
  }

  return contact;
}

/**
 * Creates multiple contacts in the database
 */
export async function createContacts(
  businessId: string,
  count: number,
  overrides?: Partial<Contact>,
) {
  const supabase = createTestClient();
  const contacts = Array.from({ length: count }, () =>
    createContactData({ business_id: businessId, ...overrides }),
  );

  const { data, error } = await supabase
    .from('contacts')
    .insert(contacts)
    .select();

  if (error) {
    throw new Error(`Failed to create contacts: ${error.message}`);
  }

  return data;
}

/**
 * Factory for creating campaign test data
 */
export function createCampaignData(overrides?: Partial<Campaign>): Campaign {
  return {
    business_id: overrides?.business_id || faker.string.uuid(),
    name: faker.company.catchPhrase(),
    description: faker.lorem.sentence(),
    status: 'draft',
    goal: faker.number.int({ min: 1000, max: 100000 }).toString(),
    ...overrides,
  };
}

/**
 * Creates a campaign in the database
 */
export async function createCampaign(
  businessId: string,
  overrides?: Partial<Campaign>,
) {
  const supabase = createTestClient();
  const data = createCampaignData({ business_id: businessId, ...overrides });

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`);
  }

  return campaign;
}

/**
 * Factory for creating agent test data
 */
export function createAgentData(overrides?: Partial<Agent>): Agent {
  return {
    business_id: overrides?.business_id || faker.string.uuid(),
    name: faker.person.fullName(),
    voice_id: faker.string.alphanumeric(20),
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
    },
    system_prompt: faker.lorem.paragraph(),
    ...overrides,
  };
}

/**
 * Creates an agent in the database
 */
export async function createAgent(
  businessId: string,
  overrides?: Partial<Agent>,
) {
  const supabase = createTestClient();
  const data = createAgentData({ business_id: businessId, ...overrides });

  const { data: agent, error } = await supabase
    .from('agents')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create agent: ${error.message}`);
  }

  return agent;
}

/**
 * Factory for creating integration test data
 */
export function createIntegrationData(
  overrides?: Partial<Integration>,
): Integration {
  const types = ['crm', 'marketing', 'analytics', 'communication'] as const;
  const statuses = ['active', 'inactive', 'error'] as const;

  return {
    business_id: overrides?.business_id || faker.string.uuid(),
    name: faker.company.name(),
    type: faker.helpers.arrayElement(types),
    status: faker.helpers.arrayElement(statuses),
    credentials: {},
    config: {},
    ...overrides,
  };
}

/**
 * Creates an integration in the database
 */
export async function createIntegration(
  businessId: string,
  overrides?: Partial<Integration>,
) {
  const supabase = createTestClient();
  const data = createIntegrationData({
    business_id: businessId,
    ...overrides,
  });

  const { data: integration, error } = await supabase
    .from('integrations')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create integration: ${error.message}`);
  }

  return integration;
}

/**
 * Factory for creating contact list test data
 */
export function createContactListData(
  overrides?: Partial<ContactList>,
): ContactList {
  return {
    business_id: overrides?.business_id || faker.string.uuid(),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    type: 'static',
    ...overrides,
  };
}

/**
 * Creates a contact list in the database
 */
export async function createContactList(
  businessId: string,
  overrides?: Partial<ContactList>,
) {
  const supabase = createTestClient();
  const data = createContactListData({
    business_id: businessId,
    ...overrides,
  });

  const { data: contactList, error } = await supabase
    .from('contact_lists')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create contact list: ${error.message}`);
  }

  return contactList;
}

/**
 * Adds contacts to a contact list
 */
export async function addContactsToList(
  contactListId: string,
  contactIds: string[],
) {
  const supabase = createTestClient();

  const members = contactIds.map((contactId) => ({
    contact_list_id: contactListId,
    contact_id: contactId,
  }));

  const { data, error } = await supabase
    .from('contact_list_members')
    .insert(members)
    .select();

  if (error) {
    throw new Error(`Failed to add contacts to list: ${error.message}`);
  }

  return data;
}

/**
 * Creates a complete test scenario with business, contacts, campaigns, etc.
 */
export async function createFullTestScenario(businessId: string) {
  // Create contacts
  const contacts = await createContacts(businessId, 10);

  // Create contact list
  const contactList = await createContactList(businessId, {
    name: 'Test VIP Donors',
  });

  // Add contacts to list
  await addContactsToList(
    contactList.id,
    contacts.slice(0, 5).map((c) => c.id),
  );

  // Create campaign
  const campaign = await createCampaign(businessId, {
    name: 'Annual Fundraiser',
    status: 'active',
  });

  // Create agent
  const agent = await createAgent(businessId, {
    name: 'Fundraising Assistant',
  });

  // Create integrations
  const salesforceIntegration = await createIntegration(businessId, {
    name: 'Salesforce',
    type: 'crm',
    status: 'active',
  });

  return {
    contacts,
    contactList,
    campaign,
    agent,
    integrations: {
      salesforce: salesforceIntegration,
    },
  };
}
