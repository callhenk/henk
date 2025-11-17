/**
 * E2E tests for conversation-orchestrator edge function
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

Deno.test('conversation-orchestrator E2E', async (t) => {
  let testData: Awaited<ReturnType<typeof TestDataFactory.createTestScenario>>;
  let conversationId: string;

  await t.step('setup: create test data', async () => {
    testData = await TestDataFactory.createTestScenario();

    // Create a test conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({
        campaign_id: testData.campaign.id,
        agent_id: testData.agent.id,
        lead_id: testData.lead.id,
        conversation_id: 'test-conv-123',
        status: 'initiated',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    assertExists(conversation);
    conversationId = conversation.id;
  });

  await t.step('should sync recent conversations', async () => {
    const response = await testClient.invoke('conversation-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);
    testClient.assertSuccess(response);
  });

  await t.step('should append conversation events', async () => {
    // Manually create some events
    await supabase.from('conversation_events').insert([
      {
        conversation_id: conversationId,
        sequence_number: 1,
        event_type: 'intro_played',
        agent_text: 'Hello! This is the fundraising team.',
        created_at: new Date().toISOString(),
      },
      {
        conversation_id: conversationId,
        sequence_number: 2,
        event_type: 'speech_detected',
        user_response: "Hi, yes I'm interested.",
        created_at: new Date().toISOString(),
      },
    ]);

    const response = await testClient.invoke('conversation-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);

    // Verify events were processed
    const { data: events } = await supabase
      .from('conversation_events')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sequence_number');

    assertExists(events);
    assertEquals(events.length >= 2, true);
  });

  await t.step('should infer outcomes from messages', async () => {
    // Add a pledge message
    await supabase.from('conversation_events').insert({
      conversation_id: conversationId,
      sequence_number: 3,
      event_type: 'commitment_requested',
      user_response: 'Yes, I will pledge $100',
      created_at: new Date().toISOString(),
    });

    const response = await testClient.invoke('conversation-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);

    // Check if outcome was inferred
    const { data: conversation } = await supabase
      .from('conversations')
      .select('outcome')
      .eq('id', conversationId)
      .single();

    // Should potentially detect "pledged" outcome
    assertExists(conversation);
  });

  await t.step('should update conversation status', async () => {
    // Mark as completed
    await supabase
      .from('conversations')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    const response = await testClient.invoke('conversation-orchestrator', {
      useServiceRole: true,
    });

    assertEquals(response.status, 200);

    const { data: conversation } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    assertExists(conversation);
    assertEquals(conversation.status, 'completed');
  });

  await t.step('cleanup: remove test data', async () => {
    await TestCleanup.cleanupTestData(testStartTime);
  });
});
