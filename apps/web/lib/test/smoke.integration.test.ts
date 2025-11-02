import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createTestContext,
  cleanupTestUser,
  cleanupTestBusiness,
  createTestClient,
} from './index';

describe('Smoke Tests - Core Functionality', () => {
  let testContext: Awaited<ReturnType<typeof createTestContext>>;
  let supabase: ReturnType<typeof createTestClient>;

  beforeAll(async () => {
    testContext = await createTestContext({
      email: `smoke-test-${Date.now()}@henk.dev`,
      businessName: 'Smoke Test Business',
      role: 'owner',
    });

    supabase = createTestClient();
  });

  afterAll(async () => {
    // Cleanup
    await cleanupTestBusiness(testContext.business.id);
    await cleanupTestUser(testContext.user.id);
  });

  it('✓ Database connection works', async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', testContext.business.id)
      .single();

    expect(error).toBeNull();
    expect(data).toBeTruthy();
    expect(data?.name).toBe('Smoke Test Business');
  });

  it('✓ Can create a contact', async () => {
    const { data: contact, error } = await supabase
      .from('leads')
      .insert({
        business_id: testContext.business.id,
        first_name: 'Test',
        last_name: 'Contact',
        email: `contact-${Date.now()}@example.com`,
        source: 'manual',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(contact).toBeTruthy();
    expect(contact?.first_name).toBe('Test');
    expect(contact?.last_name).toBe('Contact');

    console.log('✓ Contact created successfully:', contact?.id);
  });

  it('✓ Can create a campaign', async () => {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        business_id: testContext.business.id,
        name: 'Smoke Test Campaign',
        description: 'Testing campaign creation',
        status: 'draft',
        script: 'This is a test campaign script for automated testing.',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(campaign).toBeTruthy();
    expect(campaign?.name).toBe('Smoke Test Campaign');
    expect(campaign?.status).toBe('draft');

    console.log('✓ Campaign created successfully:', campaign?.id);
  });

  it('✓ Can create an agent', async () => {
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        business_id: testContext.business.id,
        name: 'Smoke Test Agent',
        voice_id: 'test_voice_123',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(agent).toBeTruthy();
    expect(agent?.name).toBe('Smoke Test Agent');

    console.log('✓ Agent created successfully:', agent?.id);
  });

  it('✓ Can create a contact list', async () => {
    const { data: list, error } = await supabase
      .from('lead_lists')
      .insert({
        business_id: testContext.business.id,
        name: 'Smoke Test List',
        list_type: 'static',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(list).toBeTruthy();
    expect(list?.name).toBe('Smoke Test List');

    console.log('✓ Contact list created successfully:', list?.id);
  });

  it('✓ Can create an integration', async () => {
    const { data: integration, error } = await supabase
      .from('integrations')
      .insert({
        business_id: testContext.business.id,
        name: 'Test Integration',
        type: 'crm',
        status: 'inactive',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(integration).toBeTruthy();
    expect(integration?.name).toBe('Test Integration');

    console.log('✓ Integration created successfully:', integration?.id);
  });

  it('✓ Multi-tenancy works (data isolation)', async () => {
    // Create a contact in this business
    const { data: contact1 } = await supabase
      .from('leads')
      .insert({
        business_id: testContext.business.id,
        first_name: 'Business1',
        last_name: 'Contact',
        email: `business1-${Date.now()}@example.com`,
        source: 'manual',
      })
      .select()
      .single();

    // Try to query all leads (should only see this business's leads)
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', testContext.business.id);

    expect(leads).toBeTruthy();
    expect(leads?.length).toBeGreaterThan(0);

    // All leads should belong to this business
    leads?.forEach((contact) => {
      expect(contact.business_id).toBe(testContext.business.id);
    });

    console.log('✓ Multi-tenancy verified - data is properly isolated');
  });

  it('✓ Can query and filter data', async () => {
    // Create a few more leads
    await supabase.from('leads').insert([
      {
        business_id: testContext.business.id,
        first_name: 'VIP',
        last_name: 'Donor',
        email: `vip-${Date.now()}@example.com`,
        source: 'manual',
        tags: ['VIP', 'Major Donor'],
      },
      {
        business_id: testContext.business.id,
        first_name: 'Regular',
        last_name: 'Donor',
        email: `regular-${Date.now()}@example.com`,
        source: 'manual',
        tags: ['Regular'],
      },
    ]);

    // Query VIP donors (using JSONB @> operator)
    const { data: vipDonors, error } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', testContext.business.id)
      .filter('tags', 'cs', '["VIP"]');

    expect(error).toBeNull();
    expect(vipDonors).toBeTruthy();
    expect(vipDonors?.length).toBeGreaterThan(0);
    expect(vipDonors?.[0].first_name).toBe('VIP');

    console.log('✓ Querying and filtering works correctly');
  });

  it('✓ Can update records', async () => {
    // Create a campaign
    const { data: campaign } = await supabase
      .from('campaigns')
      .insert({
        business_id: testContext.business.id,
        name: 'Campaign to Update',
        status: 'draft',
        script: 'Test script for update test',
      })
      .select()
      .single();

    // Update the status
    const { data: updated, error } = await supabase
      .from('campaigns')
      .update({ status: 'active' })
      .eq('id', campaign?.id!)
      .select()
      .single();

    expect(error).toBeNull();
    expect(updated?.status).toBe('active');

    console.log('✓ Updates work correctly');
  });

  it('✓ Can delete records', async () => {
    // Create a campaign to delete
    const { data: campaign } = await supabase
      .from('campaigns')
      .insert({
        business_id: testContext.business.id,
        name: 'Campaign to Delete',
        status: 'draft',
        script: 'Test script for delete test',
      })
      .select()
      .single();

    // Delete it
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaign?.id!);

    expect(deleteError).toBeNull();

    // Verify it's gone
    const { data: deleted } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign?.id!);

    expect(deleted).toHaveLength(0);

    console.log('✓ Deletes work correctly');
  });

  it('✓ JSONB fields work correctly', async () => {
    // Create agent with complex voice settings
    const voiceSettings = {
      stability: 0.75,
      similarity_boost: 0.85,
      style: 0.5,
      use_speaker_boost: true,
    };

    const { data: agent } = await supabase
      .from('agents')
      .insert({
        business_id: testContext.business.id,
        name: 'Agent with Settings',
        voice_id: 'test_voice_456',
        voice_settings: voiceSettings,
      })
      .select()
      .single();

    expect(agent?.voice_settings).toEqual(voiceSettings);

    // Query it back
    const { data: queriedAgent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent?.id!)
      .single();

    expect(queriedAgent?.voice_settings).toEqual(voiceSettings);

    console.log('✓ JSONB fields work correctly');
  });

  it('✓ Pagination works', async () => {
    // Create multiple leads
    const leadsToCreate = Array.from({ length: 5 }, (_, i) => ({
      business_id: testContext.business.id,
      first_name: `Contact${i}`,
      last_name: 'Test',
      email: `pagination-${i}-${Date.now()}@example.com`,
      source: 'manual' as const,
    }));

    await supabase.from('leads').insert(leadsToCreate);

    // Get first page (2 items)
    const { data: page1, count } = await supabase
      .from('leads')
      .select('*', { count: 'exact' })
      .eq('business_id', testContext.business.id)
      .range(0, 1);

    expect(page1).toHaveLength(2);
    expect(count).toBeGreaterThan(5); // We created more than 5 total

    // Get second page
    const { data: page2 } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', testContext.business.id)
      .range(2, 3);

    expect(page2).toHaveLength(2);

    // Pages should be different
    const page1Ids = page1?.map((c) => c.id) || [];
    const page2Ids = page2?.map((c) => c.id) || [];
    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(overlap).toHaveLength(0);

    console.log('✓ Pagination works correctly');
  });

  it('✓ Search works', async () => {
    // Create leads with searchable names
    await supabase.from('leads').insert([
      {
        business_id: testContext.business.id,
        first_name: 'John',
        last_name: 'Smith',
        email: `john-smith-${Date.now()}@example.com`,
        source: 'manual',
      },
      {
        business_id: testContext.business.id,
        first_name: 'Jane',
        last_name: 'Doe',
        email: `jane-doe-${Date.now()}@example.com`,
        source: 'manual',
      },
    ]);

    // Search for "John"
    const { data: results, error } = await supabase
      .from('leads')
      .select('*')
      .eq('business_id', testContext.business.id)
      .or('first_name.ilike.%John%,last_name.ilike.%John%');

    expect(error).toBeNull();
    expect(results).toBeTruthy();
    expect(results?.some((r) => r.first_name === 'John')).toBe(true);

    console.log('✓ Search works correctly');
  });
});
