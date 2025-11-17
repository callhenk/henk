// Cron-driven Salesforce lead sync orchestrator
// - Syncs both Salesforce Contacts and Leads to unified leads table
// - Creates and manages lead lists
// - Handles token refresh and incremental sync
// Skip type declarations - Deno handles this
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import {
  buildContactQuery,
  buildLeadQuery,
  isValidContact,
  isValidLead,
  mapSalesforceContactToLead,
  mapSalesforceLeadToLead,
  sanitizeLead,
} from './lead-mapper.ts';
import {
  addLeadToList,
  ensureSalesforceList,
  updateLeadListCounts,
} from './list-manager.ts';
import { SalesforceClient } from './salesforce-client.ts';
import type {
  Integration,
  SalesforceContact,
  SalesforceLead,
  SyncResult,
} from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function processTick() {
  const nowIso = new Date().toISOString();
  console.log(`[sync-salesforce-leads] tick at ${nowIso}`);

  // Get all active Salesforce integrations
  const { data: integrations, error: integrationsError } = await supabase
    .from('integrations')
    .select('*')
    .eq('type', 'crm')
    .eq('name', 'Salesforce')
    .eq('status', 'active');

  if (integrationsError) {
    console.error('Failed to fetch integrations:', integrationsError);
    return { ok: false, error: 'failed to fetch integrations' };
  }

  if (!integrations || integrations.length === 0) {
    console.log(
      '[sync-salesforce-leads] No active Salesforce integrations found',
    );
    return { ok: true, message: 'no active integrations' };
  }

  console.log(
    `[sync-salesforce-leads] found ${integrations.length} active integration(s)`,
  );

  // Filter integrations where syncEnabled is true
  const enabledIntegrations = integrations.filter((integration) => {
    const config = integration.config as Integration['config'];
    return config.syncEnabled !== false; // Sync is enabled by default
  });

  if (enabledIntegrations.length === 0) {
    console.log('[sync-salesforce-leads] No integrations have sync enabled');
    return { ok: true, message: 'no integrations with sync enabled' };
  }

  console.log(
    `[sync-salesforce-leads] syncing ${enabledIntegrations.length} integration(s)`,
  );

  // Sync each integration
  const results: SyncResult[] = [];

  for (const integration of enabledIntegrations) {
    try {
      const result = await syncIntegration(integration as Integration);
      results.push(result);
    } catch (error) {
      console.error(
        `[sync] failed integration_id=${integration.id}`,
        error instanceof Error ? error.message : 'Unknown error',
      );

      results.push({
        integration_id: integration.id,
        business_id: integration.business_id,
        status: 'failed',
        records_processed: 0,
        records_created: 0,
        records_updated: 0,
        records_failed: 0,
        duration_ms: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  const successCount = results.filter((r) => r.status === 'success').length;
  console.log(
    `[sync-salesforce-leads] completed synced=${enabledIntegrations.length} successful=${successCount}`,
  );

  return { ok: true, synced: enabledIntegrations.length, results };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }

  try {
    const result = await processTick();
    return new Response(JSON.stringify(result), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e) {
    console.error('sync-salesforce-leads error', e);
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});

/**
 * Syncs leads for a single integration (both Contacts and Leads)
 * @param integration Integration record
 * @returns Sync result
 */
async function syncIntegration(integration: Integration): Promise<SyncResult> {
  const startTime = Date.now();
  const logId = crypto.randomUUID();

  console.log(
    `[sync] starting integration_id=${integration.id} business_id=${integration.business_id}`,
  );

  // Create sync log entry
  await supabase.from('sync_logs').insert({
    id: logId,
    integration_id: integration.id,
    business_id: integration.business_id,
    sync_type: 'incremental',
    sync_status: 'running',
    started_at: new Date().toISOString(),
    records_processed: 0,
    records_created: 0,
    records_updated: 0,
    records_failed: 0,
  });

  try {
    // Initialize Salesforce client
    const sfClient = new SalesforceClient(integration, supabase);

    // Build SOQL queries for incremental sync
    const maxRecords = parseInt(Deno.env.get('MAX_RECORDS_PER_SYNC') || '2000');
    const contactSoql = buildContactQuery(
      integration.last_sync_at || null,
      maxRecords,
    );
    const leadSoql = buildLeadQuery(
      integration.last_sync_at || null,
      maxRecords,
    );

    // Fetch Contacts from Salesforce
    console.log(`[sync] fetching Contacts integration_id=${integration.id}`);

    const contactData = await sfClient.query(contactSoql);
    const contacts = (contactData.records || []) as SalesforceContact[];

    console.log(
      `[sync] fetched Contacts integration_id=${integration.id} count=${contacts.length}`,
    );

    // Fetch Leads from Salesforce
    console.log(`[sync] fetching Leads integration_id=${integration.id}`);

    const leadData = await sfClient.query(leadSoql);
    const leads = (leadData.records || []) as SalesforceLead[];

    console.log(
      `[sync] fetched Leads integration_id=${integration.id} count=${leads.length}`,
    );

    // Ensure lead lists exist
    const contactListId = await ensureSalesforceList(
      supabase,
      integration.business_id,
      'Salesforce Contacts',
      'Automatically synced from Salesforce Contacts',
    );

    const leadListId = await ensureSalesforceList(
      supabase,
      integration.business_id,
      'Salesforce Leads',
      'Automatically synced from Salesforce Leads',
    );

    // Transform and upsert all records
    let created = 0;
    let updated = 0;
    let failed = 0;

    // Process Contacts
    for (const sfContact of contacts) {
      try {
        // Validate contact
        if (!isValidContact(sfContact)) {
          console.log(
            `[sync] skipping invalid contact integration_id=${integration.id} contactId=${sfContact.Id}`,
          );
          failed++;
          continue;
        }

        console.log(
          `[sync] processing contact integration_id=${integration.id} contactId=${sfContact.Id}`,
        );

        // Map and sanitize
        const mappedLead = mapSalesforceContactToLead(
          sfContact,
          integration.business_id,
        );
        const sanitizedLead = sanitizeLead(mappedLead);

        // Check if lead exists
        const { data: existing } = await supabase
          .from('leads')
          .select('id, created_at, updated_at')
          .eq('business_id', integration.business_id)
          .eq('source', 'salesforce_contact')
          .eq('source_id', sfContact.Id)
          .maybeSingle();

        // Upsert lead
        const { data: upsertedLead, error: upsertError } = await supabase
          .from('leads')
          .upsert(sanitizedLead, {
            onConflict: 'business_id,source,source_id',
          })
          .select('id')
          .single();

        if (upsertError) {
          console.error(
            `[sync] failed to upsert contact integration_id=${integration.id} contactId=${sfContact.Id}`,
            upsertError.message,
          );
          failed++;
        } else {
          // Add to contact list
          if (upsertedLead?.id) {
            await addLeadToList(supabase, contactListId, upsertedLead.id);
          }

          // Determine if it was a create or update
          if (existing) {
            updated++;
          } else {
            created++;
          }
        }
      } catch (error) {
        console.error(
          `[sync] error processing contact integration_id=${integration.id} contactId=${sfContact.Id}`,
          error instanceof Error ? error.message : 'Unknown error',
        );
        failed++;
      }
    }

    // Process Leads
    for (const sfLead of leads) {
      try {
        // Validate lead
        if (!isValidLead(sfLead)) {
          console.log(
            `[sync] skipping invalid lead integration_id=${integration.id} leadId=${sfLead.Id}`,
          );
          failed++;
          continue;
        }

        // Map and sanitize
        const mappedLead = mapSalesforceLeadToLead(
          sfLead,
          integration.business_id,
        );
        const sanitizedLead = sanitizeLead(mappedLead);

        // Check if lead exists
        const { data: existing } = await supabase
          .from('leads')
          .select('id, created_at, updated_at')
          .eq('business_id', integration.business_id)
          .eq('source', 'salesforce_lead')
          .eq('source_id', sfLead.Id)
          .maybeSingle();

        // Upsert lead
        const { data: upsertedLead, error: upsertError } = await supabase
          .from('leads')
          .upsert(sanitizedLead, {
            onConflict: 'business_id,source,source_id',
          })
          .select('id')
          .single();

        if (upsertError) {
          console.error(
            `[sync] failed to upsert lead integration_id=${integration.id} leadId=${sfLead.Id}`,
            upsertError.message,
          );
          failed++;
        } else {
          // Add to lead list
          if (upsertedLead?.id) {
            await addLeadToList(supabase, leadListId, upsertedLead.id);
          }

          // Determine if it was a create or update
          if (existing) {
            updated++;
          } else {
            created++;
          }
        }
      } catch (error) {
        console.error(
          `[sync] error processing lead integration_id=${integration.id} leadId=${sfLead.Id}`,
          error instanceof Error ? error.message : 'Unknown error',
        );
        failed++;
      }
    }

    // Update lead list counts
    await updateLeadListCounts(supabase, [contactListId, leadListId]);

    // Update integration last_sync_at
    await supabase
      .from('integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    // Update sync log
    const duration = Date.now() - startTime;
    const totalProcessed = contacts.length + leads.length;
    const status =
      failed > 0 && created === 0 && updated === 0
        ? 'failed'
        : failed > 0
          ? 'partial'
          : 'success';

    await supabase
      .from('sync_logs')
      .update({
        sync_status: status,
        records_processed: totalProcessed,
        records_created: created,
        records_updated: updated,
        records_failed: failed,
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        metadata: {
          contacts_synced: contacts.length,
          leads_synced: leads.length,
        },
      })
      .eq('id', logId);

    console.log(
      `[sync] completed integration_id=${integration.id} status=${status} processed=${totalProcessed} created=${created} updated=${updated} failed=${failed} contacts=${contacts.length} leads=${leads.length} duration_ms=${duration}`,
    );

    return {
      integration_id: integration.id,
      business_id: integration.business_id,
      status,
      records_processed: totalProcessed,
      records_created: created,
      records_updated: updated,
      records_failed: failed,
      duration_ms: duration,
      metadata: {
        contacts_synced: contacts.length,
        leads_synced: leads.length,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    console.error(
      `[sync] failed integration_id=${integration.id} error=${errorMessage} duration_ms=${duration}`,
    );

    // Update sync log with error
    await supabase
      .from('sync_logs')
      .update({
        sync_status: 'failed',
        completed_at: new Date().toISOString(),
        duration_ms: duration,
        error_message: errorMessage,
        error_details: {
          stack: error instanceof Error ? error.stack : undefined,
        },
      })
      .eq('id', logId);

    throw error;
  }
}
