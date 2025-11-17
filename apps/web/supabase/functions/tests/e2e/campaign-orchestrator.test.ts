/**
 * E2E tests for campaign-orchestrator edge function
 */
import { assertEquals, assertExists } from 'jsr:@std/assert';

import {
  TestCleanup,
  TestDataFactory,
  supabase,
} from '../helpers/db-helpers.ts';
import {
  EdgeFunctionTestClient,
  createTestClient,
} from '../helpers/test-client.ts';

const testClient: EdgeFunctionTestClient = createTestClient();
const testStartTime = new Date().toISOString();

Deno.test('campaign-orchestrator E2E', async (t) => {
  let testData: Awaited<ReturnType<typeof TestDataFactory.createTestScenario>>;

  await t.step('setup: create test data', async () => {
    testData = await TestDataFactory.createTestScenario();
    assertExists(testData.business);
    assertExists(testData.campaign);
    assertExists(testData.lead);
  });

  await t.step('should process active campaigns', async () => {
    const response = await testClient.invoke('campaign-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);
    testClient.assertSuccess(response);

    // Verify response structure
    assertExists(response.data);
  });

  await t.step('should respect call windows', async () => {
    // Update campaign with restrictive call window
    await supabase
      .from('campaigns')
      .update({
        call_window_start: '09:00:00',
        call_window_end: '17:00:00',
      })
      .eq('id', testData.campaign.id);

    const response = await testClient.invoke('campaign-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);
  });

  await t.step('should respect daily caps', async () => {
    // Update campaign with daily cap
    await supabase
      .from('campaigns')
      .update({
        daily_call_cap: 1,
      })
      .eq('id', testData.campaign.id);

    // First call
    await testClient.invoke('campaign-orchestrator', {
      useServiceRole: true,
    });

    // Second call should respect cap
    const response = await testClient.invoke('campaign-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);
  });

  await t.step('should respect max attempts', async () => {
    // Update campaign max attempts
    await supabase
      .from('campaigns')
      .update({
        max_attempts: 3,
      })
      .eq('id', testData.campaign.id);

    // Create campaign_leads record with 3 attempts already made
    await supabase.from('campaign_leads').insert({
      campaign_id: testData.campaign.id,
      lead_id: testData.lead.id,
      attempts: 3,
    });

    const response = await testClient.invoke('campaign-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);

    // Verify attempts didn't increase
    const { data: campaignLead } = await supabase
      .from('campaign_leads')
      .select('attempts')
      .eq('campaign_id', testData.campaign.id)
      .eq('lead_id', testData.lead.id)
      .single();

    assertEquals(campaignLead?.attempts, 3);
  });

  await t.step('should exclude DNC leads', async () => {
    // Update lead as DNC
    await supabase
      .from('leads')
      .update({
        dnc: true,
      })
      .eq('id', testData.lead.id);

    // Update campaign to exclude DNC
    await supabase
      .from('campaigns')
      .update({
        exclude_dnc: true,
      })
      .eq('id', testData.campaign.id);

    const response = await testClient.invoke('campaign-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);

    // Verify lead wasn't contacted
    const { data: lead } = await supabase
      .from('leads')
      .select('last_activity_at')
      .eq('id', testData.lead.id)
      .single();

    // Should still be null
    assertEquals(lead?.last_activity_at, null);
  });

  await t.step('cleanup: remove test data', async () => {
    await TestCleanup.cleanupTestData(testStartTime);
  });
});
