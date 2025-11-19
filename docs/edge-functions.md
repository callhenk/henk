# Edge Functions

Comprehensive guide to Henk's Supabase Edge Functions for campaign orchestration, conversation management, and CRM synchronization.

---

## Overview

Henk uses three production Edge Functions that run on scheduled cron jobs to orchestrate campaigns, manage conversations, and sync data with external CRMs.

### Available Functions

| Function                      | Schedule         | Purpose                                                     |
| ----------------------------- | ---------------- | ----------------------------------------------------------- |
| **campaign-orchestrator**     | Every 5 minutes  | Places outbound calls via ElevenLabs Twilio integration     |
| **conversation-orchestrator** | Every 10 minutes | Syncs conversation history and outcomes from ElevenLabs API |
| **sync-salesforce-leads**     | Every 15 minutes | Syncs Salesforce Contacts and Leads to database             |

**Production URL**: `https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/`

---

## Quick Start

### Local Development

```bash
# Start local Supabase instance
pnpm supabase:start

# Serve functions locally (with hot reload)
pnpm supabase:functions:serve

# Test a function
curl -X POST http://localhost:54321/functions/v1/campaign-orchestrator
```

### Deployment

```bash
# Set production secrets
cd apps/web/supabase/functions
./set-production-secrets.sh

# Deploy all functions
pnpm supabase:functions:deploy:all

# Deploy single function
supabase functions deploy campaign-orchestrator
```

---

## Architecture

### Function Structure

```
apps/web/supabase/functions/
├── campaign-orchestrator/
│   └── index.ts              # Main orchestrator logic
├── conversation-orchestrator/
│   └── index.ts              # Conversation sync logic
├── sync-salesforce-leads/
│   ├── index.ts              # Main sync orchestrator
│   ├── salesforce-client.ts  # Salesforce API client
│   ├── token-manager.ts      # OAuth token refresh
│   ├── lead-mapper.ts        # Data transformation
│   ├── list-manager.ts       # Lead list management
│   └── types.ts              # Type definitions
├── shared/
│   ├── fetch-with-timeout.ts # Timeout utility (30-60s)
│   ├── elevenlabs-client.ts  # ElevenLabs API client
│   └── storage.ts            # Supabase storage client
├── tests/                    # E2E and integration tests
├── .env                      # Local environment variables
├── deno.json                 # Deno configuration
└── set-production-secrets.sh # Production deployment helper
```

### Type System

All functions use shared TypeScript types from:

- `apps/web/database.types.ts` - Generated database types
- Local `types.ts` files for function-specific types

---

## Environment Variables

### Required Variables

**Local Development** (`.env` file):

```bash
# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>

# ElevenLabs API (required for campaign & conversation orchestrators)
ELEVENLABS_API_KEY=sk_...

# Salesforce OAuth (optional - falls back to database credentials)
SALESFORCE_CLIENT_ID=...
SALESFORCE_CLIENT_SECRET=...
```

**Production** (Supabase secrets):

```bash
# Set via set-production-secrets.sh
ELEVENLABS_API_KEY=sk_...
SALESFORCE_CLIENT_ID=...
SALESFORCE_CLIENT_SECRET=...
```

### Optional Configuration

```bash
# Salesforce sync batch size (default: 2000)
MAX_RECORDS_PER_SYNC=2000

# Conversation sync lookback window in hours (default: 48)
CONVERSATION_SYNC_LOOKBACK_HOURS=48

# Conversation sync batch limit (default: 10)
CONVERSATION_SYNC_BATCH_LIMIT=10

# Conversation events batch size for inserts (default: 50)
CONVERSATION_SYNC_EVENTS_BATCH_SIZE=50
```

---

## Function Details

### 1. campaign-orchestrator

**Purpose**: Orchestrates outbound calling campaigns using ElevenLabs Conversational AI.

**Schedule**: Every 5 minutes

**Flow**:

1. Fetch active campaigns within date range
2. Check daily call quotas (respects `daily_call_cap`)
3. Select eligible leads (sorted by quality rating, lead score)
4. Verify call windows based on lead timezone
5. Place calls via ElevenLabs Twilio integration
6. Record conversations and call logs
7. Update campaign_leads with attempt tracking (optimistic locking)

**Key Features**:

- **Call Window Enforcement**: Respects lead timezone and campaign call windows
- **Daily Quotas**: Enforces campaign-level daily call caps
- **Retry Logic**: Tracks attempts per lead with `max_attempts` limit
- **DNC Filtering**: Excludes Do Not Call leads when `exclude_dnc` is enabled
- **Optimistic Locking**: Prevents race conditions on concurrent updates
- **Timeout Protection**: 30-second timeout on ElevenLabs API calls

**Error Handling**:

- Fallback to `call_logs` if `conversations` insert fails
- Graceful handling of null phone numbers
- Comprehensive logging with campaign/lead context

---

### 2. conversation-orchestrator

**Purpose**: Syncs conversation history and outcomes from ElevenLabs API.

**Schedule**: Every 10 minutes

**Flow**:

1. Fetch conversations updated in last 48 hours (configurable)
2. Pull conversation history from ElevenLabs API
3. Create `conversation_events` for each message
4. Infer outcome from conversation content:
   - `pledged` - Commitment phrases detected
   - `donated` - Donation phrases detected
   - `not_interested` - Rejection phrases detected
5. Calculate sentiment scores and extract key points
6. Update conversation status and metadata

**Key Features**:

- **Demo Mode Fallback**: Gracefully handles API unavailability
- **Incremental Sync**: Only syncs new conversation events
- **Outcome Inference**: Smart detection of pledge/donation commitments
- **Sentiment Analysis**: Derives sentiment scores from outcomes
- **Key Point Extraction**: Highlights important user responses
- **Retry Logic**: 3 retries with exponential backoff (1s, 2s, 4s)
- **Timeout Protection**: 30-second timeout on API calls

**Outcome Detection Patterns**:

```typescript
// Pledged
('I will pledge', "I'll pledge", 'count me in');

// Donated
('donate', "I'll donate", 'I will donate');

// Not Interested
('not interested', 'no thanks', 'not right now');
```

---

### 3. sync-salesforce-leads

**Purpose**: Syncs Salesforce Contacts and Leads to unified `leads` table.

**Schedule**: Every 15 minutes

**Flow**:

1. Fetch active Salesforce integrations with `syncEnabled: true`
2. Build incremental SOQL queries (since `last_sync_at`)
3. Fetch Contacts and Leads from Salesforce (max 2000 per sync)
4. Transform to unified lead format
5. Upsert to `leads` table (unique on `business_id, source, source_id`)
6. Add to lead lists ("Salesforce Contacts", "Salesforce Leads")
7. Update integration `last_sync_at` timestamp
8. Log sync results to `sync_logs` table

**Key Features**:

- **Dual Object Sync**: Syncs both Contacts and Leads
- **Incremental Sync**: Only fetches changed records
- **Token Refresh**: Automatic OAuth token refresh on 401
- **Rate Limit Handling**: Respects Salesforce API rate limits (429)
- **Retry Logic**: 3 retries with exponential backoff for transient errors
- **Validation**: Skips invalid records (missing required fields)
- **Sync Logging**: Detailed logs in `sync_logs` table
- **Timeout Protection**: 60-second timeout on Salesforce API calls

**Data Mapping**:

```typescript
// Salesforce Contact → Lead
{
  source: 'salesforce_contact',
  source_id: Contact.Id,
  first_name: Contact.FirstName,
  last_name: Contact.LastName,
  email: Contact.Email,
  phone: Contact.Phone,
  company: Contact.Account?.Name,
  // ...
}

// Salesforce Lead → Lead
{
  source: 'salesforce_lead',
  source_id: Lead.Id,
  first_name: Lead.FirstName,
  last_name: Lead.LastName,
  email: Lead.Email,
  phone: Lead.Phone,
  company: Lead.Company,
  // ...
}
```

---

## Code Quality & Type Safety

### Recent Improvements (Nov 2025)

#### 1. Timeout Protection

**Before**: Fetch calls could hang indefinitely

```typescript
const response = await fetch(url, options);
```

**After**: All calls have configurable timeouts

```typescript
const response = await fetchWithTimeout(url, options, TIMEOUTS.MEDIUM); // 30s
```

**Timeouts Applied**:

- ElevenLabs API calls: 30 seconds
- Salesforce API calls: 60 seconds
- Audio generation: 60 seconds
- OAuth token refresh: 30 seconds

---

#### 2. Race Condition Prevention

**Before**: Concurrent updates could overwrite each other

```typescript
.update({ attempts: lead.attempts + 1 })
.eq('campaign_id', c.id)
.eq('lead_id', lead.id);
```

**After**: Optimistic locking prevents conflicts

```typescript
.update({ attempts: newAttempts })
.eq('campaign_id', c.id)
.eq('lead_id', lead.id)
.eq('attempts', lead.attempts ?? 0); // Only update if unchanged
```

---

#### 3. Error Recovery

**Before**: Single attempt, no retry

```typescript
const { error } = await supabase
  .from('conversations')
  .update(updates)
  .eq('id', c.id);
if (error) console.error(error);
```

**After**: 3 retries with exponential backoff

```typescript
let retries = 3;
for (let attempt = 0; attempt < retries; attempt++) {
  const { error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', c.id);

  if (!error) break;

  if (attempt < retries - 1) {
    const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
```

---

#### 4. Type Safety Fixes

All TypeScript errors resolved:

- ✅ Null phone number handling (`lead.phone || ''`)
- ✅ Proper type assertions for dynamic objects
- ✅ Error type guards (`instanceof Error`)
- ✅ Array type casting for JSONB fields

---

## Testing

### Local Testing

```bash
# Run all tests
cd apps/web/supabase/functions
./run-tests.sh

# Quick test (no seed/cleanup)
./run-tests.sh quick

# Test specific function
deno test tests/e2e/campaign-orchestrator.test.ts --allow-net --allow-env
```

### Type Checking

```bash
# Check all functions
cd apps/web/supabase/functions
deno check campaign-orchestrator/index.ts
deno check conversation-orchestrator/index.ts
deno check sync-salesforce-leads/index.ts
```

### Integration Tests

Located in `apps/web/supabase/functions/tests/`:

- `e2e/campaign-orchestrator.test.ts` - End-to-end campaign tests
- `e2e/conversation-orchestrator.test.ts` - Conversation sync tests
- `e2e/sync-salesforce-leads.test.ts` - Salesforce integration tests
- `integration/database.test.ts` - Database operation tests

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All functions pass `deno check` (type checking)
- [ ] Local tests pass (`./run-tests.sh`)
- [ ] Environment variables configured in `.env`
- [ ] Production secrets set via `set-production-secrets.sh`
- [ ] Database migrations applied (`pnpm supabase:deploy`)

### Deployment Steps

```bash
# 1. Verify types
cd apps/web/supabase/functions
deno check campaign-orchestrator/index.ts
deno check conversation-orchestrator/index.ts
deno check sync-salesforce-leads/index.ts

# 2. Set production secrets
./set-production-secrets.sh

# 3. Verify secrets
supabase secrets list

# 4. Deploy all functions
cd ../..  # Back to apps/web
pnpm supabase:functions:deploy:all

# 5. Monitor logs
supabase functions logs campaign-orchestrator --limit 100
supabase functions logs conversation-orchestrator --limit 100
supabase functions logs sync-salesforce-leads --limit 100
```

### Rollback

```bash
# Get version history
supabase functions list

# Rollback to previous version
supabase functions rollback <function-name> --version <previous-version>
```

---

## Monitoring & Debugging

### Logs

```bash
# View recent logs
supabase functions logs campaign-orchestrator --limit 100

# Follow logs in real-time
supabase functions logs campaign-orchestrator --follow

# Filter by time range
supabase functions logs campaign-orchestrator --since "2025-11-19 10:00:00"
```

### Common Log Patterns

**Campaign Orchestrator**:

```log
[orchestrator] tick at 2025-11-19T10:00:00.000Z
[orchestrator] fetched 3 active campaign(s)
[campaign] id=abc123 name="Fall 2025" agent_id=xyz789
[quota] campaign=abc123 cap=100 callsToday=45 remaining=55
[leads] campaign=abc123 limit=55 returned=55
[lead] id=lead123 phone=+1234567890 tz=America/New_York window=09:00-17:00 ok=true
[dial] placing call to +1234567890
[dial] success conversation_id=conv123 callSid=CA123
[campaign_lead] update ok campaign=abc123 lead=lead123 attempts=1 status=contacted
```

**Conversation Orchestrator**:

```log
[conversation-orchestrator] tick at 2025-11-19T10:00:00.000Z
[conversation-orchestrator] syncing 10 conversation(s)
[getConversationHistory] API returned 200
[conversations] update ok id=conv123 attempt=1
```

**Salesforce Sync**:

```log
[sync-salesforce-leads] tick at 2025-11-19T10:00:00.000Z
[sync-salesforce-leads] found 2 active integration(s)
[sync] starting integration_id=int123 business_id=biz456
[sync] fetching Contacts integration_id=int123
[sync] fetched Contacts integration_id=int123 count=150
[sync] fetching Leads integration_id=int123
[sync] fetched Leads integration_id=int123 count=75
[sync] completed integration_id=int123 status=success processed=225 created=180 updated=45 failed=0
```

### Performance Metrics

**Campaign Orchestrator**:

- Average execution time: 2-5 seconds
- Leads processed per run: 10-50
- Calls placed per run: 10-50

**Conversation Orchestrator**:

- Average execution time: 1-3 seconds
- Conversations synced per run: 5-20
- Events created per run: 50-200

**Salesforce Sync**:

- Average execution time: 5-15 seconds
- Records processed per run: 50-2000
- API calls per run: 2-5

---

## Troubleshooting

### Function Won't Start

```bash
# Check Supabase status
pnpm supabase:status

# Restart Supabase
pnpm supabase:stop
pnpm supabase:start

# Check environment variables
cat supabase/functions/.env
```

### Function Timeouts

**Symptom**: Functions hang or timeout after 30-60 seconds

**Solution**: Check network connectivity to external APIs

```bash
# Test ElevenLabs API
curl -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices

# Test Salesforce API
curl -H "Authorization: Bearer $ACCESS_TOKEN" https://your-instance.salesforce.com/services/data/v58.0/
```

### Type Errors

```bash
# Regenerate database types
pnpm supabase:typegen

# Check for TypeScript errors
deno check campaign-orchestrator/index.ts
```

### Missing Secrets in Production

```bash
# List current secrets
supabase secrets list

# Set missing secret
supabase secrets set ELEVENLABS_API_KEY=sk_...

# Re-deploy function to pick up new secrets
supabase functions deploy campaign-orchestrator
```

---

## Security Best Practices

### Secrets Management

✅ **DO**:

- Store API keys in Supabase secrets (production)
- Use `.env` file for local development (gitignored)
- Rotate API keys quarterly
- Use separate keys for dev/staging/production

❌ **DON'T**:

- Hardcode secrets in code
- Commit `.env` files to git
- Share secrets via Slack/email
- Use production keys in development

### API Security

- All functions use CORS headers for cross-origin access
- Service role key used for database operations (server-only)
- OAuth tokens refreshed automatically on expiration
- Rate limiting handled gracefully with retries

### Data Protection

- PII (phone, email) handled securely
- Audit trail via `sync_logs` table
- No secrets logged (API keys masked)
- Database RLS policies enforced

---

## Migration History

**November 17, 2025**: Edge functions migrated from separate repository to main henk monorepo

**Benefits**:

- Unified type system with main application
- Single deployment process
- No port conflicts in local development
- Easier code sharing between frontend and functions

---

## Related Documentation

- [Supabase Local Development](./supabase-local-development.md) - Local database setup
- [Development Workflow](./development-workflow.md) - Git workflow and best practices
- [Environment Configuration](./environment.md) - Environment variable setup
- [Pre-Push Checklist](./pre-push-checklist.md) - Pre-deployment checklist

---

## Support

**Issues**: Report edge function issues at [github.com/anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues)

**Logs**: Check production logs at Supabase Dashboard → Edge Functions → Logs

**Monitoring**: Set up alerts for function failures in Supabase Dashboard

---

_Last updated: November 19, 2025_
