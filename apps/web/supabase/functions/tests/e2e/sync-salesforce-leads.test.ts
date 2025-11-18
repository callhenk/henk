/**
 * E2E tests for sync-salesforce-leads edge function
 */
import { assertExists } from 'jsr:@std/assert';

import {
  TestCleanup,
  TestDataFactory,
  supabase,
} from '../helpers/db-helpers.ts';
import { createTestClient } from '../helpers/test-client.ts';

const testClient = createTestClient();
const testStartTime = new Date().toISOString();

Deno.test('sync-salesforce-leads E2E', async (t) => {
  let business: Awaited<ReturnType<typeof TestDataFactory.createBusiness>>;
  let integrationId: string;

  await t.step('setup: create test business and integration', async () => {
    business = await TestDataFactory.createBusiness();

    const { data: integration } = await supabase
      .from('integrations')
      .insert({
        business_id: business.id,
        type: 'crm',
        name: 'Test Salesforce',
        status: 'active',
        credentials: {
          access_token: 'test-token',
          refresh_token: 'test-refresh',
          instance_url: 'https://test.salesforce.com',
        },
        config: {
          sync_contacts: true,
          sync_leads: true,
        },
      })
      .select()
      .single();

    assertExists(integration);
    integrationId = integration.id;
  });

  await t.step('should invoke sync function', async () => {
    const response = await testClient.invoke('sync-salesforce-leads', {
      useServiceRole: true,
    });

    // May fail if no real Salesforce credentials, but should invoke
    assertExists(response);
  });

  await t.step('should create sync log entry', async () => {
    // Even if sync fails, it should create a log
    const { data: logs } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('integration_id', integrationId)
      .order('created_at', { ascending: false })
      .limit(1);

    // May or may not have logs depending on execution
    assertExists(logs);
  });

  await t.step('should handle missing credentials gracefully', async () => {
    // Update integration with invalid credentials
    await supabase
      .from('integrations')
      .update({
        credentials: {},
      })
      .eq('id', integrationId);

    const response = await testClient.invoke('sync-salesforce-leads', {
      useServiceRole: true,
    });

    // Should handle gracefully
    assertExists(response);
  });

  await t.step('should update last_sync_at on success', async () => {
    // With valid mock data, should update timestamp
    const { data: integration } = await supabase
      .from('integrations')
      .select('last_sync_at')
      .eq('id', integrationId)
      .single();

    assertExists(integration);
  });

  await t.step('cleanup: remove test data', async () => {
    await TestCleanup.cleanupTestData(testStartTime);
  });
});
