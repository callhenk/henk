import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import {
  createTestContext,
  cleanupTestUser,
  cleanupTestBusiness,
  createLead,
  createLeads,
  createCampaign,
  createAgent,
  createTestClient,
  isSupabaseAvailable,
} from './index';

// Skip these tests if Supabase is not available (e.g., in CI without local Supabase)
const supabaseAvailable = await isSupabaseAvailable();

describe.skipIf(!supabaseAvailable)('Database Integration Tests', () => {
  let testContext: Awaited<ReturnType<typeof createTestContext>>;
  let supabase: ReturnType<typeof createTestClient>;

  beforeAll(async () => {
    // Create test context (user, business, team membership)
    testContext = await createTestContext({
      email: `db-test-${Date.now()}@henk.dev`,
      businessName: 'Database Test Business',
      role: 'owner',
    });

    supabase = createTestClient();
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestBusiness(testContext.business.id);
    await cleanupTestUser(testContext.user.id);
  });

  beforeEach(async () => {
    // Clean up data before each test
    await supabase
      .from('leads')
      .delete()
      .eq('business_id', testContext.business.id);
    await supabase
      .from('campaigns')
      .delete()
      .eq('business_id', testContext.business.id);
    await supabase
      .from('agents')
      .delete()
      .eq('business_id', testContext.business.id);
  });

  describe('Leads', () => {
    it('creates a lead successfully', async () => {
      const lead = await createLead(testContext.business.id, {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
      });

      expect(lead).toBeTruthy();
      expect(lead.first_name).toBe('John');
      expect(lead.last_name).toBe('Doe');
      expect(lead.email).toBe('john.doe@example.com');
      expect(lead.business_id).toBe(testContext.business.id);
    });

    it('creates multiple leads', async () => {
      const leads = await createLeads(testContext.business.id, 5);

      expect(leads).toHaveLength(5);
      expect(leads[0].business_id).toBe(testContext.business.id);
    });

    it('queries leads by business', async () => {
      // Create leads
      await createLeads(testContext.business.id, 3);

      // Query leads
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', testContext.business.id);

      expect(error).toBeNull();
      expect(data).toHaveLength(3);
    });

    it('filters leads by tags', async () => {
      // Create leads with different tags
      await createLead(testContext.business.id, {
        first_name: 'VIP',
        last_name: 'Donor',
        email: 'vip@example.com',
        tags: ['VIP', 'Major Donor'],
      });

      await createLead(testContext.business.id, {
        first_name: 'Regular',
        last_name: 'Donor',
        email: 'regular@example.com',
        tags: ['Regular'],
      });

      // Query VIP leads (using JSONB @> operator)
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', testContext.business.id)
        .filter('tags', 'cs', '["VIP"]');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data?.[0].email).toBe('vip@example.com');
    });

    it('allows creating leads with same email (no unique constraint)', async () => {
      // Create first lead
      const lead1 = await createLead(testContext.business.id, {
        email: 'duplicate@example.com',
        first_name: 'First',
      });

      // Create second lead with same email - this should succeed
      const lead2 = await createLead(testContext.business.id, {
        email: 'duplicate@example.com',
        first_name: 'Second',
      });

      // Both should be created successfully
      expect(lead1).toBeTruthy();
      expect(lead2).toBeTruthy();
      expect(lead1.id).not.toBe(lead2.id);
    });
  });

  describe('Campaigns', () => {
    it('creates a campaign successfully', async () => {
      const campaign = await createCampaign(testContext.business.id, {
        name: 'Test Campaign',
        status: 'draft',
      });

      expect(campaign).toBeTruthy();
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.status).toBe('draft');
      expect(campaign.business_id).toBe(testContext.business.id);
    });

    it('queries campaigns by status', async () => {
      // Create campaigns with different statuses
      await createCampaign(testContext.business.id, {
        name: 'Draft Campaign',
        status: 'draft',
      });
      await createCampaign(testContext.business.id, {
        name: 'Active Campaign',
        status: 'active',
      });

      // Query active campaigns
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('business_id', testContext.business.id)
        .eq('status', 'active');

      expect(error).toBeNull();
      expect(data).toHaveLength(1);
      expect(data?.[0].name).toBe('Active Campaign');
    });

    it('updates campaign status', async () => {
      const campaign = await createCampaign(testContext.business.id, {
        name: 'Campaign to Update',
        status: 'draft',
      });

      // Update status
      const { data, error } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaign.id)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data?.status).toBe('active');
    });

    it('deletes campaign', async () => {
      const campaign = await createCampaign(testContext.business.id, {
        name: 'Campaign to Delete',
      });

      // Delete campaign
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaign.id);

      expect(error).toBeNull();

      // Verify deleted
      const { data } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaign.id);

      expect(data).toHaveLength(0);
    });
  });

  describe('Agents', () => {
    it('creates an agent successfully', async () => {
      const agent = await createAgent(testContext.business.id, {
        name: 'Test Agent',
        voice_id: 'test_voice_123',
      });

      expect(agent).toBeTruthy();
      expect(agent.name).toBe('Test Agent');
      expect(agent.voice_id).toBe('test_voice_123');
      expect(agent.business_id).toBe(testContext.business.id);
    });

    it('stores voice settings as JSONB', async () => {
      const voiceSettings = {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.5,
      };

      const agent = await createAgent(testContext.business.id, {
        name: 'Agent with Settings',
        voice_settings: voiceSettings,
      });

      expect(agent.voice_settings).toEqual(voiceSettings);

      // Verify from database
      const { data } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agent.id)
        .single();

      expect(data?.voice_settings).toEqual(voiceSettings);
    });
  });

  describe('Multi-tenancy', () => {
    it('isolates data between businesses', async () => {
      // Create another business
      const otherContext = await createTestContext({
        email: `other-${Date.now()}@henk.dev`,
        businessName: 'Other Business',
      });

      // Create leads in both businesses
      await createLead(testContext.business.id, {
        email: 'business1@example.com',
      });
      await createLead(otherContext.business.id, {
        email: 'business2@example.com',
      });

      // Query first business leads
      const { data: business1Leads } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', testContext.business.id);

      expect(business1Leads).toHaveLength(1);
      expect(business1Leads?.[0].email).toBe('business1@example.com');

      // Query second business leads
      const { data: business2Leads } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', otherContext.business.id);

      expect(business2Leads).toHaveLength(1);
      expect(business2Leads?.[0].email).toBe('business2@example.com');

      // Cleanup
      await cleanupTestBusiness(otherContext.business.id);
      await cleanupTestUser(otherContext.user.id);
    });
  });

  describe('Complex Queries', () => {
    it('performs pagination correctly', async () => {
      // Create 10 leads
      await createLeads(testContext.business.id, 10);

      // Get first page (5 items)
      const { data: page1, count } = await supabase
        .from('leads')
        .select('*', { count: 'exact' })
        .eq('business_id', testContext.business.id)
        .range(0, 4);

      expect(page1).toHaveLength(5);
      expect(count).toBe(10);

      // Get second page
      const { data: page2 } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', testContext.business.id)
        .range(5, 9);

      expect(page2).toHaveLength(5);

      // Ensure pages are different
      const page1Ids = page1?.map((c) => c.id) || [];
      const page2Ids = page2?.map((c) => c.id) || [];
      const overlap = page1Ids.filter((id) => page2Ids.includes(id));
      expect(overlap).toHaveLength(0);
    });

    it('searches leads by name', async () => {
      await createLead(testContext.business.id, {
        first_name: 'John',
        last_name: 'Smith',
        email: 'john.smith@example.com',
      });
      await createLead(testContext.business.id, {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane.doe@example.com',
      });

      // Search for "John"
      const { data } = await supabase
        .from('leads')
        .select('*')
        .eq('business_id', testContext.business.id)
        .or(`first_name.ilike.%John%,last_name.ilike.%John%`);

      expect(data).toHaveLength(1);
      expect(data?.[0].first_name).toBe('John');
    });
  });
});
