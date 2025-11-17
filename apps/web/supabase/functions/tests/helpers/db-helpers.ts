/**
 * Database helpers for testing
 * Provides utilities for setting up and tearing down test data
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';

import type { Database } from '../../../../lib/database.types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'http://localhost:54321';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * Test data factory
 */
export class TestDataFactory {
  /**
   * Create a test business
   */
  static async createBusiness(
    data: Partial<Database['public']['Tables']['businesses']['Insert']> = {},
  ) {
    // First create an account if not provided
    let accountId = data.account_id;
    if (!accountId) {
      const { data: account } = await supabase
        .from('accounts')
        .insert({
          name: `Test Account ${Date.now()}`,
        })
        .select('id')
        .single();
      accountId = account?.id;
    }

    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        account_id: accountId!,
        name: data.name || `Test Business ${Date.now()}`,
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return business;
  }

  /**
   * Create a test agent
   */
  static async createAgent(
    businessId: string,
    data: Partial<Database['public']['Tables']['agents']['Insert']> = {},
  ) {
    const { data: agent, error } = await supabase
      .from('agents')
      .insert({
        business_id: businessId,
        name: data.name || `Test Agent ${Date.now()}`,
        elevenlabs_agent_id: data.elevenlabs_agent_id || 'test-agent-id',
        caller_id: data.caller_id || '+15555555555',
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return agent;
  }

  /**
   * Create a test campaign
   */
  static async createCampaign(
    businessId: string,
    agentId: string,
    data: Partial<Database['public']['Tables']['campaigns']['Insert']> = {},
  ) {
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        business_id: businessId,
        agent_id: agentId,
        name: data.name || `Test Campaign ${Date.now()}`,
        status: data.status || 'active',
        script: data.script || 'Test script for automated calls',
        start_date: data.start_date || new Date().toISOString(),
        end_date:
          data.end_date ||
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return campaign;
  }

  /**
   * Create a test lead (leads table contains contact info directly)
   */
  static async createLead(
    businessId: string,
    data: Partial<Database['public']['Tables']['leads']['Insert']> = {},
  ) {
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        business_id: businessId,
        first_name: data.first_name || 'Test',
        last_name: data.last_name || 'Lead',
        email: data.email || `testlead${Date.now()}@example.com`,
        phone: data.phone || `+1555${Math.floor(Math.random() * 10000000)}`,
        source: data.source || 'test',
        status: data.status || 'new',
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return lead;
  }

  /**
   * Create a test integration
   */
  static async createIntegration(
    businessId: string,
    data: Partial<Database['public']['Tables']['integrations']['Insert']> = {},
  ) {
    const { data: integration, error } = await supabase
      .from('integrations')
      .insert({
        business_id: businessId,
        type: data.type || 'crm',
        name: data.name || 'Test Integration',
        status: data.status || 'active',
        credentials: data.credentials || {},
        config: data.config || {},
        ...data,
      })
      .select()
      .single();

    if (error) throw error;
    return integration;
  }

  /**
   * Create a complete test scenario
   */
  static async createTestScenario() {
    const business = await this.createBusiness();
    const agent = await this.createAgent(business.id);
    const campaign = await this.createCampaign(business.id, agent.id);
    const lead = await this.createLead(business.id);

    return { business, agent, campaign, lead };
  }
}

/**
 * Cleanup helpers
 */
export class TestCleanup {
  /**
   * Delete a business and all related data
   */
  static async deleteBusiness(businessId: string) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', businessId);

    if (error) throw error;
  }

  /**
   * Delete all test data created after a timestamp
   */
  static async cleanupTestData(afterTimestamp: string) {
    // Delete in reverse dependency order
    await supabase
      .from('conversation_events')
      .delete()
      .gte('created_at', afterTimestamp);

    await supabase
      .from('conversations')
      .delete()
      .gte('created_at', afterTimestamp);

    await supabase.from('leads').delete().gte('created_at', afterTimestamp);

    await supabase.from('campaigns').delete().gte('created_at', afterTimestamp);

    await supabase.from('agents').delete().gte('created_at', afterTimestamp);

    await supabase
      .from('integrations')
      .delete()
      .gte('created_at', afterTimestamp);

    await supabase
      .from('businesses')
      .delete()
      .gte('created_at', afterTimestamp);
  }
}
