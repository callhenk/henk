# Lead Management Feature - Engineering Communication Hub

**Project Lead**: Cyrus (Product Manager)
**Engineers**: Engineer 1 (Campaign & Lists), Engineer 2 (Leads Page & Bulk Ops), Engineer 3 (Edit & Filtering)
**Start Date**: October 18, 2024
**Target Completion**: October 28, 2024

---

## 🎯 Project Goal
Create a seamless lead management system that allows users to:
1. Edit lead information inline or via modal
2. Select multiple leads for bulk operations
3. Organize leads into lists with drag-and-drop management
4. Perform batch actions (delete, export, tag, add to list)
5. Filter leads by quality rating, source, and custom criteria
6. Monitor real-time campaign queue and processing status

---

## 🚨 URGENT COORDINATION NEEDED - NEW COMPONENTS READY

### ✅ Already Created Components (DO NOT RECREATE):
1. **EditLeadDialog** (`edit-lead-dialog.tsx`) - Full lead editing with tabs
2. **BulkActionsBar** (`bulk-actions-bar.tsx`) - Fixed bottom bar for bulk operations

### 📦 Components Needing Integration:
These components are ready but need to be integrated into `leads-list.tsx`

---

## 👥 Team Assignments

### Engineer 1: Lead List & Campaign Integration
**Primary Focus**: List management and campaign assignment

**Files to Work On**:
- ✅ `apps/web/app/home/leads/_components/edit-lead-dialog.tsx` (READY - integrate only)
- `apps/web/app/home/leads/_components/lead-lists-dialog.tsx` (enhance)
- `apps/web/app/home/leads/_components/bulk-add-to-list-dialog.tsx` (create new)
- `apps/web/app/home/campaigns/[id]/_components/LeadListSelector.tsx` (enhance)

**Key Tasks**:
1. Integrate EditLeadDialog into leads-list.tsx
2. Create bulk "Add to List" functionality
3. Add drag-and-drop priority management for lists
4. Implement list filtering in campaign view

### Engineer 2: Bulk Operations & Selection
**Primary Focus**: Multi-select and bulk actions

**Files to Work On**:
- ✅ `apps/web/app/home/leads/_components/bulk-actions-bar.tsx` (READY - integrate only)
- `apps/web/app/home/leads/_components/leads-list.tsx` (enhance with checkboxes)
- `packages/supabase/src/hooks/leads/use-bulk-operations.ts` (create new)

**Key Tasks**:
1. Add checkbox column to table with select all functionality
2. Integrate BulkActionsBar component
3. Implement selectedLeads state management
4. Create bulk mutation hooks for:
   - Bulk delete
   - Bulk update tags
   - Bulk update quality rating
   - Bulk update preferences

### Engineer 3: Filtering & Search Enhancement
**Primary Focus**: Advanced filtering and sidebar

**Files to Work On**:
- `apps/web/app/home/leads/_components/leads-filters.tsx` (enhance)
- `apps/web/app/home/leads/_components/leads-page-sidebar.tsx` (create new)
- `apps/web/app/home/leads/_components/lead-quality-filter.tsx` (create new)

**Key Tasks**:
1. Add quality rating filter (hot/warm/cold/unrated)
2. Create sidebar with lead list shortcuts
3. Enhance search to include all lead fields
4. Add source-based filtering

---

## 🔗 Integration Points & API Contracts

### 1. Selected Leads State (Engineer 2 → Others)
```typescript
// In leads-list.tsx
const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
const [editingLead, setEditingLead] = useState<Lead | null>(null);

// Props to pass to BulkActionsBar
<BulkActionsBar
  selectedLeads={selectedLeads}
  onClearSelection={() => setSelectedLeads(new Set())}
  onAddToList={() => setShowBulkAddDialog(true)}
  onBulkDelete={handleBulkDelete}
  onExport={handleExport}
  onUpdateTags={handleBulkUpdateTags}
  onUpdatePreferences={handleBulkUpdatePreferences}
  onUpdateQualityRating={handleBulkUpdateQualityRating}
/>
```

### 2. Edit Dialog Integration (Engineer 1)
```typescript
// In leads-list.tsx
import { EditLeadDialog } from './edit-lead-dialog';

// In the actions dropdown, replace toast with:
<DropdownMenuItem onClick={() => setEditingLead(lead)}>
  <Edit className="mr-2 h-4 w-4" />
  Edit
</DropdownMenuItem>

// Add dialog at bottom:
{editingLead && (
  <EditLeadDialog
    open={!!editingLead}
    onOpenChange={(open) => !open && setEditingLead(null)}
    lead={editingLead}
  />
)}
```

### 3. Checkbox Column (Engineer 2)
```typescript
// Add to TableHeader
<TableHead className="w-[50px]">
  <Checkbox
    checked={selectedLeads.size === leads.length && leads.length > 0}
    indeterminate={selectedLeads.size > 0 && selectedLeads.size < leads.length}
    onCheckedChange={handleSelectAll}
  />
</TableHead>

// Add to TableRow
<TableCell>
  <Checkbox
    checked={selectedLeads.has(lead.id)}
    onCheckedChange={(checked) => handleSelectLead(lead.id, checked)}
  />
</TableCell>
```

---

## 📊 Current Sprint Status (Oct 18, 2024)

### ✅ Completed
- [x] Project planning and task breakdown
- [x] Implementation guide created
- [x] Database schema reviewed
- [x] EditLeadDialog component created
- [x] BulkActionsBar component created
- [x] **CRITICAL FIX**: Added "Manage Lists" button to leads page (was missing!)
- [x] Created LeadsPageSidebar component for list filtering
- [x] Database types updated with campaign_lead_lists and campaign_leads tables
- [x] Fixed RPC function types

### 🚧 In Progress
- [ ] Engineer 1: Integrating EditLeadDialog into leads-list.tsx (UNBLOCKED - types fixed!)
- [ ] Engineer 2: Adding checkbox selection to leads table (partially done)
- [ ] Engineer 3: Can now integrate LeadsPageSidebar component

### 📋 Upcoming
- [ ] Bulk add to list dialog
- [ ] Campaign queue visualization
- [ ] Real-time subscriptions setup
- [ ] Integrate sidebar into main leads page layout

---

## ⚠️ CRITICAL: Avoiding Merge Conflicts

### Files With Multiple Engineers Working:
1. **`leads-list.tsx`** - ALL THREE engineers need to coordinate!
   - Engineer 1: Adding EditLeadDialog integration
   - Engineer 2: Adding checkbox column and selectedLeads state
   - Engineer 3: Adding filter state management

   **SOLUTION**: Engineer 2 should make changes first (checkbox infrastructure), then Engineer 1 and 3 can integrate on top.

### Coordination Order:
1. **FIRST**: Engineer 2 adds checkbox column and selection state
2. **SECOND**: Engineer 1 integrates EditLeadDialog
3. **THIRD**: Engineer 3 adds enhanced filtering
4. **PARALLEL OK**: List management and campaign features can proceed independently

---

## 🔧 Required Database Hooks to Create

### Engineer 2 Needs (in `packages/supabase/src/hooks/leads/`):
```typescript
// use-bulk-operations.ts
export function useBulkDeleteLeads();
export function useBulkUpdateLeadTags();
export function useBulkUpdateLeadQualityRating();
export function useBulkUpdateLeadPreferences();
export function useBulkAddLeadsToList();
```

### Engineer 1 Needs:
```typescript
// Update existing use-lead-mutations.ts to add:
export function useUpdateLead(); // For edit dialog
```

### Engineer 3 Needs:
```typescript
// Enhanced filtering in use-leads.ts
interface LeadsFilters {
  search?: string;
  source?: string[];
  quality_rating?: string[];
  tags?: string[];
  lead_score_min?: number;
  lead_score_max?: number;
  list_id?: string;
}
```

---

## 💬 Daily Standup Format

Please update this section daily by 10 AM:

### Oct 18, 2024 - Day 1

**Engineer 1**:
- Yesterday: Reviewed project requirements
- Today: ✅ Drag-and-drop, ✅ Fixed 2 bugs, ✅ Integrated EditLeadDialog, ✅ Created CampaignQueueMonitor
- Blockers: None - all issues resolved!
- Progress:
  - **Drag-and-Drop**: Replaced ChevronUp/ChevronDown with GripVertical drag handle, implemented priority reordering
  - **BUG FIX #1**: Created migration `20251018151543_fix_add_lead_list_to_campaign_permissions.sql` for RLS permissions
  - **BUG FIX #2**: Changed soft delete to hard delete in `useRemoveLeadListFromCampaign` to fix duplicate key constraint
  - **Edit Feature**: Integrated EditLeadDialog into leads-list.tsx for inline lead editing
  - **Campaign Queue Monitor**: Created real-time monitoring component for campaign details page
    - Shows currently processing lead list with progress bar and stats
    - Displays list name, description, and key metrics (remaining, contacted, converted)
    - Queue preview of upcoming lists (next 3)
    - Click-through to view all leads in a list with details dialog
    - Overall campaign stats across all lists
    - Empty states and loading skeletons
  - **UI Improvements**: Professional redesign of all components
    - LeadListSelector: Added progress bars, better stats layout, improved drag feedback with shadow/ring, smooth transitions
    - Dialog improvements: Icon-based list cards, metadata display, hover states
    - CampaignQueueMonitor: Active status with animated pulse, gradient backgrounds, mini progress bars for queued lists
    - Overall stats: 4-column grid with success rate, uppercase labels, number formatting
    - Consistent color coding: blue (pending), green (contacted), emerald (converted)
    - Better visual hierarchy with proper spacing and typography
- Next: Continue with remaining lead management features

**Engineer 2**:
- Yesterday: Reviewed project requirements
- Today: Adding checkbox column and selection state to leads table
- Blockers: None

### Oct 19, 2024 - Day 2

**Engineer 1**:
- Yesterday: [Update here]
- Today: [Update here]
- Blockers: [Update here]

**Engineer 2**:
- Yesterday: [Update here]
- Today: [Update here]
- Blockers: [Update here]

---

## 🔄 Integration Checkpoints

### Checkpoint 1: Day 3 (Oct 20)
- [ ] Engineer 1: Drag-and-drop priority working
- [ ] Engineer 2: Bulk selection working with "select all"
- [ ] **Integration Test**: Selected leads can be added to a list

### Checkpoint 2: Day 5 (Oct 22)
- [ ] Engineer 1: Queue monitor showing real data
- [ ] Engineer 2: Sidebar filtering working
- [ ] **Integration Test**: Lists created on leads page appear in campaign selector

### Checkpoint 3: Day 7 (Oct 24)
- [ ] Engineer 1: Dynamic list criteria builder complete
- [ ] Engineer 2: Import with list assignment working
- [ ] **Integration Test**: Bulk assigned leads appear in campaign queue

### Final Integration: Day 9 (Oct 26)
- [ ] All features working together
- [ ] Real-time updates tested
- [ ] Performance testing with 1000+ leads

---

## 🚨 Current Blockers & Decisions Needed

### Open Questions:
1. **Dynamic Lists Update Frequency**: Should they update in real-time or on a schedule?
   - **Decision**: [Pending]

2. **Lead Deletion Behavior**: Should deleted leads be auto-removed from lists?
   - **Decision**: [Pending]

3. **Processing Rate Limits**: Max leads per minute for campaign processing?
   - **Decision**: [Pending]

### Technical Decisions Made:
- ✅ Using @dnd-kit for drag-and-drop (lighter than react-beautiful-dnd)
- ✅ Bulk operations will use database transactions for consistency
- ✅ Real-time updates via Supabase channels

---

## 🔧 Shared Resources & Dependencies

### Both Engineers Need:
```typescript
// New hooks to create in packages/supabase/src/hooks/leads/
- useBulkAddToList()
- useLeadListMembers()
- useCampaignQueueStatus()
- useUpdateCampaignLeadListPriority()
```

### Database Functions Needed:
```sql
-- Engineer 1 needs this for queue processing
CREATE OR REPLACE FUNCTION get_next_campaign_leads(
  p_campaign_id UUID,
  p_limit INT DEFAULT 10
) RETURNS TABLE(...)

-- Engineer 2 needs this for bulk operations
CREATE OR REPLACE FUNCTION bulk_add_leads_to_list(
  p_lead_ids UUID[],
  p_list_id UUID
) RETURNS INT
```

---

## 📝 Code Review Protocol

1. Create feature branches: `feature/campaign-list-management` and `feature/leads-bulk-operations`
2. Daily PR reviews at 4 PM
3. Merge to main only after both engineers approve
4. Run `pnpm typecheck` and `pnpm lint` before commits

---

## 🐛 Bug Reports & Issues

### Found Issues:
1. **Issue #001**: [Oct 18] LeadListSelector shows wrong count after removal
   - **Status**: Investigating
   - **Assigned**: Engineer 1
   - **Fix**: Invalidate query cache after mutations

2. **Issue #002**: [Oct 18] Permission denied for function add_lead_list_to_campaign
   - **Status**: Fixed
   - **Assigned**: Engineer 1
   - **Fix**: Created migration `20251018151543_fix_add_lead_list_to_campaign_permissions.sql` that adds SECURITY DEFINER and GRANT EXECUTE permissions to the RPC function. The function now properly bypasses RLS when called by authenticated users.
   - **Root Cause**: Original function definition was missing SECURITY DEFINER flag and explicit GRANT statement

3. **Issue #003**: [Oct 18] Duplicate key error when re-adding removed lead list to campaign
   - **Status**: Fixed
   - **Assigned**: Engineer 1
   - **Fix**: Changed `useRemoveLeadListFromCampaign` hook from soft delete (setting `is_active = false`) to hard delete (`.delete()`). Also removed `.eq('is_active', true)` filter from `useCampaignLeadLists` query.
   - **Root Cause**: Soft delete kept the record in the database with unique constraint on (campaign_id, lead_list_id), preventing re-adding the same list
   - **File**: `packages/supabase/src/hooks/campaigns/use-campaign-lead-lists.ts`

4. **Issue #004**: [Date] Description
   - **Status**: New/In Progress/Fixed
   - **Assigned**: Engineer Name
   - **Fix**: Solution

---

## 💡 Implementation Notes & Tips

### For Engineer 1:
- The `campaign_lead_lists` table already has priority field - use it!
- Real-time subscriptions pattern exists in `useBusinessContext()` - follow it
- Progress bars use the shadcn Progress component
- Don't forget to handle the empty state when no lists are assigned

### For Engineer 2:
- Checkbox component from shadcn/ui has built-in indeterminate state
- Use `Set<string>` for selectedLeads for O(1) lookups
- BulkActionsBar should be `position: fixed` at bottom
- Virtual scrolling not needed until 500+ rows (per performance testing)

---

## 🎉 Wins & Accomplishments

- [Oct 18] Project kickoff successful! Clear task division established
- [Add wins here as we progress]

---

## 📅 Meeting Notes

### Oct 18 - Kickoff Meeting
- Reviewed user flow for lead list management
- Confirmed both engineers understand their assignments
- Decided on 2-week sprint timeline
- Salesforce sync will be handled separately by Cyrus

### [Date] - [Meeting Title]
- Notes here

---

## 🔗 Quick Links

- [Implementation Guide](/LEADS_FRONTEND_IMPLEMENTATION_GUIDE.md)
- [Database Schema](apps/web/supabase/migrations/20250119000000_lead_campaign_relationships.sql)
- [Figma Designs](#) - [Add link if available]
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## 📊 Progress Tracker

```
Overall Progress: [██████░░░░░░░░░░░░░░] 30%

Engineer 1 Tasks:
├── LeadListSelector Enhancement    [████░░░░░░] 40%
├── Campaign Queue Monitor          [░░░░░░░░░░] 0%
├── View List Members              [░░░░░░░░░░] 0%
└── Dynamic List Builder           [░░░░░░░░░░] 0%

Engineer 2 Tasks:
├── Checkbox Selection             [████░░░░░░] 40%
├── Bulk Actions Bar              [░░░░░░░░░░] 0%
├── Leads Sidebar                 [░░░░░░░░░░] 0%
└── Lead Details Drawer           [░░░░░░░░░░] 0%
```

---

## 🤝 Communication Protocol

1. **Slack Channel**: #lead-management-dev
2. **Daily Standup**: 10 AM via this document
3. **Blockers**: Tag @cyrus immediately
4. **Code Questions**: Post in thread with code snippet
5. **Integration Issues**: Schedule pair programming session

---

## ✅ Definition of Done

A feature is considered complete when:
1. [ ] Code is written and tested locally
2. [ ] TypeScript has no errors (`pnpm typecheck`)
3. [ ] Linting passes (`pnpm lint`)
4. [ ] Works with 1000+ records
5. [ ] Loading and error states handled
6. [ ] Optimistic updates implemented where applicable
7. [ ] Real-time updates working (if applicable)
8. [ ] Code reviewed by other engineer
9. [ ] Merged to main branch

---

## 🔄 Last Updated
**Date**: October 18, 2024
**By**: Cyrus (Project Lead)
**Next Update**: October 19, 2024 (Daily standup)

---

## 📣 Important Announcements

> **Oct 18 - URGENT**: Lead list creation was inaccessible to users! Fixed by adding "Manage Lists" button to leads page. The components existed but weren't hooked up. Pull latest to get the fix.

> **Oct 18**: Remember to pull latest from main - database types were regenerated today

> **[Date]**: [Announcement]

---

## 📋 Quick Reference for Engineers

### ✅ Components Already Created (DO NOT RECREATE):
```
✅ apps/web/app/home/leads/_components/edit-lead-dialog.tsx
✅ apps/web/app/home/leads/_components/bulk-actions-bar.tsx
✅ apps/web/app/home/leads/_components/add-to-list-dialog.tsx (single lead)
✅ apps/web/app/home/leads/_components/add-lead-dialog.tsx
✅ apps/web/app/home/leads/_components/lead-lists-dialog.tsx (manage lists)
✅ apps/web/app/home/leads/_components/create-edit-lead-list-dialog.tsx
✅ apps/web/app/home/leads/_components/leads-page-sidebar.tsx (NEW - list filtering)
```

### 🔨 Components to Create:
```
Engineer 1:
- [ ] bulk-add-to-list-dialog.tsx (for multiple leads)

Engineer 2:
- [ ] Checkbox column in leads-list.tsx
- [ ] Selection state management
- [ ] Integration of BulkActionsBar

Engineer 3:
- [ ] leads-page-sidebar.tsx
- [ ] lead-quality-filter.tsx
- [ ] Enhanced leads-filters.tsx
```

### 🎯 Today's Priority (Oct 18):
1. **Engineer 2**: Start with checkbox column - others depend on this!
2. **Engineer 1**: Prepare EditLeadDialog integration code
3. **Engineer 3**: Design filter UI mockup

---

## Engineers: Please update your sections daily!

Keep this document as our single source of truth. Any decisions made in Slack or meetings should be documented here.