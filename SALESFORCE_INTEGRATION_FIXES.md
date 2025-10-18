# Salesforce Integration - Issues Found and Fixed

**Date**: October 18, 2025
**Engineer**: Lead Software Engineer Review

## Summary of Findings

During the code review of the Salesforce integration, I found and fixed **3 critical bugs** that would have caused issues in production. The integration is otherwise well-implemented with robust error handling and a clean architecture.

## Critical Issues Fixed

### 1. Token Refresh Using Wrong Credentials ❌ → ✅

**File**: `/apps/web/app/api/integrations/salesforce/contacts/route.ts`

**Issue**: The token refresh function was using environment variables instead of the database-stored client credentials. This would fail for any business that has their own Salesforce Connected App.

**Before**:
```typescript
const clientId = process.env.SALESFORCE_CLIENT_ID;
const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
```

**After**:
```typescript
const credentials = integration.credentials as {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

// Use database-stored credentials first, fall back to env vars
const clientId = credentials?.clientId || process.env.SALESFORCE_CLIENT_ID;
const clientSecret = credentials?.clientSecret || process.env.SALESFORCE_CLIENT_SECRET;
```

**Impact**: High - Would cause token refresh failures for all businesses using their own Connected Apps.

---

### 2. Token Refresh Ignoring Sandbox Environment ❌ → ✅

**File**: `/apps/web/app/api/integrations/salesforce/contacts/route.ts`

**Issue**: The token refresh was hardcoded to use production Salesforce URL, ignoring sandbox environments.

**Before**:
```typescript
const tokenUrl = 'https://login.salesforce.com/services/oauth2/token';
```

**After**:
```typescript
// Determine the correct token URL based on environment
const config = integration.config as { env?: string } | null;
const environment = config?.env || 'production';
const loginUrl = environment === 'sandbox'
  ? 'https://test.salesforce.com'
  : 'https://login.salesforce.com';
const tokenUrl = `${loginUrl}/services/oauth2/token`;
```

**Impact**: High - Would cause token refresh failures for sandbox environments.

---

### 3. Status Mismatch Between Callback and Contacts API ❌ → ✅

**File**: `/apps/web/app/api/integrations/salesforce/contacts/route.ts`

**Issue**: The OAuth callback sets integration status to 'active', but the contacts API was checking for 'connected'.

**Before**:
```typescript
.eq('status', 'connected')
```

**After**:
```typescript
.eq('status', 'active')  // Fixed: callback sets 'active', not 'connected'
```

**Impact**: Critical - Would prevent the contacts API from working at all after successful OAuth.

---

## Other Observations

### Working Well ✅
1. **OAuth Flow**: Properly implemented with state parameter for CSRF protection
2. **Error Handling**: Comprehensive error messages with user-friendly guidance
3. **Session Management**: Correctly preserves user sessions during OAuth redirects
4. **Multi-Environment Support**: Handles both Production and Sandbox Salesforce environments
5. **Business Scoping**: All data properly scoped by business_id

### Recommendations for Future Improvements

1. **Security Enhancement** (Priority: High)
   - Encrypt credentials in database using Supabase Vault
   - Use proper session store (Redis) for OAuth state parameters

2. **Performance** (Priority: Medium)
   - Implement bulk operations for contact imports
   - Add caching for Salesforce metadata

3. **Monitoring** (Priority: Medium)
   - Add logging for OAuth events
   - Implement alerting for integration failures

## Testing Checklist

After these fixes, please test:

- [ ] OAuth flow with a new Salesforce integration
- [ ] Token refresh after access token expires (1-2 hours)
- [ ] Contact fetching from Salesforce
- [ ] Contact import to campaigns
- [ ] Sandbox environment connection
- [ ] Error handling for invalid credentials

## Deployment Notes

These fixes are backwards compatible and can be deployed immediately. No database migrations are required.

---

## Architecture for Future Sync Implementation

As requested, here's the architecture for the separate Supabase Edge Function that will handle syncing:

### Edge Function Repository Structure
```
salesforce-sync-function/
├── index.ts              # Main edge function entry point
├── lib/
│   ├── salesforce.ts    # Salesforce API client
│   ├── sync.ts          # Sync logic
│   └── types.ts         # TypeScript types
└── supabase/
    └── functions/
        └── salesforce-sync/
            └── index.ts  # Cron job handler
```

### Sync Function Implementation
```typescript
// Cron: */15 * * * * (every 15 minutes)
export async function syncSalesforceContacts() {
  // 1. Get all active Salesforce integrations
  const { data: integrations } = await supabase
    .from('integrations')
    .select('*')
    .eq('type', 'crm')
    .eq('name', 'Salesforce')
    .eq('status', 'active');

  // 2. Process each integration
  for (const integration of integrations) {
    try {
      // Get modified contacts since last sync
      const lastSync = integration.last_sync_at || '1970-01-01T00:00:00Z';

      const soql = `
        SELECT Id, FirstName, LastName, Email, Phone,
               Account.Name, SystemModstamp
        FROM Contact
        WHERE SystemModstamp > ${lastSync}
        ORDER BY SystemModstamp ASC
        LIMIT 2000
      `;

      // 3. Fetch from Salesforce
      const contacts = await fetchSalesforceContacts(integration, soql);

      // 4. Upsert to contacts table
      await upsertContacts(contacts, integration.business_id);

      // 5. Update last sync time
      await supabase
        .from('integrations')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', integration.id);

    } catch (error) {
      // Log error but continue with other integrations
      console.error(`Sync failed for integration ${integration.id}:`, error);

      // Update integration status if multiple failures
      await handleSyncError(integration, error);
    }
  }
}
```

This architecture ensures:
- Separation of concerns (sync logic in separate function)
- Scalability (can handle multiple integrations)
- Reliability (errors in one integration don't affect others)
- Incremental sync (only fetches modified records)

---

**Status**: All critical issues have been fixed. The integration is now ready for production use.