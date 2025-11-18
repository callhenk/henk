# Lead Management Frontend Implementation Plan

Based on the database schema changes in migration `20250119000000_lead_campaign_relationships.sql`, here's the complete plan for frontend updates.

## Schema Changes Summary

### New Data Model

The schema has fundamentally changed the relationship between leads, lists, and campaigns:

**Old Model:**

- Leads belonged directly to campaigns (via `campaign_id`)
- Lead tracking data (attempts, status, pledged_amount) lived on `leads` table

**New Model:**

- **Leads** are campaign-independent (no `campaign_id`)
- **Lead Lists** (`lead_lists`) group leads and can be reused across campaigns
- **Campaign Lead Lists** (`campaign_lead_lists`) - Many-to-many join table linking lists to campaigns
- **Campaign Leads** (`campaign_leads`) - Tracks individual lead status/outcomes within specific campaigns

### New Tables

#### 1. `campaign_lead_lists`

Links lead lists to campaigns with campaign-specific configuration:

```typescript
{
  id: string;
  campaign_id: string;
  lead_list_id: string;
  priority: number; // Processing order
  max_attempts_override: number | null; // Override campaign max_attempts
  filter_criteria: Json | null;
  total_leads: number;
  contacted_leads: number;
  successful_leads: number;
  is_active: boolean;
  assigned_at: string;
  assigned_by: string | null;
  completed_at: string | null;
}
```

#### 2. `campaign_leads`

Tracks individual leads within campaigns:

```typescript
{
  id: string;
  campaign_id: string;
  lead_id: string;
  lead_list_id: string | null; // Source list
  status: 'new' |
    'queued' |
    'calling' |
    'contacted' |
    'converted' |
    'failed' |
    'dnc';
  attempts: number;
  last_attempt_at: string | null;
  next_attempt_at: string | null;
  outcome: string | null; // 'pledged', 'donated', 'declined', 'callback', etc.
  pledged_amount: number | null;
  donated_amount: number | null;
  notes: string | null;
  total_talk_time: number; // seconds
  last_call_duration: number | null;
  added_at: string;
  contacted_at: string | null;
  converted_at: string | null;
}
```

### Modified Tables

#### `leads` table

**Removed columns:**

- `campaign_id` (now campaign-independent)
- `attempts` (moved to `campaign_leads`)
- `last_contact_date` (moved to `campaign_leads`)
- `pledged_amount` (moved to `campaign_leads`)
- `donated_amount` (moved to `campaign_leads`)

**Added columns:**

- `lead_score: number` (0-100)
- `quality_rating: 'hot' | 'warm' | 'cold' | 'unrated'`
- `last_activity_at: string | null`

#### `lead_lists` table

**Added columns:**

- `is_archived: boolean`
- `tags: Json` (array of strings)
- `metadata: Json`

#### `campaigns` table

**Added columns:**

- `business_id: string` (for multi-tenancy)
- `goal_metric: string | null` ('pledge_rate' | 'average_gift' | 'total_donations')
- `disclosure_line: string | null`
- `call_window_start: string | null` (time with timezone)
- `call_window_end: string | null`
- `audience_list_id: string | null` (deprecated - use `campaign_lead_lists`)
- `dedupe_by_phone: boolean`
- `exclude_dnc: boolean`
- `audience_contact_count: number`

## Frontend Changes Needed

### 1. Database Type Generation

**FIRST STEP:** Regenerate database types to include new tables and columns:

```bash
pnpm supabase:web:reset      # Apply migrations
pnpm supabase:web:typegen    # Generate types
```

This will update:

- `packages/supabase/src/database.types.ts`
- `apps/web/lib/database.types.ts`

### 2. Create New Hooks

#### A. Campaign Lead Lists Hooks

**File:** `packages/supabase/src/hooks/campaigns/use-campaign-lead-lists.ts`

```typescript
// Query hooks
export function useCampaignLeadLists(campaignId: string);
export function useCampaignLeadList(id: string);
export function useLeadListsForCampaign(campaignId: string); // with stats view

// File: use-campaign-lead-list-mutations.ts
export function useAssignLeadListToCampaign();
export function useRemoveLeadListFromCampaign();
export function useUpdateCampaignLeadListPriority();
export function useToggleCampaignLeadListStatus();
```

#### B. Campaign Leads Hooks

**File:** `packages/supabase/src/hooks/campaigns/use-campaign-leads.ts`

```typescript
// Query hooks
export function useCampaignLeads(campaignId: string, filters?);
export function useCampaignLead(id: string);
export function useCampaignLeadStats(campaignId: string);

// File: use-campaign-lead-mutations.ts
export function useUpdateCampaignLeadStatus();
export function useUpdateCampaignLeadOutcome();
export function useBulkUpdateCampaignLeads();
```

#### C. Updated Leads Hooks

**File:** `packages/supabase/src/hooks/leads/use-leads.ts` (update existing)

```typescript
// Update existing hooks to remove campaign_id references
// Add new fields: lead_score, quality_rating, last_activity_at

export interface LeadsFilters {
  quality_rating?: 'hot' | 'warm' | 'cold' | 'unrated';
  lead_score_min?: number;
  lead_score_max?: number;
  // ... existing filters
}

// File: use-lead-mutations.ts (update existing)
export function useUpdateLeadScore();
export function useUpdateLeadQuality();
```

#### D. Updated Lead Lists Hooks

**File:** `packages/supabase/src/hooks/leads/use-lead-lists.ts` (update existing)

```typescript
// Add new fields to queries: is_archived, tags, metadata

export interface LeadListsFilters {
  is_archived?: boolean;
  tags?: string[];
  // ... existing filters
}

// File: use-lead-list-mutations.ts (update existing)
export function useArchiveLeadList();
export function useUnarchiveLeadList();
export function useUpdateLeadListTags();
```

### 3. Update Campaign Management UI

#### A. Campaign Creation/Edit Form

**File:** `app/home/campaigns/[id]/_components/campaign-form.tsx` (or wizard)

**Changes needed:**

1. **Audience Selection Tab:**
   - Add "Lead Lists" section to select multiple lists
   - Show list of available lead lists with checkboxes
   - Allow setting priority for each selected list
   - Display total lead count from selected lists
   - Add "Deduplicate by phone" toggle
   - Add "Exclude Do Not Call" toggle

2. **Calling & Voice Tab:**
   - Add "Goal Metric" dropdown (pledge_rate, average_gift, total_donations)
   - Add "Disclosure Line" text input
   - Add "Call Window" time range picker (start/end times)

3. **Form Schema Updates:**

```typescript
const campaignSchema = z.object({
  // ... existing fields

  // New: Calling & Voice
  goal_metric: z
    .enum(['pledge_rate', 'average_gift', 'total_donations'])
    .optional(),
  disclosure_line: z.string().optional(),
  call_window_start: z.string().optional(), // HH:MM format
  call_window_end: z.string().optional(),

  // New: Audience (deprecated single list, use campaign_lead_lists instead)
  dedupe_by_phone: z.boolean().default(false),
  exclude_dnc: z.boolean().default(true),

  // New: Selected lead lists (for UI state, not DB)
  selected_lead_lists: z
    .array(
      z.object({
        lead_list_id: z.string(),
        priority: z.number(),
      }),
    )
    .optional(),
});
```

#### B. Campaign Detail Page - Lead Lists Section

**File:** `app/home/campaigns/[id]/_components/campaign-lead-lists.tsx` (NEW)

**Features:**

- Display all assigned lead lists in a table
- Columns: List Name, Priority, Total Leads, Contacted, Converted, Status
- Actions: Change Priority, Remove List, View Details
- "Add Lead List" button to assign new lists
- Drag-and-drop to reorder priority

#### C. Campaign Detail Page - Campaign Leads View

**File:** `app/home/campaigns/[id]/_components/campaign-leads-list.tsx` (UPDATE)

**Changes:**

- Update to fetch from `campaign_leads` table (not `leads`)
- Add "Source List" column showing which list the lead came from
- Update status dropdown to new values: 'new', 'queued', 'calling', 'contacted', 'converted', 'failed', 'dnc'
- Add "Outcome" column with dropdown
- Add "Talk Time" and "Last Call Duration" columns
- Show "Next Attempt" timestamp
- Update filters to work with new schema

#### D. Campaign Stats Dashboard

**File:** `app/home/campaigns/[id]/_components/campaign-stats.tsx` (UPDATE)

**Add new stat cards:**

- Lead Lists Assigned (count)
- Total Leads (sum across all lists)
- Average Talk Time
- Conversion Rate by List (breakdown)

### 4. Update Lead Management UI

#### A. Leads List Page

**File:** `app/home/leads/page.tsx` and `_components/leads-list.tsx`

**Changes:**

- Remove campaign filter (leads are no longer tied to campaigns)
- Add "Quality Rating" filter (hot/warm/cold/unrated)
- Add "Lead Score" range filter
- Add "Lead Score" column with visual indicator (0-100 scale)
- Add "Quality Rating" badge column
- Add "Last Activity" column
- Remove "Campaign" column
- Add "Used in Campaigns" column (count of campaigns this lead is in)

#### B. Lead Detail/Edit Dialog

**File:** `app/home/leads/_components/lead-dialog.tsx` (UPDATE)

**Add new fields:**

- Lead Score (number input 0-100 with slider)
- Quality Rating (select: hot/warm/cold/unrated)
- Last Activity timestamp (read-only)

**Add new "Campaign History" tab:**

- Show all campaigns this lead has been used in
- Display: Campaign Name, Status, Attempts, Outcome, Pledged/Donated amounts
- Data source: `campaign_leads` joined with `campaigns`

### 5. Lead Lists Management

#### A. Lead Lists Page

**File:** `app/home/leads/lists/page.tsx` and `_components/lead-lists.tsx`

**Changes:**

- Add "Archive" toggle in filters (show/hide archived)
- Add "Tags" filter
- Add "Tags" column with badge chips
- Add "Used in Campaigns" count column
- Add "Archive/Unarchive" action
- Add "Tags" management in edit dialog

#### B. Lead List Detail Page

**File:** `app/home/leads/lists/[id]/page.tsx` (NEW or UPDATE)

**Sections:**

1. **List Info:** Name, description, tags, metadata
2. **Members Table:** All leads in this list
3. **Campaign Usage:** All campaigns using this list with stats
4. **Actions:** Add leads, remove leads, archive list

### 6. Dialogs & Modals

#### A. Assign Lead List to Campaign Dialog

**File:** `app/home/campaigns/[id]/_components/assign-lead-list-dialog.tsx` (NEW)

**Features:**

- Select lead list from dropdown
- Set priority (number input)
- Optional: Set max attempts override
- Show preview of lead count
- Confirm and assign

#### B. Campaign Lead Outcome Dialog

**File:** `app/home/campaigns/[id]/_components/campaign-lead-outcome-dialog.tsx` (NEW)

**Features:**

- Quick update for campaign lead status
- Outcome selection (pledged, donated, declined, callback, no answer, voicemail)
- Pledged/donated amount inputs
- Notes text area
- Call duration input

### 7. Helper Functions & Utilities

#### A. Database Functions to Use

**File:** `packages/supabase/src/helpers/campaign-leads.ts` (NEW)

Wrap the SQL functions for frontend use:

```typescript
export async function addLeadListToCampaign(
  supabase: SupabaseClient,
  campaignId: string,
  leadListId: string,
  priority: number = 1,
): Promise<string>;

export async function createLeadListFromCSV(
  supabase: SupabaseClient,
  businessId: string,
  listName: string,
  leads: Array<LeadCSVRow>,
): Promise<string>;
```

#### B. Type Guards & Validators

**File:** `app/home/campaigns/_lib/types.ts` (UPDATE)

```typescript
export type CampaignLeadStatus =
  | 'new'
  | 'queued'
  | 'calling'
  | 'contacted'
  | 'converted'
  | 'failed'
  | 'dnc';
export type CampaignLeadOutcome =
  | 'pledged'
  | 'donated'
  | 'declined'
  | 'callback'
  | 'no_answer'
  | 'voicemail';
export type LeadQualityRating = 'hot' | 'warm' | 'cold' | 'unrated';
export type CampaignGoalMetric =
  | 'pledge_rate'
  | 'average_gift'
  | 'total_donations';
```

### 8. Migration Considerations

#### A. Handle Existing UI State

- Any existing campaign detail pages showing leads need to switch from `leads` table to `campaign_leads` table
- Update all lead status references to use new status values
- Remove any code that tries to set `campaign_id` on leads

#### B. Backward Compatibility

- The migration automatically creates "Migrated Leads" lists for existing campaigns
- These should be handled gracefully in the UI
- Consider adding a badge or indicator for migrated lists

### 9. Views to Utilize

Use the new SQL views for better performance:

```typescript
// Instead of manual joins, use:
.from('campaign_lead_lists_with_stats')  // Pre-calculated stats
.from('lead_lists_with_campaigns')       // Lists with campaign associations
```

## Implementation Checklist

### Phase 1: Database & Hooks (Foundation)

- [ ] Run `pnpm supabase:web:reset` to apply migrations
- [ ] Run `pnpm supabase:web:typegen` to generate types
- [ ] Create `use-campaign-lead-lists.ts` hooks
- [ ] Create `use-campaign-lead-lists-mutations.ts` hooks
- [ ] Create `use-campaign-leads.ts` hooks
- [ ] Create `use-campaign-lead-mutations.ts` hooks
- [ ] Update `use-leads.ts` hooks (remove campaign_id, add new fields)
- [ ] Update `use-lead-mutations.ts` hooks (add score/quality updates)
- [ ] Update `use-lead-lists.ts` hooks (add archive, tags, metadata)
- [ ] Update `use-lead-list-mutations.ts` hooks

### Phase 2: Campaign Management UI

- [ ] Update campaign form/wizard with new fields
- [ ] Create "Lead Lists" selection in campaign form
- [ ] Create `campaign-lead-lists.tsx` component
- [ ] Update `campaign-leads-list.tsx` to use `campaign_leads` table
- [ ] Update campaign stats dashboard
- [ ] Create assign lead list dialog

### Phase 3: Lead Management UI

- [ ] Update leads list page (remove campaign filter, add score/quality)
- [ ] Update lead detail dialog (add new fields)
- [ ] Add "Campaign History" tab to lead dialog
- [ ] Update lead filters component

### Phase 4: Lead Lists UI

- [ ] Update lead lists page (add archive, tags)
- [ ] Create/update lead list detail page
- [ ] Add tags management to lead list dialog
- [ ] Show campaign usage in list detail

### Phase 5: Testing & Polish

- [ ] Test campaign creation with multiple lead lists
- [ ] Test lead list reuse across campaigns
- [ ] Test priority ordering of lists
- [ ] Test archive/unarchive functionality
- [ ] Test lead score and quality rating updates
- [ ] Verify RLS policies work correctly
- [ ] Test CSV import flow

## API Patterns

### Adding a Lead List to Campaign

```typescript
const assignList = useAssignLeadListToCampaign();

await assignList.mutateAsync({
  campaignId: campaign.id,
  leadListId: list.id,
  priority: 1,
});

// This internally calls the SQL function `add_lead_list_to_campaign`
// which creates the association and imports all leads
```

### Creating Campaign with Lead Lists

```typescript
const createCampaign = useCreateCampaign();

// 1. Create campaign first
const campaign = await createCampaign.mutateAsync({
  name: 'Fall Fundraiser',
  // ... other fields
  dedupe_by_phone: true,
  exclude_dnc: true,
});

// 2. Assign selected lead lists
for (const selection of selectedLeadLists) {
  await addLeadListToCampaign(
    supabase,
    campaign.id,
    selection.lead_list_id,
    selection.priority,
  );
}
```

### Fetching Campaign Leads with Source List

```typescript
const { data: campaignLeads } = useCampaignLeads(campaignId);

// Each campaign lead includes:
// - All lead data (from joins)
// - Campaign-specific status, attempts, outcome
// - Source list information (lead_list_id)
```

## Notes

1. **Campaign Independence:** Leads are now fully independent entities. They can exist without campaigns and be reused across multiple campaigns.

2. **Lead Lists are Reusable:** A single lead list can be assigned to multiple campaigns, each with its own priority and configuration.

3. **Per-Campaign Tracking:** All campaign-specific data (status, attempts, outcomes) is now tracked in `campaign_leads`, not on the `leads` table.

4. **Priority Processing:** The `priority` field on `campaign_lead_lists` allows campaigns to process lists in a specific order.

5. **Source Tracking:** Each lead in a campaign knows which list it came from via `lead_list_id` in `campaign_leads`.

6. **Database Functions:** Use the provided SQL functions (`add_lead_list_to_campaign`, `create_lead_list_from_csv`) instead of manual inserts for complex operations.
