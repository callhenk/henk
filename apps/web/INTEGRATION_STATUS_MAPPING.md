# Integration Status Mapping

## The Problem

There are **two different status enums** for integrations:

### Database Enum (Supabase)
```sql
-- From migration: 20241220000000_campaigns.sql
create type public.integration_status as enum (
  'active',
  'inactive',
  'error'
);
```

### UI Enum (Frontend Types)
```typescript
// From app/home/integrations/_components/types.ts
export type IntegrationStatus =
  | 'connected'
  | 'disconnected'
  | 'needs_attention'
  | 'error'
  | 'deprecated'
  | 'coming_soon';
```

## Current Status

**Fixed**: The Salesforce OAuth callback now correctly uses `'active'` instead of `'connected'` when saving to the database.

**Location**: `app/api/integrations/salesforce/callback/route.ts:145`

```typescript
status: 'active', // Valid values: 'active' | 'inactive' | 'error'
```

## Recommended Mapping (For Future Implementation)

When you load integrations from the database to display in the UI, map database statuses to UI statuses:

```typescript
function mapDatabaseStatusToUI(dbStatus: 'active' | 'inactive' | 'error'): IntegrationStatus {
  switch (dbStatus) {
    case 'active':
      return 'connected';
    case 'inactive':
      return 'disconnected';
    case 'error':
      return 'error';
    default:
      return 'disconnected';
  }
}

function mapUIStatusToDatabase(uiStatus: IntegrationStatus): 'active' | 'inactive' | 'error' {
  switch (uiStatus) {
    case 'connected':
      return 'active';
    case 'disconnected':
    case 'deprecated':
    case 'coming_soon':
      return 'inactive';
    case 'error':
    case 'needs_attention':
      return 'error';
    default:
      return 'inactive';
  }
}
```

## Why Two Different Enums?

**Database enum** (3 values):
- Simple, focused on actual connection state
- `active` = integration is working
- `inactive` = integration is turned off
- `error` = integration has errors

**UI enum** (6 values):
- More detailed for user experience
- `connected` = successfully connected
- `disconnected` = not connected yet
- `needs_attention` = working but needs user action
- `error` = broken/failing
- `deprecated` = old version, needs upgrade
- `coming_soon` = not available yet

## Alternative: Align the Enums

You could also update the database enum to match the UI:

```sql
-- Migration to update enum
alter type public.integration_status add value 'connected';
alter type public.integration_status add value 'disconnected';
alter type public.integration_status add value 'needs_attention';
alter type public.integration_status add value 'deprecated';
alter type public.integration_status add value 'coming_soon';
```

**Pros**:
- No mapping needed
- Single source of truth
- Less error-prone

**Cons**:
- Database has UI-specific values
- More complex database enum
- Need to migrate existing data

## Current Implementation Notes

Right now, the integrations page uses **mock data** (`SEED_INTEGRATIONS` in `mock-data.tsx`), so the database enum isn't actually being used for display yet.

When you implement real database loading:
1. Fetch integrations from database (they'll have `active` | `inactive` | `error`)
2. Map to UI types using the mapping function above
3. Display in the UI with full status badges

## Example: Loading Real Integrations

```typescript
// Future implementation in page.tsx or server component
const { data: dbIntegrations } = await supabase
  .from('integrations')
  .select('*')
  .eq('business_id', businessId);

// Map to UI format
const uiIntegrations = dbIntegrations.map(integration => ({
  ...integration,
  status: mapDatabaseStatusToUI(integration.status),
  // Add UI-specific fields like icon, schema, etc.
}));
```

## Files to Update When Implementing

1. **Create loader**: `app/home/integrations/page.tsx` - fetch from database
2. **Add mapping**: Create utility file with mapping functions
3. **Update controller**: Pass real data instead of `SEED_INTEGRATIONS`
4. **Test**: Verify Salesforce appears as "connected" after OAuth

## Related Files

- Database types: `lib/database.types.ts:976`
- UI types: `app/home/integrations/_components/types.ts:15-21`
- Mock data: `app/home/integrations/_components/mock-data.tsx`
- OAuth callback: `app/api/integrations/salesforce/callback/route.ts:145`
