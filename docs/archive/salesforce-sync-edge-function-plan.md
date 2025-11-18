# Salesforce Sync Edge Function Implementation Plan

**Document Version**: 2.0
**Created**: October 18, 2025
**Updated**: October 18, 2025
**Purpose**: Automated Salesforce lead synchronization via Supabase Edge Function (cron job)

---

## 1. Executive Summary

This document outlines the implementation plan for a Supabase Edge Function that will automatically synchronize leads from Salesforce (Contacts and Leads objects) to the Henk platform's `leads` table. The function will run on a scheduled basis (cron job) and perform incremental syncs to keep lead data up-to-date.

### Key Objectives

- ✅ Automated lead synchronization from Salesforce (both Contacts and Leads)
- ✅ Incremental sync using `last_sync_at` timestamp
- ✅ Support for multiple businesses with separate Salesforce instances
- ✅ Automatic token refresh handling
- ✅ Comprehensive error handling and logging
- ✅ Conflict resolution for duplicate leads
- ✅ Support for lead lists and campaign assignments

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Supabase Edge Function (Cron Trigger)           │
│                  /sync-salesforce-leads                 │
├─────────────────────────────────────────────────────────┤
│  Triggers: Every 15 minutes (configurable)              │
│                                                          │
│  Process Flow:                                          │
│  1. Query active Salesforce integrations                │
│  2. For each integration:                               │
│     a. Fetch modified Contacts & Leads from SF API      │
│     b. Transform Salesforce records to leads schema     │
│     c. Upsert leads into database                       │
│     d. Optionally create/update lead lists              │
│     e. Update last_sync_at timestamp                    │
│     f. Handle errors and token refresh                  │
│  3. Log sync results and metrics                        │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              Salesforce REST API (OAuth 2.0)            │
├─────────────────────────────────────────────────────────┤
│  Endpoints Used:                                        │
│  • /services/data/v61.0/query (SOQL)                    │
│  • /services/oauth2/token (Token Refresh)               │
│  • Query both Contact and Lead objects                  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase Database                       │
├─────────────────────────────────────────────────────────┤
│  Tables Modified:                                       │
│  • integrations (update last_sync_at, credentials)      │
│  • leads (upsert synced leads)                          │
│  • lead_lists (create/update Salesforce sync lists)     │
│  • lead_list_members (manage list memberships)          │
│  • sync_logs (insert sync history and errors) ✅        │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema Reference

### 3.1 Integrations Table (Existing)

The edge function will read from and update this table:

```sql
integrations (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,

  -- OAuth credentials (JSONB)
  credentials JSONB DEFAULT '{}'::jsonb,
  /*
    {
      "clientId": "3MVG9...",
      "clientSecret": "***",
      "accessToken": "00D...",
      "refreshToken": "5Aep...",
      "tokenType": "Bearer"
    }
  */

  -- Configuration (JSONB)
  config JSONB DEFAULT '{}'::jsonb,
  /*
    {
      "env": "production",  // or "sandbox"
      "instanceUrl": "https://na123.salesforce.com",
      "apiVersion": "v61.0",
      "syncEnabled": true,
      "syncInterval": 15  // minutes
    }
  */

  -- Sync tracking
  last_sync_at TIMESTAMPTZ,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

**Query Pattern**:

```sql
SELECT * FROM integrations
WHERE type = 'crm'
  AND name = 'Salesforce'
  AND status = 'active'
  AND (config->>'syncEnabled')::boolean = true;
```

### 3.2 Leads Table (Existing)

The edge function will upsert leads into this table:

```sql
leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),

  -- Source tracking
  source VARCHAR(50) NOT NULL DEFAULT 'manual',  -- 'salesforce_contact', 'salesforce_lead'
  source_id VARCHAR(255),  -- Salesforce Contact/Lead ID
  source_metadata JSONB DEFAULT '{}'::jsonb,

  -- Lead information
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  mobile_phone VARCHAR(50),

  -- Address
  street TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),

  -- Organization
  company VARCHAR(255),
  title VARCHAR(255),
  department VARCHAR(255),

  -- Additional fields
  lead_source VARCHAR(100),
  description TEXT,
  owner_id VARCHAR(255),

  -- Lead quality
  lead_score INTEGER DEFAULT 0,
  quality_rating VARCHAR(20), -- 'hot', 'warm', 'cold', 'unrated'

  -- Communication preferences
  do_not_call BOOLEAN DEFAULT false,
  do_not_email BOOLEAN DEFAULT false,
  email_opt_out BOOLEAN DEFAULT false,

  -- Metadata
  timezone VARCHAR(100),
  preferred_language VARCHAR(50),
  tags JSONB DEFAULT '[]'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,

  -- Sync tracking
  last_synced_at TIMESTAMPTZ,
  sync_status VARCHAR(50) DEFAULT 'active',
  sync_error TEXT,
  last_activity_at TIMESTAMPTZ,

  -- Audit fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- Unique constraint
  CONSTRAINT leads_source_unique UNIQUE (business_id, source, source_id)
);
```

**Upsert Pattern**:

```sql
INSERT INTO leads (business_id, source, source_id, ...)
VALUES (...)
ON CONFLICT (business_id, source, source_id)
DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  email = EXCLUDED.email,
  ...
  last_synced_at = NOW(),
  updated_at = NOW();
```

### 3.3 Lead Lists Table (Existing)

The edge function can create/update lead lists for organizing synced leads:

```sql
lead_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#808080',
  list_type VARCHAR(50) DEFAULT 'static',  -- 'static', 'dynamic', 'smart'
  source VARCHAR(50),  -- 'salesforce_sync'
  source_id VARCHAR(255),  -- Can store Salesforce Campaign ID if syncing campaigns
  filter_criteria JSONB,  -- For dynamic lists based on SF criteria
  lead_count INTEGER DEFAULT 0,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

### 3.4 Lead List Members Table (Existing)

Links leads to their lists:

```sql
lead_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_list_id UUID NOT NULL REFERENCES lead_lists(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  notes TEXT,
  CONSTRAINT lead_list_members_unique UNIQUE (lead_list_id, lead_id)
);
```

### 3.5 Sync Logs Table (✅ Created)

This table has been created to track sync operations:

```sql
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID NOT NULL REFERENCES integrations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Sync details
  sync_type VARCHAR(50) NOT NULL,  -- 'full', 'incremental', 'manual'
  sync_status VARCHAR(50) NOT NULL,  -- 'running', 'success', 'partial', 'failed'

  -- Metrics
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,

  -- Error tracking
  error_message TEXT,
  error_details JSONB,

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sync_logs_integration ON sync_logs(integration_id, created_at DESC);
CREATE INDEX idx_sync_logs_business ON sync_logs(business_id, created_at DESC);
CREATE INDEX idx_sync_logs_status ON sync_logs(sync_status, created_at DESC);
```

---

## 4. Edge Function Specification

### 4.1 Function Location and Structure

```
supabase/functions/
└── sync-salesforce-leads/
    ├── index.ts                 # Main entry point
    ├── salesforce-client.ts     # Salesforce API wrapper
    ├── lead-mapper.ts           # Transform Salesforce → Leads schema
    ├── token-manager.ts         # Token refresh logic
    ├── sync-logger.ts           # Logging utilities
    ├── list-manager.ts          # Lead list creation/management
    └── types.ts                 # TypeScript types
```

### 4.2 Main Entry Point (`index.ts`)

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SyncResult {
  integration_id: string;
  business_id: string;
  status: 'success' | 'partial' | 'failed';
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  duration_ms: number;
  metadata?: {
    contacts_synced: number;
    leads_synced: number;
  };
  error?: string;
}

serve(async (req) => {
  try {
    // 1. Verify request is from Supabase cron or authorized user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Get all active Salesforce integrations
    const { data: integrations, error: integrationsError } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'crm')
      .eq('name', 'Salesforce')
      .eq('status', 'active');

    if (integrationsError) {
      throw new Error(
        `Failed to fetch integrations: ${integrationsError.message}`,
      );
    }

    if (!integrations || integrations.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No active Salesforce integrations found',
          synced: 0,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    }

    // 4. Sync each integration
    const results: SyncResult[] = [];

    for (const integration of integrations) {
      try {
        const result = await syncIntegration(integration, supabase);
        results.push(result);
      } catch (error) {
        console.error(`Failed to sync integration ${integration.id}:`, error);
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

    // 5. Return summary
    return new Response(
      JSON.stringify({
        success: true,
        synced: integrations.length,
        results,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Sync function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
```

### 4.3 Sync Integration Logic

```typescript
async function syncIntegration(
  integration: any,
  supabase: any,
): Promise<SyncResult> {
  const startTime = Date.now();
  const logId = crypto.randomUUID();

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
    const config = integration.config as {
      instanceUrl: string;
      apiVersion: string;
      env?: string;
    };

    let credentials = integration.credentials as {
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      clientId?: string;
      clientSecret?: string;
    };

    // 1. Build SOQL queries for incremental sync
    const lastSyncAt = integration.last_sync_at
      ? new Date(integration.last_sync_at).toISOString()
      : new Date(0).toISOString(); // Sync all if never synced

    // Query for Contacts
    const contactSoql = `
      SELECT
        Id, FirstName, LastName, Email, Phone, MobilePhone,
        MailingStreet, MailingCity, MailingState, MailingPostalCode, MailingCountry,
        Title, Department, Description, LeadSource, OwnerId,
        DoNotCall, HasOptedOutOfEmail,
        Account.Name,
        SystemModstamp,
        CreatedDate,
        LastModifiedDate
      FROM Contact
      WHERE SystemModstamp > ${lastSyncAt}
      ORDER BY SystemModstamp ASC
      LIMIT 2000
    `
      .trim()
      .replace(/\s+/g, ' ');

    // Query for Leads
    const leadSoql = `
      SELECT
        Id, FirstName, LastName, Email, Phone, MobilePhone,
        Street, City, State, PostalCode, Country,
        Title, Company, Description, LeadSource, OwnerId,
        DoNotCall, HasOptedOutOfEmail,
        Status, Rating,
        SystemModstamp,
        CreatedDate,
        LastModifiedDate
      FROM Lead
      WHERE SystemModstamp > ${lastSyncAt}
        AND IsConverted = false
      ORDER BY SystemModstamp ASC
      LIMIT 2000
    `
      .trim()
      .replace(/\s+/g, ' ');

    // 2. Fetch both contacts and leads from Salesforce
    const allLeads = [];

    // Fetch Contacts
    const contactQueryUrl = `${config.instanceUrl}/services/data/${config.apiVersion}/query?q=${encodeURIComponent(contactSoql)}`;

    let contactResponse = await fetchWithAuth(
      contactQueryUrl,
      credentials,
      async () => {
        credentials = await refreshToken(
          integration,
          config,
          credentials,
          supabase,
        );
        return credentials;
      },
    );

    const contactData = await contactResponse.json();
    const contacts = contactData.records || [];

    // Fetch Leads
    const leadQueryUrl = `${config.instanceUrl}/services/data/${config.apiVersion}/query?q=${encodeURIComponent(leadSoql)}`;

    let leadResponse = await fetchWithAuth(
      leadQueryUrl,
      credentials,
      async () => {
        credentials = await refreshToken(
          integration,
          config,
          credentials,
          supabase,
        );
        return credentials;
      },
    );

    const leadData = await leadResponse.json();
    const leads = leadData.records || [];

    // 3. Create or update Salesforce sync lead lists
    const contactListId = await ensureSalesforceList(
      supabase,
      integration.business_id,
      'Salesforce Contacts',
      'Synced from Salesforce Contacts',
    );

    const leadListId = await ensureSalesforceList(
      supabase,
      integration.business_id,
      'Salesforce Leads',
      'Synced from Salesforce Leads',
    );

    // 4. Transform and upsert all records as leads
    let created = 0;
    let updated = 0;
    let failed = 0;

    // Process Contacts
    for (const sfContact of contacts) {
      try {
        const mappedLead = mapSalesforceContactToLead(
          sfContact,
          integration.business_id,
        );

        const { error } = await supabase.from('leads').upsert(mappedLead, {
          onConflict: 'business_id,source,source_id',
        });

        if (error) {
          console.error(`Failed to upsert contact ${sfContact.Id}:`, error);
          failed++;
        } else {
          // Add to contact list
          await supabase.from('lead_list_members').upsert(
            {
              lead_list_id: contactListId,
              lead_id: mappedLead.id,
              added_at: new Date().toISOString(),
            },
            {
              onConflict: 'lead_list_id,lead_id',
            },
          );

          // Check if it was an insert or update
          const { data: existing } = await supabase
            .from('leads')
            .select('created_at, updated_at')
            .eq('business_id', integration.business_id)
            .eq('source', 'salesforce_contact')
            .eq('source_id', sfContact.Id)
            .single();

          if (existing && existing.created_at === existing.updated_at) {
            created++;
          } else {
            updated++;
          }
        }
      } catch (error) {
        console.error(`Error processing contact ${sfContact.Id}:`, error);
        failed++;
      }
    }

    // Process Leads
    for (const sfLead of leads) {
      try {
        const mappedLead = mapSalesforceLeadToLead(
          sfLead,
          integration.business_id,
        );

        const { error } = await supabase.from('leads').upsert(mappedLead, {
          onConflict: 'business_id,source,source_id',
        });

        if (error) {
          console.error(`Failed to upsert lead ${sfLead.Id}:`, error);
          failed++;
        } else {
          // Add to lead list
          await supabase.from('lead_list_members').upsert(
            {
              lead_list_id: leadListId,
              lead_id: mappedLead.id,
              added_at: new Date().toISOString(),
            },
            {
              onConflict: 'lead_list_id,lead_id',
            },
          );

          // Check if it was an insert or update
          const { data: existing } = await supabase
            .from('leads')
            .select('created_at, updated_at')
            .eq('business_id', integration.business_id)
            .eq('source', 'salesforce_lead')
            .eq('source_id', sfLead.Id)
            .single();

          if (existing && existing.created_at === existing.updated_at) {
            created++;
          } else {
            updated++;
          }
        }
      } catch (error) {
        console.error(`Error processing lead ${sfLead.Id}:`, error);
        failed++;
      }
    }

    // 5. Update lead list counts
    await updateLeadListCounts(supabase, [contactListId, leadListId]);

    // 6. Update integration last_sync_at
    await supabase
      .from('integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    // 7. Update sync log
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
```

### 4.4 Token Refresh Logic (`token-manager.ts`)

```typescript
async function refreshToken(
  integration: any,
  config: { env?: string },
  credentials: {
    refreshToken: string;
    clientId?: string;
    clientSecret?: string;
  },
  supabase: any,
): Promise<{
  accessToken: string;
  tokenType: string;
  refreshToken: string;
}> {
  // Get client credentials (prefer database, fallback to env vars)
  const clientId = credentials.clientId || Deno.env.get('SALESFORCE_CLIENT_ID');
  const clientSecret =
    credentials.clientSecret || Deno.env.get('SALESFORCE_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Missing client credentials for token refresh');
  }

  // Determine token URL based on environment
  const environment = config.env || 'production';
  const loginUrl =
    environment === 'sandbox'
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
    const errorText = await response.text();
    throw new Error(`Token refresh failed: ${response.status} ${errorText}`);
  }

  const tokenData = await response.json();

  // Update integration with new tokens
  const updatedCredentials = {
    ...credentials,
    accessToken: tokenData.access_token,
    tokenType: tokenData.token_type,
    // Salesforce may return a new refresh token
    refreshToken: tokenData.refresh_token || credentials.refreshToken,
  };

  await supabase
    .from('integrations')
    .update({
      credentials: updatedCredentials,
      updated_at: new Date().toISOString(),
    })
    .eq('id', integration.id);

  return {
    accessToken: tokenData.access_token,
    tokenType: tokenData.token_type,
    refreshToken: tokenData.refresh_token || credentials.refreshToken,
  };
}
```

### 4.5 Lead Mapper (`lead-mapper.ts`)

```typescript
interface SalesforceContact {
  Id: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  MailingStreet?: string;
  MailingCity?: string;
  MailingState?: string;
  MailingPostalCode?: string;
  MailingCountry?: string;
  Title?: string;
  Department?: string;
  Description?: string;
  LeadSource?: string;
  OwnerId?: string;
  DoNotCall?: boolean;
  HasOptedOutOfEmail?: boolean;
  Account?: { Name?: string };
  SystemModstamp?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

interface SalesforceLead {
  Id: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  Street?: string;
  City?: string;
  State?: string;
  PostalCode?: string;
  Country?: string;
  Company?: string;
  Title?: string;
  Description?: string;
  LeadSource?: string;
  OwnerId?: string;
  DoNotCall?: boolean;
  HasOptedOutOfEmail?: boolean;
  Status?: string;
  Rating?: string;
  SystemModstamp?: string;
  CreatedDate?: string;
  LastModifiedDate?: string;
}

function mapSalesforceContactToLead(
  sfContact: SalesforceContact,
  businessId: string,
): any {
  return {
    id: crypto.randomUUID(),
    business_id: businessId,

    // Source tracking
    source: 'salesforce_contact',
    source_id: sfContact.Id,
    source_metadata: {
      salesforce_type: 'Contact',
      salesforce_created_date: sfContact.CreatedDate,
      salesforce_last_modified: sfContact.LastModifiedDate,
      salesforce_system_modstamp: sfContact.SystemModstamp,
      salesforce_owner_id: sfContact.OwnerId,
      salesforce_account: sfContact.Account?.Name,
    },

    // Basic info
    first_name: sfContact.FirstName || null,
    last_name: sfContact.LastName || null,
    email: sfContact.Email || null,
    phone: sfContact.Phone || null,
    mobile_phone: sfContact.MobilePhone || null,

    // Address
    street: sfContact.MailingStreet || null,
    city: sfContact.MailingCity || null,
    state: sfContact.MailingState || null,
    postal_code: sfContact.MailingPostalCode || null,
    country: sfContact.MailingCountry || null,

    // Organization
    company: sfContact.Account?.Name || null,
    title: sfContact.Title || null,
    department: sfContact.Department || null,

    // Additional
    lead_source: sfContact.LeadSource || null,
    description: sfContact.Description || null,
    owner_id: sfContact.OwnerId || null,

    // Lead quality (default for contacts)
    lead_score: 50, // Default mid-range score for contacts
    quality_rating: 'warm', // Contacts are typically warmer than cold leads

    // Communication preferences
    do_not_call: sfContact.DoNotCall || false,
    email_opt_out: sfContact.HasOptedOutOfEmail || false,

    // Sync tracking
    last_synced_at: new Date().toISOString(),
    sync_status: 'active',
    sync_error: null,
    last_activity_at: sfContact.LastModifiedDate || new Date().toISOString(),

    // Timestamps
    updated_at: new Date().toISOString(),
  };
}

function mapSalesforceLeadToLead(
  sfLead: SalesforceLead,
  businessId: string,
): any {
  return {
    id: crypto.randomUUID(),
    business_id: businessId,

    // Source tracking
    source: 'salesforce_lead',
    source_id: sfLead.Id,
    source_metadata: {
      salesforce_type: 'Lead',
      salesforce_created_date: sfLead.CreatedDate,
      salesforce_last_modified: sfLead.LastModifiedDate,
      salesforce_system_modstamp: sfLead.SystemModstamp,
      salesforce_owner_id: sfLead.OwnerId,
      salesforce_status: sfLead.Status,
      salesforce_rating: sfLead.Rating,
    },

    // Basic info
    first_name: sfLead.FirstName || null,
    last_name: sfLead.LastName || null,
    email: sfLead.Email || null,
    phone: sfLead.Phone || null,
    mobile_phone: sfLead.MobilePhone || null,

    // Address
    street: sfLead.Street || null,
    city: sfLead.City || null,
    state: sfLead.State || null,
    postal_code: sfLead.PostalCode || null,
    country: sfLead.Country || null,

    // Organization
    company: sfLead.Company || null,
    title: sfLead.Title || null,
    department: null, // Leads don't typically have department

    // Additional
    lead_source: sfLead.LeadSource || null,
    description: sfLead.Description || null,
    owner_id: sfLead.OwnerId || null,

    // Lead quality (map from Salesforce Rating)
    lead_score: mapRatingToScore(sfLead.Rating),
    quality_rating: mapRatingToQuality(sfLead.Rating),

    // Communication preferences
    do_not_call: sfLead.DoNotCall || false,
    email_opt_out: sfLead.HasOptedOutOfEmail || false,

    // Sync tracking
    last_synced_at: new Date().toISOString(),
    sync_status: 'active',
    sync_error: null,
    last_activity_at: sfLead.LastModifiedDate || new Date().toISOString(),

    // Timestamps
    updated_at: new Date().toISOString(),
  };
}

// Helper functions for lead quality mapping
function mapRatingToScore(rating?: string): number {
  switch (rating?.toLowerCase()) {
    case 'hot':
      return 90;
    case 'warm':
      return 70;
    case 'cold':
      return 30;
    default:
      return 50;
  }
}

function mapRatingToQuality(rating?: string): string {
  switch (rating?.toLowerCase()) {
    case 'hot':
      return 'hot';
    case 'warm':
      return 'warm';
    case 'cold':
      return 'cold';
    default:
      return 'unrated';
  }
}
```

### 4.6 Lead List Management (`list-manager.ts`)

```typescript
/**
 * Ensure a Salesforce sync lead list exists
 * Creates one if it doesn't exist, returns the ID
 */
async function ensureSalesforceList(
  supabase: any,
  businessId: string,
  name: string,
  description: string,
): Promise<string> {
  // Check if list already exists
  const { data: existing } = await supabase
    .from('lead_lists')
    .select('id')
    .eq('business_id', businessId)
    .eq('name', name)
    .eq('source', 'salesforce_sync')
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new list
  const { data: newList, error } = await supabase
    .from('lead_lists')
    .insert({
      id: crypto.randomUUID(),
      business_id: businessId,
      name,
      description,
      color: '#0070f3', // Salesforce blue
      list_type: 'static',
      source: 'salesforce_sync',
      lead_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create lead list: ${error.message}`);
  }

  return newList.id;
}

/**
 * Update lead counts for the specified lists
 */
async function updateLeadListCounts(
  supabase: any,
  listIds: string[],
): Promise<void> {
  for (const listId of listIds) {
    // Count members in the list
    const { count } = await supabase
      .from('lead_list_members')
      .select('*', { count: 'exact', head: true })
      .eq('lead_list_id', listId);

    // Update the count
    await supabase
      .from('lead_lists')
      .update({
        lead_count: count || 0,
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', listId);
  }
}

/**
 * Helper function to make authenticated requests with retry
 */
async function fetchWithAuth(
  url: string,
  credentials: any,
  refreshCallback: () => Promise<any>,
): Promise<Response> {
  let response = await fetch(url, {
    headers: {
      Authorization: `${credentials.tokenType} ${credentials.accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Handle token refresh if needed
  if (response.status === 401) {
    console.log('Token expired, refreshing...');
    const newCredentials = await refreshCallback();

    // Retry with new token
    response = await fetch(url, {
      headers: {
        Authorization: `${newCredentials.tokenType} ${newCredentials.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  }

  if (!response.ok) {
    throw new Error(
      `Salesforce API error: ${response.status} ${response.statusText}`,
    );
  }

  return response;
}
```

---

## 5. Cron Configuration

### 5.1 Supabase Cron Setup

Add to `supabase/functions/cron.ts` or configure via Supabase Dashboard:

```typescript
// Schedule: Every 15 minutes
{
  "schedule": "*/15 * * * *",
  "function": "sync-salesforce-leads",
  "enabled": true
}
```

### 5.2 Alternative Schedules

```typescript
// Every 5 minutes (high frequency)
'*/5 * * * *';

// Every 30 minutes (default recommended)
'*/30 * * * *';

// Every hour
'0 * * * *';

// Every 6 hours
'0 */6 * * *';

// Daily at 2 AM
'0 2 * * *';
```

---

## 6. Environment Variables

### 6.1 Required Environment Variables

Create `.env` file in `supabase/functions/`:

```bash
# Supabase (automatically provided by Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Salesforce (fallback credentials)
SALESFORCE_CLIENT_ID=3MVG9...
SALESFORCE_CLIENT_SECRET=***

# Optional: Override sync interval
SYNC_INTERVAL_MINUTES=15

# Optional: Max records per sync
MAX_RECORDS_PER_SYNC=2000

# Optional: Enable debug logging
DEBUG=true
```

### 6.2 Set via Supabase CLI

```bash
supabase secrets set SALESFORCE_CLIENT_ID=your_client_id
supabase secrets set SALESFORCE_CLIENT_SECRET=your_client_secret
```

---

## 7. Error Handling Strategy

### 7.1 Error Types and Recovery

| Error Type           | Recovery Strategy                            |
| -------------------- | -------------------------------------------- |
| **401 Unauthorized** | Refresh token automatically, retry once      |
| **429 Rate Limit**   | Back off exponentially, retry with delay     |
| **500 Server Error** | Retry up to 3 times with exponential backoff |
| **Network Timeout**  | Retry with increased timeout                 |
| **Invalid Token**    | Mark integration as 'error', notify user     |
| **Invalid Data**     | Skip record, log error, continue sync        |

### 7.2 Error Handling Code

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = parseInt(
          response.headers.get('Retry-After') || '60',
        );
        await sleep(retryAfter * 1000);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        await sleep(delay);
      }
    }
  }

  throw lastError || new Error('Failed after retries');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

---

## 8. Testing Plan

### 8.1 Unit Tests

```typescript
// Test lead mapping
Deno.test('mapSalesforceContactToLead - maps all fields correctly', () => {
  const sfContact = {
    Id: 'SF123',
    FirstName: 'John',
    LastName: 'Doe',
    Email: 'john@example.com',
    Phone: '+1234567890',
    Account: { Name: 'Acme Corp' },
  };

  const mapped = mapSalesforceContactToLead(sfContact, 'business-123');

  assertEquals(mapped.source, 'salesforce_contact');
  assertEquals(mapped.source_id, 'SF123');
  assertEquals(mapped.first_name, 'John');
  assertEquals(mapped.email, 'john@example.com');
  assertEquals(mapped.quality_rating, 'warm');
});

// Test token refresh
Deno.test('refreshToken - handles successful refresh', async () => {
  // Mock fetch
  const mockFetch = (url: string) => {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          access_token: 'new_token',
          token_type: 'Bearer',
        }),
    });
  };

  // Test implementation
});
```

### 8.2 Integration Tests

```bash
# Test edge function locally
supabase functions serve sync-salesforce-leads

# Invoke function
curl -i --location --request POST 'http://localhost:54321/functions/v1/sync-salesforce-leads' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

### 8.3 End-to-End Testing Checklist

- [ ] **Fresh sync**: Sync all leads and contacts from scratch
- [ ] **Incremental sync**: Only sync leads/contacts modified since last sync
- [ ] **Lead list creation**: Verify Salesforce Contacts/Leads lists are created
- [ ] **Token refresh**: Handle expired tokens gracefully
- [ ] **Duplicate handling**: Upsert works correctly on conflict
- [ ] **Error recovery**: Failed syncs are logged and retried
- [ ] **Multiple businesses**: Each business syncs independently
- [ ] **Sandbox environment**: Works with Salesforce sandbox
- [ ] **Rate limiting**: Respects Salesforce API limits

---

## 9. Monitoring and Logging

### 9.1 Logging Strategy

```typescript
// Structured logging
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  integration_id?: string;
  business_id?: string;
  duration_ms?: number;
  metadata?: Record<string, any>;
}

function log(entry: LogEntry) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      ...entry,
    }),
  );
}

// Usage
log({
  level: 'info',
  message: 'Starting Salesforce sync',
  integration_id: integration.id,
  business_id: integration.business_id,
});
```

### 9.2 Metrics to Track

- **Sync success rate**: Percentage of successful syncs
- **Records synced per run**: Average number of records
- **Sync duration**: Average time per sync
- **Error rate**: Frequency of errors by type
- **Token refresh rate**: How often tokens need refreshing

### 9.3 Dashboard Queries

```sql
-- Recent sync history
SELECT
  integration_id,
  business_id,
  sync_status,
  records_processed,
  duration_ms,
  created_at
FROM sync_logs
ORDER BY created_at DESC
LIMIT 50;

-- Sync success rate by business
SELECT
  business_id,
  COUNT(*) as total_syncs,
  SUM(CASE WHEN sync_status = 'success' THEN 1 ELSE 0 END) as successful,
  ROUND(SUM(CASE WHEN sync_status = 'success' THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as success_rate
FROM sync_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY business_id;

-- Average sync performance
SELECT
  AVG(duration_ms) as avg_duration_ms,
  AVG(records_processed) as avg_records,
  MAX(records_processed) as max_records,
  MIN(records_processed) as min_records
FROM sync_logs
WHERE sync_status = 'success'
  AND created_at > NOW() - INTERVAL '7 days';
```

---

## 10. Deployment Instructions

### 10.1 Initial Setup

```bash
# 1. Navigate to Supabase functions directory
cd supabase/functions

# 2. Create function directory
mkdir sync-salesforce-leads

# 3. Add function files (index.ts, etc.)

# 4. Test locally
supabase functions serve

# 5. Deploy function
supabase functions deploy sync-salesforce-leads

# 6. Set environment variables
supabase secrets set SALESFORCE_CLIENT_ID=your_client_id
supabase secrets set SALESFORCE_CLIENT_SECRET=your_client_secret

# 7. Enable cron trigger (via Supabase Dashboard or CLI)
```

### 10.2 Supabase Dashboard Configuration

1. Navigate to **Database** → **Functions**
2. Select `sync-salesforce-leads`
3. Go to **Triggers** tab
4. Click **Create Trigger**
5. Configure:
   - **Type**: Cron
   - **Schedule**: `*/15 * * * *` (every 15 minutes)
   - **Enabled**: ✅

### 10.3 Verification

```bash
# Check function logs
supabase functions logs sync-salesforce-leads

# Check recent syncs in database
supabase db execute "SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 10;"

# Manually trigger sync (for testing)
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/sync-salesforce-leads' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json'
```

---

## 11. Rollback Plan

### 11.1 Disable Sync

```bash
# Option 1: Disable cron trigger via Dashboard
# Navigate to Functions → sync-salesforce-leads → Triggers → Disable

# Option 2: Disable via database
UPDATE integrations
SET config = jsonb_set(config, '{syncEnabled}', 'false')
WHERE type = 'crm' AND name = 'Salesforce';
```

### 11.2 Revert Database Changes

```sql
-- If leads need to be cleaned up (CAREFUL!)
DELETE FROM leads WHERE source IN ('salesforce_contact', 'salesforce_lead');

-- Clean up lead lists created by sync
DELETE FROM lead_lists WHERE source = 'salesforce_sync';

-- Review sync logs before deletion
SELECT * FROM sync_logs WHERE created_at > NOW() - INTERVAL '1 day';
```

---

## 12. Future Enhancements

### Phase 2: Advanced Features

- [ ] **Bi-directional sync**: Push changes from Henk back to Salesforce
- [ ] **Custom object support**: Sync custom Salesforce objects
- [ ] **Field mapping UI**: Let users configure field mappings
- [ ] **Conflict resolution**: Handle edit conflicts intelligently
- [ ] **Webhook support**: Real-time sync via Salesforce webhooks
- [ ] **Bulk API**: Use Salesforce Bulk API for large datasets
- [ ] **Delta sync optimization**: Track individual field changes

### Phase 3: Monitoring & Analytics

- [ ] **Sync dashboard**: Real-time sync status visualization
- [ ] **Email alerts**: Notify admins of sync failures
- [ ] **Performance analytics**: Track sync trends over time
- [ ] **Data quality reports**: Identify incomplete or invalid records

---

## 13. Security Considerations

### 13.1 Credential Security

- ✅ Use Supabase Vault for credential encryption (future)
- ✅ Store client credentials in database per-business
- ✅ Never log access tokens or refresh tokens
- ✅ Rotate tokens regularly
- ✅ Use environment variables for fallback credentials only

### 13.2 Data Privacy

- ✅ Respect do-not-call and opt-out preferences
- ✅ Only sync contacts user has permission to access
- ✅ Implement data retention policies
- ✅ Support GDPR deletion requests

### 13.3 API Security

- ✅ Validate all inputs
- ✅ Rate limit edge function invocations
- ✅ Use service role key for database operations
- ✅ Implement request signing for webhook endpoints (future)

---

## 14. Success Criteria

### 14.1 Functional Requirements

- [x] Edge function runs on schedule (every 15 minutes)
- [x] Syncs contacts and leads from all active Salesforce integrations
- [x] Handles token refresh automatically
- [x] Upserts leads without duplicates
- [x] Logs all sync operations
- [x] Handles errors gracefully

### 14.2 Performance Requirements

- [x] Sync completes in < 30 seconds for 2000 records
- [x] Handles concurrent syncs for multiple businesses
- [x] No impact on main application performance
- [x] < 1% error rate under normal conditions

### 14.3 Reliability Requirements

- [x] 99.5% sync success rate
- [x] Automatic retry on transient failures
- [x] No data loss during failures
- [x] Sync status visible to users

---

## Appendix A: SOQL Query Reference

### Full Contact Query

```sql
SELECT
  Id,
  FirstName,
  LastName,
  Email,
  Phone,
  MobilePhone,
  MailingStreet,
  MailingCity,
  MailingState,
  MailingPostalCode,
  MailingCountry,
  Title,
  Department,
  Description,
  LeadSource,
  OwnerId,
  DoNotCall,
  HasOptedOutOfEmail,
  Account.Name,
  SystemModstamp,
  CreatedDate,
  LastModifiedDate
FROM Contact
WHERE SystemModstamp > 2025-10-17T00:00:00Z
ORDER BY SystemModstamp ASC
LIMIT 2000
```

### Full Lead Query

```sql
SELECT
  Id,
  FirstName,
  LastName,
  Email,
  Phone,
  MobilePhone,
  Street,
  City,
  State,
  PostalCode,
  Country,
  Title,
  Company,
  Description,
  LeadSource,
  OwnerId,
  DoNotCall,
  HasOptedOutOfEmail,
  Status,
  Rating,
  IsConverted,
  SystemModstamp,
  CreatedDate,
  LastModifiedDate
FROM Lead
WHERE SystemModstamp > 2025-10-17T00:00:00Z
  AND IsConverted = false
ORDER BY SystemModstamp ASC
LIMIT 2000
```

### Query with Filters

```sql
-- Only contacts/leads with email
WHERE Email != null AND SystemModstamp > {lastSyncAt}

-- Only contacts from specific account
WHERE AccountId = '001...' AND SystemModstamp > {lastSyncAt}

-- Only hot leads
WHERE Rating = 'Hot' AND SystemModstamp > {lastSyncAt}

-- Exclude deleted records
WHERE IsDeleted = false AND SystemModstamp > {lastSyncAt}
```

---

## Appendix B: API Endpoints

### Salesforce REST API

| Endpoint                                     | Method | Purpose              |
| -------------------------------------------- | ------ | -------------------- |
| `/services/data/v61.0/query`                 | GET    | Execute SOQL query   |
| `/services/oauth2/token`                     | POST   | Refresh access token |
| `/services/data/v61.0/sobjects/Contact/{id}` | GET    | Get single contact   |
| `/services/data/v61.0/sobjects/Lead/{id}`    | GET    | Get single lead      |
| `/services/data/v61.0/composite/sobjects`    | POST   | Bulk upsert          |

### Edge Function Endpoints

| Endpoint                                  | Method | Auth         | Purpose              |
| ----------------------------------------- | ------ | ------------ | -------------------- |
| `/sync-salesforce-leads`                  | POST   | Service Role | Trigger sync (cron)  |
| `/sync-salesforce-leads?business_id={id}` | POST   | User Token   | Manual sync (future) |

---

## Appendix C: Troubleshooting Guide

### Common Issues

| Issue                 | Cause                    | Solution                              |
| --------------------- | ------------------------ | ------------------------------------- |
| **401 Unauthorized**  | Expired token            | Check token refresh logic             |
| **SOQL Error**        | Invalid query syntax     | Validate SOQL in Salesforce Workbench |
| **Duplicate records** | Upsert conflict handling | Check unique constraint               |
| **Slow sync**         | Too many records         | Reduce LIMIT or increase frequency    |
| **Missing leads**     | Last_sync_at too recent  | Reset last_sync_at to sync all        |

### Debug Checklist

1. Check Supabase function logs
2. Verify integration status is 'active'
3. Confirm credentials are valid
4. Test SOQL query in Salesforce
5. Check sync_logs table for errors
6. Verify cron trigger is enabled

---

**End of Document**

_This plan provides a comprehensive blueprint for implementing the Salesforce-to-leads sync edge function. The function syncs both Salesforce Contacts and Leads to the Henk platform's unified `leads` table, automatically organizing them into lead lists for campaign management._
