/**
 * Integration tests for database operations
 */
import { assertEquals, assertExists } from 'jsr:@std/assert';

import {
  TestCleanup,
  TestDataFactory,
  supabase,
} from '../helpers/db-helpers.ts';

const testStartTime = new Date().toISOString();

Deno.test('Database Integration Tests', async (t) => {
  await t.step('should create and query business', async () => {
    const business = await TestDataFactory.createBusiness({
      name: 'Test Business Integration',
    });

    assertExists(business);
    assertExists(business.id);
    assertEquals(business.name, 'Test Business Integration');

    const { data: queried } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', business.id)
      .single();

    assertExists(queried);
    assertEquals(queried.id, business.id);
  });

  await t.step('should create full scenario', async () => {
    const scenario = await TestDataFactory.createTestScenario();

    assertExists(scenario.business);
    assertExists(scenario.agent);
    assertExists(scenario.campaign);
    assertExists(scenario.lead);

    // Verify relationships
    assertEquals(scenario.agent.business_id, scenario.business.id);
    assertEquals(scenario.campaign.business_id, scenario.business.id);
    assertEquals(scenario.campaign.agent_id, scenario.agent.id);
    assertEquals(scenario.lead.business_id, scenario.business.id);
  });

  await t.step('should handle RLS policies', async () => {
    const business = await TestDataFactory.createBusiness();

    // Query with service role should work
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('business_id', business.id);

    assertExists(campaigns);
  });

  await t.step('should cleanup test data', async () => {
    await TestCleanup.cleanupTestData(testStartTime);

    // Verify cleanup
    const { data: businesses } = await supabase
      .from('businesses')
      .select('*')
      .gte('created_at', testStartTime);

    assertEquals(businesses?.length, 0);
  });
});
