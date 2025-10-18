import { NextRequest, NextResponse } from 'next/server';

import { getSupabaseServerClient } from '~/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Get user's business context
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('business_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { success: false, error: 'No active business membership found' },
        { status: 403 },
      );
    }

    // 3. Get Salesforce integration
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('business_id', teamMember.business_id)
      .eq('type', 'crm')
      .eq('name', 'Salesforce')
      .eq('status', 'active')  // Fixed: callback sets 'active', not 'connected'
      .single();

    if (integrationError || !integration) {
      return NextResponse.json(
        { success: false, error: 'Salesforce integration not found or not connected' },
        { status: 404 },
      );
    }

    const config = integration.config as { instanceUrl: string; apiVersion: string };
    const credentials = integration.credentials as {
      accessToken: string;
      refreshToken: string;
      tokenType: string;
    };

    // 4. Query Salesforce for contacts
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const soqlQuery = `SELECT Id,FirstName,LastName,Email,Phone,Title,Department,Account.Name FROM Contact WHERE Email != null LIMIT ${limit} OFFSET ${offset}`;
    const queryUrl = `${config.instanceUrl}/services/data/${config.apiVersion}/query?q=${encodeURIComponent(soqlQuery)}`;

    const salesforceResponse = await fetch(queryUrl, {
      headers: {
        'Authorization': `${credentials.tokenType} ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!salesforceResponse.ok) {
      if (salesforceResponse.status === 401) {
        // Token expired, try to refresh
        const refreshed = await refreshSalesforceToken(integration, supabase);
        if (!refreshed) {
          return NextResponse.json(
            { success: false, error: 'Failed to refresh Salesforce token' },
            { status: 401 },
          );
        }

        // Retry with new token
        const retryResponse = await fetch(queryUrl, {
          headers: {
            'Authorization': `${refreshed.tokenType} ${refreshed.accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!retryResponse.ok) {
          return NextResponse.json(
            { success: false, error: 'Failed to fetch contacts from Salesforce' },
            { status: 500 },
          );
        }

        const retryData = await retryResponse.json();
        return NextResponse.json({
          success: true,
          contacts: mapSalesforceContacts(retryData.records),
          totalSize: retryData.totalSize,
          done: retryData.done,
        });
      }

      return NextResponse.json(
        { success: false, error: 'Failed to fetch contacts from Salesforce' },
        { status: 500 },
      );
    }

    const salesforceData = await salesforceResponse.json();

    return NextResponse.json({
      success: true,
      contacts: mapSalesforceContacts(salesforceData.records),
      totalSize: salesforceData.totalSize,
      done: salesforceData.done,
    });
  } catch (error) {
    console.error('Salesforce contacts fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServerClient();
    const body = await request.json();
    const { contactIds, campaignId } = body;

    if (!contactIds || !Array.isArray(contactIds)) {
      return NextResponse.json(
        { success: false, error: 'Contact IDs are required' },
        { status: 400 },
      );
    }

    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 },
      );
    }

    // 1. Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 2. Get user's business context
    const { data: teamMember, error: teamError } = await supabase
      .from('team_members')
      .select('business_id, role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (teamError || !teamMember) {
      return NextResponse.json(
        { success: false, error: 'No active business membership found' },
        { status: 403 },
      );
    }

    // 3. Verify campaign belongs to the business
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, business_id')
      .eq('id', campaignId)
      .eq('business_id', teamMember.business_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found or access denied' },
        { status: 404 },
      );
    }

    // 4. Fetch selected contacts from Salesforce and save as leads
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('business_id', teamMember.business_id)
      .eq('type', 'crm')
      .eq('name', 'Salesforce')
      .eq('status', 'active')  // Fixed: callback sets 'active', not 'connected'
      .single();

    if (!integration) {
      return NextResponse.json(
        { success: false, error: 'Salesforce integration not found' },
        { status: 404 },
      );
    }

    const config = integration.config as { instanceUrl: string; apiVersion: string };
    const credentials = integration.credentials as {
      accessToken: string;
      refreshToken: string;
      tokenType: string;
    };

    // Fetch full contact details for selected contacts
    const contactIdsString = contactIds.map(id => `'${id}'`).join(',');
    const soqlQuery = `SELECT Id,FirstName,LastName,Email,Phone,Title,Department,Account.Name FROM Contact WHERE Id IN (${contactIdsString})`;
    const queryUrl = `${config.instanceUrl}/services/data/${config.apiVersion}/query?q=${encodeURIComponent(soqlQuery)}`;

    const salesforceResponse = await fetch(queryUrl, {
      headers: {
        'Authorization': `${credentials.tokenType} ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!salesforceResponse.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch contact details' },
        { status: 500 },
      );
    }

    const salesforceData = await salesforceResponse.json();
    const contacts = mapSalesforceContacts(salesforceData.records);

    // Insert contacts as leads for the specified campaign
    const leads = contacts.map(contact => ({
      id: crypto.randomUUID(),
      campaign_id: campaignId,
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      company: contact.company,
      status: 'imported',
      notes: `Imported from Salesforce. ID: ${contact.id}`,
      attempts: 0,
      dnc: false,
      created_by: user.id,
      updated_by: user.id,
    }));

    const { error: insertError } = await supabase
      .from('leads')
      .insert(leads);

    if (insertError) {
      console.error('Failed to import contacts:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to import contacts' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      imported: leads.length,
    });
  } catch (error) {
    console.error('Salesforce contacts import error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSalesforceContacts(records: any[]): any[] {
  return records.map(record => ({
    id: record.Id,
    name: `${record.FirstName || ''} ${record.LastName || ''}`.trim(),
    email: record.Email,
    phone: record.Phone,
    title: record.Title,
    department: record.Department,
    company: record.Account?.Name,
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function refreshSalesforceToken(integration: any, supabase: any) {
  try {
    const credentials = integration.credentials as {
      clientId: string;
      clientSecret: string;
      refreshToken: string;
    };

    // Use database-stored credentials first, fall back to env vars
    const clientId = credentials?.clientId || process.env.SALESFORCE_CLIENT_ID;
    const clientSecret = credentials?.clientSecret || process.env.SALESFORCE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing client credentials for token refresh');
      return null;
    }

    // Determine the correct token URL based on environment
    const config = integration.config as { env?: string } | null;
    const environment = config?.env || 'production';
    const loginUrl = environment === 'sandbox'
      ? 'https://test.salesforce.com'
      : 'https://login.salesforce.com';
    const tokenUrl = `${loginUrl}/services/oauth2/token`;
    const tokenParams = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: credentials.refreshToken,
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (!response.ok) {
      return null;
    }

    const tokenData = await response.json();

    // Update integration with new token
    await supabase
      .from('integrations')
      .update({
        credentials: {
          ...credentials,
          accessToken: tokenData.access_token,
          tokenType: tokenData.token_type,
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    return {
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}