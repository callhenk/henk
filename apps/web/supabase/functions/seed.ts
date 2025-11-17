/**
 * Seed script for populating the database with test data
 * Usage: deno run --allow-net --allow-env seed.ts
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

import type { Database } from './database.types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

console.log('🌱 Seeding database...\n');

// Create account
console.log('Creating account...');
const { data: account } = await supabase
  .from('accounts')
  .insert({
    name: 'Demo Fundraising Organization',
  })
  .select('id')
  .single();

if (!account) {
  console.error('Failed to create account');
  Deno.exit(1);
}
console.log(`✅ Account created: ${account.id}\n`);

// Create business
console.log('Creating business...');
const { data: business } = await supabase
  .from('businesses')
  .insert({
    account_id: account.id,
    name: 'Demo Fundraising Campaign',
  })
  .select()
  .single();

if (!business) {
  console.error('Failed to create business');
  Deno.exit(1);
}
console.log(`✅ Business created: ${business.id}\n`);

// Create agent
console.log('Creating agent...');
const { data: agent } = await supabase
  .from('agents')
  .insert({
    business_id: business.id,
    name: 'Demo Fundraising Agent',
    elevenlabs_agent_id: 'demo-agent-123',
    caller_id: '+15555551234',
  })
  .select()
  .single();

if (!agent) {
  console.error('Failed to create agent');
  Deno.exit(1);
}
console.log(`✅ Agent created: ${agent.id}\n`);

// Create campaign
console.log('Creating campaign...');
const { data: campaign } = await supabase
  .from('campaigns')
  .insert({
    business_id: business.id,
    agent_id: agent.id,
    name: 'Annual Fundraising Drive 2025',
    status: 'active',
    script:
      'Hello! This is the annual fundraising drive. We appreciate your support.',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    daily_call_cap: 100,
    max_attempts: 3,
    exclude_dnc: true,
    call_window_start: '09:00:00',
    call_window_end: '20:00:00',
  })
  .select()
  .single();

if (!campaign) {
  console.error('Failed to create campaign');
  Deno.exit(1);
}
console.log(`✅ Campaign created: ${campaign.id}\n`);

// Create leads
console.log('Creating leads...');
const leads = [
  {
    first_name: 'Alice',
    last_name: 'Johnson',
    email: 'alice.johnson@example.com',
    phone: '+15555551001',
    status: 'new',
    timezone: 'America/New_York',
  },
  {
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bob.smith@example.com',
    phone: '+15555551002',
    status: 'new',
    timezone: 'America/Chicago',
  },
  {
    first_name: 'Carol',
    last_name: 'Williams',
    email: 'carol.williams@example.com',
    phone: '+15555551003',
    status: 'contacted',
    timezone: 'America/Los_Angeles',
  },
  {
    first_name: 'David',
    last_name: 'Brown',
    email: 'david.brown@example.com',
    phone: '+15555551004',
    status: 'interested',
    timezone: 'America/Denver',
  },
  {
    first_name: 'Eve',
    last_name: 'Davis',
    email: 'eve.davis@example.com',
    phone: '+15555551005',
    status: 'pledged',
    timezone: 'America/New_York',
  },
];

const { data: createdLeads } = await supabase
  .from('leads')
  .insert(
    leads.map((lead) => ({
      business_id: business.id,
      source: 'seed',
      ...lead,
    })),
  )
  .select();

if (!createdLeads) {
  console.error('Failed to create leads');
  Deno.exit(1);
}
console.log(`✅ Created ${createdLeads.length} leads\n`);

// Create campaign_leads (link leads to campaign)
console.log('Linking leads to campaign...');
const { data: campaignLeads } = await supabase
  .from('campaign_leads')
  .insert(
    createdLeads.map((lead, index) => ({
      campaign_id: campaign.id,
      lead_id: lead.id,
      attempts: index < 2 ? 0 : index - 1, // First 2 have 0 attempts, others have increasing attempts
      status: lead.status,
    })),
  )
  .select();

if (!campaignLeads) {
  console.error('Failed to create campaign_leads');
  Deno.exit(1);
}
console.log(`✅ Linked ${campaignLeads.length} leads to campaign\n`);

// Create a sample conversation
console.log('Creating sample conversation...');
const { data: conversation } = await supabase
  .from('conversations')
  .insert({
    campaign_id: campaign.id,
    agent_id: agent.id,
    lead_id: createdLeads[2].id, // Carol Williams
    conversation_id: 'demo-conv-' + Date.now(),
    status: 'completed',
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
    outcome: 'interested',
    transcript:
      "Agent: Hello! This is the annual fundraising drive.\nLead: I'm interested in learning more.",
    duration_seconds: 300,
  })
  .select()
  .single();

if (!conversation) {
  console.error('Failed to create conversation');
  Deno.exit(1);
}
console.log(`✅ Conversation created: ${conversation.id}\n`);

// Create conversation events
console.log('Creating conversation events...');
const { data: events } = await supabase
  .from('conversation_events')
  .insert([
    {
      conversation_id: conversation.id,
      sequence_number: 1,
      event_type: 'call_started',
      agent_text: 'Hello! This is the annual fundraising drive.',
    },
    {
      conversation_id: conversation.id,
      sequence_number: 2,
      event_type: 'speech_detected',
      user_response: 'Hello, who is this?',
    },
    {
      conversation_id: conversation.id,
      sequence_number: 3,
      event_type: 'response_processed',
      agent_text: 'We are reaching out to our valued supporters.',
    },
    {
      conversation_id: conversation.id,
      sequence_number: 4,
      event_type: 'speech_detected',
      user_response: "I'm interested in learning more.",
    },
    {
      conversation_id: conversation.id,
      sequence_number: 5,
      event_type: 'call_ended',
    },
  ])
  .select();

if (!events) {
  console.error('Failed to create conversation events');
  Deno.exit(1);
}
console.log(`✅ Created ${events.length} conversation events\n`);

// Create integration
console.log('Creating CRM integration...');
const { data: integration } = await supabase
  .from('integrations')
  .insert({
    business_id: business.id,
    type: 'crm',
    name: 'Demo Salesforce Integration',
    status: 'active',
    credentials: {
      access_token: 'demo-token',
      refresh_token: 'demo-refresh',
      instance_url: 'https://demo.salesforce.com',
    },
    config: {
      sync_contacts: true,
      sync_leads: true,
    },
  })
  .select()
  .single();

if (!integration) {
  console.error('Failed to create integration');
  Deno.exit(1);
}
console.log(`✅ Integration created: ${integration.id}\n`);

console.log('🎉 Database seeded successfully!\n');
console.log('Summary:');
console.log(`  - Account: ${account.id}`);
console.log(`  - Business: ${business.id}`);
console.log(`  - Agent: ${agent.id}`);
console.log(`  - Campaign: ${campaign.id}`);
console.log(`  - Leads: ${createdLeads.length}`);
console.log(`  - Conversation: ${conversation.id}`);
console.log(`  - Events: ${events.length}`);
console.log(`  - Integration: ${integration.id}`);
console.log('\n✨ Ready to test!');
