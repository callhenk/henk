# Contacts & Lists System - Database Schema

## Overview

This document describes the database schema for syncing Salesforce contacts and organizing them into reusable lists for campaigns.

## Tables

### 1. `contacts`

**Purpose**: Master table for all contacts synced from Salesforce (and potentially other sources).

**Key Features**:
- Business-scoped (multi-tenant)
- Tracks source system (Salesforce, manual, CSV, etc.)
- Stores comprehensive contact information
- Supports flexible tagging and custom fields
- Tracks sync status and errors

**Fields**:
```sql
id                  UUID (PK)
business_id         UUID (FK -> businesses)
source              VARCHAR(50)      -- 'salesforce', 'manual', 'csv_import'
source_id           VARCHAR(255)     -- Salesforce Contact/Lead ID
source_metadata     JSONB            -- Additional Salesforce data
first_name          VARCHAR(255)
last_name           VARCHAR(255)
full_name           VARCHAR(500)
email               VARCHAR(255)
phone               VARCHAR(50)
mobile_phone        VARCHAR(50)
mailing_street      TEXT
mailing_city        VARCHAR(100)
mailing_state       VARCHAR(100)
mailing_postal_code VARCHAR(20)
mailing_country     VARCHAR(100)
account_name        VARCHAR(255)     -- Company name
title               VARCHAR(255)     -- Job title
department          VARCHAR(255)
lead_source         VARCHAR(100)
description         TEXT
owner_id            VARCHAR(255)     -- Salesforce owner
do_not_call         BOOLEAN
do_not_email        BOOLEAN
email_opt_out       BOOLEAN
timezone            VARCHAR(100)
preferred_language  VARCHAR(50)
tags                JSONB            -- ["major_donor", "alumni_2020"]
custom_fields       JSONB            -- Flexible custom data
last_synced_at      TIMESTAMPTZ
sync_status         VARCHAR(50)      -- 'active', 'deleted', 'error'
sync_error          TEXT
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
created_by          UUID
updated_by          UUID
```

**Constraints**:
- Must have at least one: phone, mobile_phone, or email
- Unique: (business_id, source, source_id) - prevents duplicate syncs

**Indexes**:
- business_id, source, source_id, email, phone, full_name, tags, last_synced_at

---

### 2. `contact_lists`

**Purpose**: Reusable lists for organizing contacts (e.g., "Major Donors", "Alumni 2020").

**Key Features**:
- Can be used across multiple campaigns
- Supports static (manual) and dynamic (rule-based) lists
- Tracks source (Salesforce Campaign, Report, CSV, etc.)
- Caches contact count for performance

**Fields**:
```sql
id                  UUID (PK)
business_id         UUID (FK -> businesses)
name                VARCHAR(255)
description         TEXT
color               VARCHAR(7)       -- Hex color: #FF5733
list_type           VARCHAR(50)      -- 'static', 'dynamic', 'smart'
source              VARCHAR(50)      -- 'salesforce_campaign', 'manual', etc.
source_id           VARCHAR(255)     -- Source system ID
filter_criteria     JSONB            -- For dynamic lists
contact_count       INTEGER          -- Cached count
last_updated_at     TIMESTAMPTZ
created_at          TIMESTAMPTZ
updated_at          TIMESTAMPTZ
created_by          UUID
updated_by          UUID
```

**List Types**:
- **static**: Manually added contacts
- **dynamic**: Rule-based (auto-updates based on criteria)
- **smart**: Query-based (filters from contact properties)

---

### 3. `contact_list_members`

**Purpose**: Many-to-many join table linking contacts to lists.

**Fields**:
```sql
id                  UUID (PK)
contact_list_id     UUID (FK -> contact_lists) ON DELETE CASCADE
contact_id          UUID (FK -> contacts) ON DELETE CASCADE
added_at            TIMESTAMPTZ
added_by            UUID
notes               TEXT
```

**Constraints**:
- Unique: (contact_list_id, contact_id) - prevents duplicates

---

### 4. `leads` (Updated)

**Purpose**: Campaign-specific contact instances with call status, attempts, etc.

**New Field**:
```sql
contact_id          UUID (FK -> contacts) ON DELETE SET NULL
```

**Relationship**:
- A lead is a campaign-specific instance of a contact
- When a contact is added to a campaign, a lead record is created
- Lead tracks campaign-specific data: status, attempts, pledges, etc.
- Contact holds the master data synced from Salesforce

---

## Data Flow

### Salesforce Sync Flow

```
┌─────────────────────┐
│  Salesforce API     │
│  (Contacts/Leads)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Sync Endpoint      │
│  /api/sync/sf       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  contacts table     │
│  - Upsert by        │
│    source_id        │
│  - Update metadata  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  contact_lists      │
│  (if syncing        │
│   campaigns/reports)│
└─────────────────────┘
```

### Campaign Creation Flow

```
User creates campaign
        │
        ▼
Select contact list(s)
        │
        ▼
For each contact in list:
  Create lead record
  - contact_id → contact
  - campaign_id → campaign
  - status = 'new'
  - attempts = 0
        │
        ▼
Campaign ready to start
```

---

## Example Queries

### 1. Sync Salesforce Contact

```typescript
// Upsert contact from Salesforce
const { data, error } = await supabase
  .from('contacts')
  .upsert({
    business_id: 'xxx',
    source: 'salesforce',
    source_id: sfContact.Id,
    first_name: sfContact.FirstName,
    last_name: sfContact.LastName,
    full_name: sfContact.Name,
    email: sfContact.Email,
    phone: sfContact.Phone,
    mobile_phone: sfContact.MobilePhone,
    account_name: sfContact.Account?.Name,
    title: sfContact.Title,
    source_metadata: {
      salesforce_type: sfContact.attributes.type,
      owner_name: sfContact.Owner?.Name,
      // ... other SF fields
    },
    last_synced_at: new Date().toISOString(),
    sync_status: 'active',
  }, {
    onConflict: 'business_id,source,source_id',
    ignoreDuplicates: false, // Update existing
  });
```

### 2. Create Contact List

```typescript
const { data: list } = await supabase
  .from('contact_lists')
  .insert({
    business_id: 'xxx',
    name: 'Major Donors 2024',
    description: 'Donors who gave $10k+ in 2024',
    list_type: 'static',
    color: '#FF5733',
  })
  .select()
  .single();
```

### 3. Add Contacts to List

```typescript
const contactIds = ['uuid1', 'uuid2', 'uuid3'];

const { data } = await supabase
  .from('contact_list_members')
  .insert(
    contactIds.map(contactId => ({
      contact_list_id: list.id,
      contact_id: contactId,
    }))
  );
```

### 4. Get Contacts in a List

```typescript
const { data: contacts } = await supabase
  .from('contact_list_members')
  .select(`
    contact:contacts (
      id,
      full_name,
      email,
      phone,
      account_name,
      tags
    )
  `)
  .eq('contact_list_id', listId);
```

### 5. Create Campaign from Contact List

```typescript
// 1. Create campaign
const { data: campaign } = await supabase
  .from('campaigns')
  .insert({
    business_id: 'xxx',
    name: 'Year-End Appeal 2024',
    audience_list_id: listId,
    status: 'draft',
  })
  .select()
  .single();

// 2. Get contacts from list
const { data: members } = await supabase
  .from('contact_list_members')
  .select('contact_id, contact:contacts(*)')
  .eq('contact_list_id', listId);

// 3. Create leads for campaign
const { data: leads } = await supabase
  .from('leads')
  .insert(
    members.map(m => ({
      campaign_id: campaign.id,
      contact_id: m.contact_id,
      name: m.contact.full_name,
      email: m.contact.email,
      phone: m.contact.phone || m.contact.mobile_phone,
      timezone: m.contact.timezone,
      company: m.contact.account_name,
      status: 'new',
      attempts: 0,
    }))
  );
```

---

## Security

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Restrict access to team members of the business
- Require active team membership
- Allow SELECT, INSERT, UPDATE, DELETE for authorized users

### Example Policy:
```sql
CREATE POLICY "Users can view contacts in their business"
  ON public.contacts FOR SELECT
  USING (
    business_id IN (
      SELECT business_id FROM public.team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );
```

---

## Triggers

### 1. Update Contact List Count

Automatically updates `contact_lists.contact_count` when members are added/removed.

```sql
CREATE TRIGGER trigger_update_contact_list_count
AFTER INSERT OR DELETE ON public.contact_list_members
FOR EACH ROW
EXECUTE FUNCTION update_contact_list_count();
```

### 2. Auto-update Timestamps

Updates `updated_at` timestamp on contacts and contact_lists.

```sql
CREATE TRIGGER trigger_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

---

## Next Steps

### 1. Run Migration

```bash
npx supabase db reset  # Reset and apply all migrations
# OR
npx supabase migration up  # Apply new migrations only
```

### 2. Generate TypeScript Types

```bash
npx supabase gen types typescript --local > apps/web/lib/database.types.ts
```

### 3. Create Sync API Endpoint

Create `/api/sync/salesforce` endpoint to:
- Fetch contacts from Salesforce API
- Upsert to `contacts` table
- Handle pagination, rate limiting, and errors
- Track sync progress and status

### 4. Build UI Components

- **Contact List Management**: View, create, edit lists
- **Contact Browser**: Search, filter, view contacts
- **Campaign Builder**: Select lists, preview contacts
- **Sync Dashboard**: View sync status, errors, last sync time

---

## Future Enhancements

### Smart Lists

Implement dynamic lists with filter criteria:

```typescript
const smartList = {
  name: "High-Value Prospects",
  list_type: "smart",
  filter_criteria: {
    rules: [
      { field: "tags", operator: "contains", value: "major_donor" },
      { field: "do_not_call", operator: "equals", value: false },
      { field: "last_synced_at", operator: "within_days", value: 30 }
    ],
    logic: "AND"
  }
};
```

### Salesforce Campaign Sync

Automatically sync Salesforce Campaigns as Contact Lists:

```typescript
// Sync SF Campaign → Contact List
const sfCampaign = await salesforce.getCampaign(campaignId);
const list = await createContactList({
  name: sfCampaign.Name,
  source: 'salesforce_campaign',
  source_id: sfCampaign.Id,
});

// Sync campaign members
const members = await salesforce.getCampaignMembers(campaignId);
for (const member of members) {
  await addContactToList(list.id, member.ContactId);
}
```

### Deduplication

Implement smart deduplication:
- Match by email, phone, or Salesforce ID
- Merge duplicate contacts
- Update all list memberships and lead references

---

## Summary

✅ **Created Tables**:
- `contacts` - Master contact records
- `contact_lists` - Organize contacts into groups
- `contact_list_members` - Many-to-many join table
- Updated `leads` with `contact_id` reference

✅ **Features**:
- Multi-source support (Salesforce, CSV, manual)
- Flexible tagging and custom fields
- Reusable lists across campaigns
- Sync tracking and error handling
- Automatic list count updates
- Comprehensive RLS policies

✅ **Next**: Implement sync API endpoint and UI!
