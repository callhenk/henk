import { faker } from '@faker-js/faker';
import type { Database } from '../database.types';
import { createTestClient } from './supabase-test-client';

type Lead = Database['public']['Tables']['leads']['Insert'];
type Campaign = Database['public']['Tables']['campaigns']['Insert'];
type Agent = Database['public']['Tables']['agents']['Insert'];
type Integration = Database['public']['Tables']['integrations']['Insert'];
type LeadList = Database['public']['Tables']['lead_lists']['Insert'];

/**
 * Factory for creating lead test data
 */
export function createLeadData(overrides?: Partial<Lead>): Lead {
  return {
    business_id: overrides?.business_id || faker.string.uuid(),
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    email: faker.internet.email().toLowerCase(),
    phone: faker.phone.number({ style: 'international' }),
    source: 'manual',
    tags: [],
    custom_fields: {},
    source_metadata: {},
    ...overrides,
  };
}

/**
 * Creates a lead in the database
 */
export async function createLead(
  businessId: string,
  overrides?: Partial<Lead>,
) {
  const supabase = createTestClient();
  const data = createLeadData({ business_id: businessId, ...overrides });

  const { data: lead, error } = await supabase
    .from('leads')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lead: ${error.message}`);
  }

  return lead;
}

/**
 * Creates multiple leads in the database
 */
export async function createLeads(
  businessId: string,
  count: number,
  overrides?: Partial<Lead>,
) {
  const supabase = createTestClient();
  const leads = Array.from({ length: count }, () =>
    createLeadData({ business_id: businessId, ...overrides }),
  );

  const { data, error } = await supabase
    .from('leads')
    .insert(leads)
    .select();

  if (error) {
    throw new Error(`Failed to create leads: ${error.message}`);
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
    script: faker.lorem.paragraph(),
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
  const types = ['crm', 'payment', 'communication', 'analytics', 'voice'] as const;
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
 * Factory for creating lead list test data
 */
export function createLeadListData(
  overrides?: Partial<LeadList>,
): LeadList {
  return {
    business_id: overrides?.business_id || faker.string.uuid(),
    name: faker.lorem.words(3),
    description: faker.lorem.sentence(),
    ...overrides,
  };
}

/**
 * Creates a lead list in the database
 */
export async function createLeadList(
  businessId: string,
  overrides?: Partial<LeadList>,
) {
  const supabase = createTestClient();
  const data = createLeadListData({
    business_id: businessId,
    ...overrides,
  });

  const { data: leadList, error } = await supabase
    .from('lead_lists')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create lead list: ${error.message}`);
  }

  return leadList;
}

/**
 * Adds leads to a lead list
 */
export async function addLeadsToList(
  leadListId: string,
  leadIds: string[],
) {
  const supabase = createTestClient();

  const members = leadIds.map((leadId) => ({
    lead_list_id: leadListId,
    lead_id: leadId,
  }));

  const { data, error } = await supabase
    .from('lead_list_members')
    .insert(members)
    .select();

  if (error) {
    throw new Error(`Failed to add leads to list: ${error.message}`);
  }

  return data;
}

/**
 * Creates a complete test scenario with business, leads, campaigns, etc.
 */
export async function createFullTestScenario(businessId: string) {
  // Create leads
  const leads = await createLeads(businessId, 10);

  // Create lead list
  const leadList = await createLeadList(businessId, {
    name: 'Test VIP Donors',
  });

  // Add leads to list
  await addLeadsToList(
    leadList.id,
    leads.slice(0, 5).map((c) => c.id),
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
    leads,
    leadList,
    campaign,
    agent,
    integrations: {
      salesforce: salesforceIntegration,
    },
  };
}
