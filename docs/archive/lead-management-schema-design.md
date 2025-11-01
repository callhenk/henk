# Lead Management Schema Design

**Date**: October 18, 2025
**Version**: 1.0

## Executive Summary

This document outlines the improved schema design for lead management in Henk, supporting flexible lead grouping, campaign assignment, and tracking. The design allows leads to exist independently, be organized into reusable groups, and be assigned to multiple campaigns.

## Current Schema Issues

The existing schema has several limitations:

1. **Direct Campaign Assignment**: Leads have a direct `campaign_id` field, meaning a lead can only belong to one campaign
2. **No Group-to-Campaign Relationship**: No way to assign entire lead groups to campaigns
3. **Limited Tracking**: Can't track which group a lead came from within a campaign
4. **Poor Reusability**: Lead groups can't be easily reused across campaigns

## New Schema Architecture

### Core Tables

```
┌────────────────┐     ┌──────────────────────┐     ┌────────────────┐
│     leads      │────▶│  lead_list_members   │◀────│   lead_lists   │
└────────────────┘     └──────────────────────┘     └────────────────┘
        │                                                      │
        │                                                      │
        ▼                                                      ▼
┌────────────────┐     ┌──────────────────────┐     ┌────────────────┐
│ campaign_leads │────▶│ campaign_lead_lists  │◀────│   campaigns    │
└────────────────┘     └──────────────────────┘     └────────────────┘
```

### 1. **leads** Table (Modified)
Stores individual lead records independent of campaigns.

**Key Changes:**
- ✅ Removed direct `campaign_id` field
- ✅ Added `lead_score`, `quality_rating`, `last_activity_at`
- ✅ Leads can exist without being assigned to campaigns

```sql
leads (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL,
  -- Contact info
  first_name, last_name, email, phone, company,
  -- Lead quality
  lead_score INTEGER DEFAULT 0,
  quality_rating VARCHAR(20), -- 'hot', 'warm', 'cold', 'unrated'
  -- Source tracking
  source VARCHAR(50),
  source_id VARCHAR(255),
  -- Activity tracking
  last_activity_at TIMESTAMPTZ
)
```

### 2. **lead_lists** Table (Enhanced)
Groups of leads that can be reused across campaigns.

**Key Enhancements:**
- ✅ Added `is_archived` for lifecycle management
- ✅ Added `tags` for categorization
- ✅ Added `metadata` for flexible data storage

```sql
lead_lists (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL,
  name VARCHAR(255),
  description TEXT,
  list_type VARCHAR(50), -- 'static', 'dynamic', 'smart'
  lead_count INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  tags JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
)
```

### 3. **lead_list_members** Table
Many-to-many relationship between leads and lists.

```sql
lead_list_members (
  id UUID PRIMARY KEY,
  lead_list_id UUID REFERENCES lead_lists,
  lead_id UUID REFERENCES leads,
  added_at TIMESTAMPTZ,
  added_by UUID,
  notes TEXT,
  UNIQUE(lead_list_id, lead_id)
)
```

### 4. **campaign_lead_lists** Table (NEW)
Links lead lists to campaigns with configuration options.

```sql
campaign_lead_lists (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns,
  lead_list_id UUID REFERENCES lead_lists,
  -- Configuration
  priority INTEGER DEFAULT 1,
  max_attempts_override INTEGER,
  filter_criteria JSONB,
  -- Tracking
  total_leads INTEGER,
  contacted_leads INTEGER,
  successful_leads INTEGER,
  -- Status
  is_active BOOLEAN DEFAULT true,
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(campaign_id, lead_list_id)
)
```

**Features:**
- **Priority**: Process lists in order (1 = highest priority)
- **Override Settings**: Custom settings per list
- **Filter Criteria**: Apply additional filters to the list for this campaign
- **Stats Tracking**: Monitor progress per list

### 5. **campaign_leads** Table (NEW)
Tracks individual leads within campaigns and their outcomes.

```sql
campaign_leads (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns,
  lead_id UUID REFERENCES leads,
  lead_list_id UUID REFERENCES lead_lists, -- Track source list
  -- Status tracking
  status VARCHAR(50), -- 'new', 'queued', 'calling', 'contacted', 'converted', 'failed'
  attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  next_attempt_at TIMESTAMPTZ,
  -- Outcomes
  outcome VARCHAR(100),
  pledged_amount NUMERIC,
  donated_amount NUMERIC,
  -- Call metrics
  total_talk_time INTEGER,
  last_call_duration INTEGER,
  UNIQUE(campaign_id, lead_id)
)
```

## Use Cases and Workflows

### Use Case 1: Upload Leads Without Campaign

**Scenario**: User wants to upload a CSV of leads for future use.

```sql
-- 1. Upload leads to the leads table
INSERT INTO leads (business_id, first_name, last_name, email, phone, source)
VALUES
  ('business-123', 'John', 'Doe', 'john@example.com', '555-1234', 'csv_import'),
  ('business-123', 'Jane', 'Smith', 'jane@example.com', '555-5678', 'csv_import');

-- 2. Create a lead list
INSERT INTO lead_lists (business_id, name, description, list_type)
VALUES ('business-123', 'Q4 2025 Prospects', 'Uploaded from October event', 'static')
RETURNING id; -- returns 'list-456'

-- 3. Add leads to the list
INSERT INTO lead_list_members (lead_list_id, lead_id)
VALUES
  ('list-456', 'lead-id-1'),
  ('list-456', 'lead-id-2');
```

### Use Case 2: Create Groups First, Then Upload

**Scenario**: User creates categorized groups before uploading.

```sql
-- 1. Create multiple lead lists
INSERT INTO lead_lists (business_id, name, tags)
VALUES
  ('business-123', 'Major Donors', '["high-value", "priority"]'::jsonb),
  ('business-123', 'Event Attendees', '["events", "engaged"]'::jsonb),
  ('business-123', 'Newsletter Subscribers', '["email", "nurture"]'::jsonb);

-- 2. Upload and assign leads to appropriate lists based on criteria
-- Use the create_lead_list_from_csv function or manual assignment
```

### Use Case 3: Campaign with Multiple Lead Lists

**Scenario**: Create a campaign using existing lead groups.

```sql
-- 1. Create campaign
INSERT INTO campaigns (business_id, name, status)
VALUES ('business-123', 'Year End Campaign 2025', 'draft')
RETURNING id; -- returns 'campaign-789'

-- 2. Assign multiple lead lists to the campaign
SELECT add_lead_list_to_campaign('campaign-789', 'list-major-donors', 1);  -- Priority 1
SELECT add_lead_list_to_campaign('campaign-789', 'list-event-attendees', 2); -- Priority 2
SELECT add_lead_list_to_campaign('campaign-789', 'list-newsletter', 3);      -- Priority 3

-- 3. The function automatically:
--    - Creates campaign_lead_lists entries
--    - Populates campaign_leads with all leads from the lists
--    - Maintains source list tracking
```

### Use Case 4: Direct Upload to Campaign

**Scenario**: User uploads CSV directly to a campaign, creating a new list automatically.

```sql
-- 1. Create list and upload leads in one operation
SELECT create_lead_list_from_csv(
  'business-123',
  'Holiday Campaign Import - Oct 18',
  '[
    {"first_name": "Alice", "last_name": "Johnson", "email": "alice@example.com"},
    {"first_name": "Bob", "last_name": "Wilson", "email": "bob@example.com"}
  ]'::jsonb
) AS list_id; -- returns 'list-999'

-- 2. Immediately assign to campaign
SELECT add_lead_list_to_campaign('campaign-789', 'list-999', 4);
```

### Use Case 5: Reuse Lead Lists Across Campaigns

**Scenario**: Use the same donor list for multiple campaigns.

```sql
-- Major Donors list can be used in multiple campaigns
SELECT add_lead_list_to_campaign('spring-campaign-id', 'list-major-donors', 1);
SELECT add_lead_list_to_campaign('fall-campaign-id', 'list-major-donors', 1);
SELECT add_lead_list_to_campaign('year-end-campaign-id', 'list-major-donors', 1);

-- Each campaign tracks its own progress with the same list
```

## Key Benefits

### 1. **Flexibility**
- Leads exist independently of campaigns
- Lead lists can be created and managed separately
- Lists can be assigned to multiple campaigns

### 2. **Reusability**
- Same lead list can be used across campaigns
- No need to duplicate leads for each campaign
- Centralized lead management

### 3. **Better Tracking**
- Know which list a lead came from in a campaign
- Track performance per list within campaigns
- Maintain lead history across campaigns

### 4. **Scalability**
- Efficient handling of large lead volumes
- Indexed for performance
- Supports batch operations

### 5. **Advanced Features**
- Priority-based list processing
- Custom settings per list per campaign
- Dynamic filtering capabilities
- Comprehensive stats tracking

## API Implementation Examples

### React Query Hooks

```typescript
// Hook to get lead lists for a business
export function useLeadLists(businessId: string) {
  return useQuery({
    queryKey: ['lead-lists', businessId],
    queryFn: () => supabase
      .from('lead_lists')
      .select('*, lead_count')
      .eq('business_id', businessId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false })
  });
}

// Hook to assign lead list to campaign
export function useAssignListToCampaign() {
  return useMutation({
    mutationFn: ({ campaignId, listId, priority }) =>
      supabase.rpc('add_lead_list_to_campaign', {
        p_campaign_id: campaignId,
        p_lead_list_id: listId,
        p_priority: priority
      })
  });
}

// Hook to create list from CSV
export function useCreateListFromCSV() {
  return useMutation({
    mutationFn: ({ businessId, name, leads }) =>
      supabase.rpc('create_lead_list_from_csv', {
        p_business_id: businessId,
        p_list_name: name,
        p_leads: leads
      })
  });
}
```

### UI Components

```typescript
// Lead List Selector Component
function LeadListSelector({ campaignId, onSelect }) {
  const { data: lists } = useLeadLists(businessId);
  const assignList = useAssignListToCampaign();

  const handleAssign = (listId, priority) => {
    assignList.mutate({
      campaignId,
      listId,
      priority
    });
  };

  return (
    <div>
      {lists.map(list => (
        <LeadListCard
          key={list.id}
          list={list}
          onAssign={(priority) => handleAssign(list.id, priority)}
        />
      ))}
    </div>
  );
}

// CSV Upload Component
function CSVUploadDialog({ campaignId, businessId }) {
  const createList = useCreateListFromCSV();
  const assignList = useAssignListToCampaign();

  const handleUpload = async (csvData) => {
    // Parse CSV to JSON
    const leads = parseCSV(csvData);

    // Create list from CSV
    const { data: listId } = await createList.mutateAsync({
      businessId,
      name: `Import - ${new Date().toLocaleDateString()}`,
      leads
    });

    // If campaign provided, assign the list
    if (campaignId) {
      await assignList.mutateAsync({
        campaignId,
        listId,
        priority: 1
      });
    }
  };

  return (
    <UploadDialog onUpload={handleUpload} />
  );
}
```

## Migration Path

### What Gets Cleaned Up

The migration automatically handles cleanup of the old schema:

1. **Removed Columns from leads table**:
   - ❌ `campaign_id` - Leads are now campaign-independent
   - ❌ `attempts` - Moved to campaign_leads table
   - ❌ `last_contact_date` - Moved to campaign_leads as last_attempt_at
   - ❌ `pledged_amount` - Moved to campaign_leads table
   - ❌ `donated_amount` - Moved to campaign_leads table

2. **Added Columns**:
   - ✅ `lead_score` - For lead quality tracking
   - ✅ `quality_rating` - Qualitative assessment (hot/warm/cold)
   - ✅ `last_activity_at` - Track engagement

3. **Data Migration**:
   - Existing campaign-lead relationships are preserved
   - Creates "Migrated Leads - [Campaign Name]" lists for each campaign
   - Populates campaign_leads table with existing data
   - Maps old status values to new schema

### For Existing Data

The migration includes automatic data migration:

```sql
-- Automatically handled by migration:
-- 1. Saves existing campaign-lead relationships to temp table
-- 2. Creates lead lists for each campaign's existing leads
-- 3. Migrates all lead data to new campaign_leads table
-- 4. Preserves status, attempts, amounts, and notes
```

No manual intervention required!

## Performance Considerations

### Indexes
All foreign keys and frequently queried columns are indexed:
- Business ID lookups
- Campaign and list associations
- Status filtering
- Priority ordering

### Query Optimization
Views are created for common queries:
- `campaign_lead_lists_with_stats`: Campaign lists with real-time stats
- `lead_lists_with_campaigns`: Lead lists with their campaign associations

### Batch Operations
Functions support batch operations:
- `add_lead_list_to_campaign`: Batch inserts all leads
- `create_lead_list_from_csv`: Batch processes CSV data

## Security

### Row Level Security (RLS)
All tables have RLS policies ensuring:
- Users can only access data in their business
- Team member status is verified
- Operations are scoped to active memberships

### Function Security
Database functions use `SECURITY DEFINER` to:
- Execute with elevated privileges
- Maintain data consistency
- Enforce business rules

## Monitoring and Analytics

### Key Metrics to Track
```sql
-- Campaign performance by lead list
SELECT
  cll.lead_list_id,
  ll.name,
  cll.total_leads,
  cll.contacted_leads,
  cll.successful_leads,
  ROUND(cll.successful_leads::numeric / NULLIF(cll.contacted_leads, 0) * 100, 2) as conversion_rate
FROM campaign_lead_lists cll
JOIN lead_lists ll ON cll.lead_list_id = ll.id
WHERE cll.campaign_id = 'campaign-id'
ORDER BY cll.priority;

-- Lead quality distribution
SELECT
  quality_rating,
  COUNT(*) as count,
  AVG(lead_score) as avg_score
FROM leads
WHERE business_id = 'business-id'
GROUP BY quality_rating;

-- List reusability
SELECT
  ll.id,
  ll.name,
  COUNT(DISTINCT cll.campaign_id) as campaigns_used_in,
  SUM(cll.successful_leads) as total_conversions
FROM lead_lists ll
JOIN campaign_lead_lists cll ON ll.id = cll.lead_list_id
GROUP BY ll.id, ll.name
ORDER BY campaigns_used_in DESC;
```

## Future Enhancements

### Phase 1: Smart Lists
- Dynamic lists based on criteria
- Auto-updating based on lead scoring
- Segment by engagement metrics

### Phase 2: Advanced Analytics
- Lead source ROI tracking
- List performance scoring
- Predictive lead scoring

### Phase 3: Automation
- Auto-assignment rules
- Lead recycling workflows
- Nurture campaign triggers

## Conclusion

This schema design provides a robust, flexible foundation for lead management that:
- ✅ Separates leads from campaigns for reusability
- ✅ Supports multiple grouping strategies
- ✅ Enables detailed tracking and analytics
- ✅ Scales efficiently with proper indexing
- ✅ Maintains data integrity with constraints
- ✅ Provides security through RLS policies

The design supports all requested use cases while providing room for future growth and enhancement.