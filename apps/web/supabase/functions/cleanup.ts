/**
 * Cleanup script for removing seed data
 * Usage: deno run --allow-net --allow-env cleanup.ts
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

import type { Database } from './database.types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient<Database>(supabaseUrl, supabaseKey);

console.log('🧹 Cleaning up seed data...\n');

// Delete in reverse dependency order
console.log('Deleting conversation events...');
await supabase
  .from('conversation_events')
  .delete()
  .like('conversation_id', 'demo-conv-%');
console.log('✅ Conversation events deleted\n');

console.log('Deleting conversations...');
await supabase
  .from('conversations')
  .delete()
  .like('conversation_id', 'demo-conv-%');
console.log('✅ Conversations deleted\n');

console.log('Deleting campaign_leads...');
const { data: campaigns } = await supabase
  .from('campaigns')
  .select('id')
  .eq('name', 'Annual Fundraising Drive 2025');
if (campaigns && campaigns.length > 0) {
  for (const campaign of campaigns) {
    await supabase
      .from('campaign_leads')
      .delete()
      .eq('campaign_id', campaign.id);
  }
}
console.log('✅ Campaign_leads deleted\n');

console.log('Deleting leads...');
await supabase.from('leads').delete().eq('source', 'seed');
console.log('✅ Leads deleted\n');

console.log('Deleting integrations...');
await supabase
  .from('integrations')
  .delete()
  .eq('name', 'Demo Salesforce Integration');
console.log('✅ Integrations deleted\n');

console.log('Deleting campaigns...');
await supabase
  .from('campaigns')
  .delete()
  .eq('name', 'Annual Fundraising Drive 2025');
console.log('✅ Campaigns deleted\n');

console.log('Deleting agents...');
await supabase.from('agents').delete().eq('name', 'Demo Fundraising Agent');
console.log('✅ Agents deleted\n');

console.log('Deleting businesses...');
await supabase
  .from('businesses')
  .delete()
  .eq('name', 'Demo Fundraising Campaign');
console.log('✅ Businesses deleted\n');

console.log('Deleting accounts...');
await supabase
  .from('accounts')
  .delete()
  .eq('name', 'Demo Fundraising Organization');
console.log('✅ Accounts deleted\n');

console.log('🎉 Cleanup completed!');
