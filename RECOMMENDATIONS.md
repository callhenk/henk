# Henk Platform - Improvement Recommendations

**Last Updated:** November 18, 2025
**Scope:** Features and improvements achievable within 1 week
**Priority Levels:** 🔴 High | 🟡 Medium | 🟢 Low

---

## Table of Contents

1. [Quick Wins (1-2 Days)](#quick-wins-1-2-days)
2. [Medium Effort (2-3 Days)](#medium-effort-2-3-days)
3. [Week-Long Features](#week-long-features)
4. [Code Quality & Maintenance](#code-quality--maintenance)
5. [Developer Experience](#developer-experience)
6. [Monitoring & Observability](#monitoring--observability)
7. [Security Enhancements](#security-enhancements)
8. [User Experience Improvements](#user-experience-improvements)

---

## Quick Wins (1-2 Days)

### 🔴 1. Centralized Error Logging System

**Current State:**

- 215+ `console.error/warn/log` statements scattered across 75 files
- No centralized error tracking
- Difficult to debug production issues

**Proposal:**
Create a structured logging utility that:

- Replaces all `console.*` calls with a typed logger
- Sends errors to external service (Sentry, LogRocket, or Axiom)
- Includes context (user ID, business ID, request ID)
- Has different log levels (debug, info, warn, error, fatal)

**Implementation:**

```typescript
// lib/logger.ts (enhance existing file)
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger({
  service: 'henk-web',
  environment: process.env.NODE_ENV,
  enableSentry: true, // Send errors to Sentry
});

// Usage:
logger.error('Campaign failed to start', {
  campaignId,
  error,
  userId: context.user.id,
});
```

**Impact:**

- Better production debugging
- Faster issue resolution
- User session replay for bug reproduction
- Performance monitoring

**Effort:** 1 day
**Priority:** 🔴 High

---

### 🔴 2. Clean Up TODO Comments

**Current State:**

- 8 files with TODO/FIXME/HACK comments
- Incomplete features and temporary workarounds

**Affected Files:**

- `campaigns-list.tsx`
- `twilio/twiml/route.ts`
- `wizard-container.tsx`
- `import-leads-dialog.tsx`
- `BulkActionsBar.tsx`
- `calling-step.tsx`
- `campaigns/[id]/route.ts`

**Proposal:**

- Convert TODOs into GitHub issues with proper labeling
- Prioritize and tackle high-impact TODOs
- Remove completed TODOs
- Document acceptable workarounds

**Implementation:**

```bash
# 1. Extract all TODOs
grep -r "TODO\|FIXME\|HACK" apps/web/app --exclude-dir=node_modules

# 2. Create GitHub issues for each
# 3. Replace with issue references:
// TODO: Implement retry logic
# becomes:
// See issue #123 - Implement retry logic
```

**Effort:** 4-6 hours
**Priority:** 🔴 High

---

### 🟡 3. Add Health Check Endpoint

**Current State:**

- No system health monitoring
- Difficult to check if services are operational

**Proposal:**
Create `/api/health` endpoint that checks:

- Database connectivity (Supabase)
- ElevenLabs API status
- Twilio API status
- OpenAI API status
- External integrations (Salesforce OAuth)

**Implementation:**

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkSupabase(),
    elevenlabs: await checkElevenLabs(),
    twilio: await checkTwilio(),
    openai: await checkOpenAI(),
  };

  const healthy = Object.values(checks).every((c) => c.status === 'ok');

  return NextResponse.json(
    { status: healthy ? 'healthy' : 'degraded', checks },
    { status: healthy ? 200 : 503 },
  );
}
```

**Impact:**

- Better uptime monitoring
- Proactive issue detection
- Integration with monitoring tools (UptimeRobot, Pingdom)

**Effort:** 4 hours
**Priority:** 🟡 Medium

---

### 🟡 4. Rate Limiting Dashboard

**Current State:**

- Rate limiting exists for `/api/agents/generate-prompts`
- No visibility into rate limit usage
- Users don't know when they're rate limited

**Proposal:**

- Add UI component showing rate limit status
- Display remaining requests and reset time
- Show usage analytics for admins

**Implementation:**

```typescript
// New hook: useRateLimitStatus
export function useRateLimitStatus(endpoint: string) {
  return useQuery({
    queryKey: ['rate-limit', endpoint],
    queryFn: () => fetch(`/api/rate-limit/status?endpoint=${endpoint}`),
    refetchInterval: 10000, // Refresh every 10s
  });
}

// UI: Show badge with remaining requests
<Badge variant={remaining < 3 ? 'destructive' : 'default'}>
  {remaining} requests remaining
</Badge>
```

**Effort:** 6 hours
**Priority:** 🟡 Medium

---

### 🟢 5. Improve Loading States

**Current State:**

- Several pages have basic loading states
- Inconsistent loading UI across pages

**Proposal:**

- Use skeleton loaders for better perceived performance
- Add optimistic updates for mutations
- Show progress indicators for long operations

**Files to Improve:**

- `apps/web/app/home/agents/loading.tsx`
- `apps/web/app/home/campaigns/loading.tsx`
- `apps/web/app/home/conversations/loading.tsx`
- `apps/web/app/home/analytics/loading.tsx`

**Effort:** 4 hours
**Priority:** 🟢 Low

---

## Medium Effort (2-3 Days)

### 🔴 6. Unit Testing Infrastructure

**Current State (from qa-plan.md):**

- ❌ No unit testing framework
- ❌ No code coverage reporting
- Only E2E tests with Playwright

**Proposal:**
Set up Vitest for unit testing:

- Test React Query hooks
- Test utility functions
- Test React components with Testing Library
- Integrate with CI/CD

**Implementation:**

```bash
# Install dependencies
pnpm add -D vitest @testing-library/react @testing-library/jest-dom

# Configure vitest.config.ts
# Write tests for:
# - packages/supabase/src/hooks/**/*.test.ts
# - apps/web/lib/utils/**/*.test.ts
# - apps/web/components/**/*.test.tsx

# Add to package.json:
"test": "vitest",
"test:ui": "vitest --ui",
"test:coverage": "vitest --coverage"
```

**Target Coverage:**

- Utility functions: 80%+
- React Query hooks: 70%+
- API routes: 60%+

**Effort:** 2 days
**Priority:** 🔴 High

---

### 🔴 7. Database Migration Safety System

**Current State:**

- Manual migration creation
- No automated rollback mechanism
- Risk of production data loss

**Proposal:**
Create migration safety workflow:

- Pre-migration backup automation
- Migration validation (dry-run)
- Automatic rollback on failure
- Migration impact analysis

**Implementation:**

```bash
# Enhanced migration workflow
#!/bin/bash
# scripts/migrate-safely.sh

echo "🔍 Analyzing migration impact..."
supabase db diff --local

echo "📸 Creating backup..."
supabase db dump --local > backups/pre-migration-$(date +%s).sql

echo "🧪 Testing migration (dry-run)..."
supabase db test

echo "✅ Ready to apply migration. Continue? [y/N]"
read -r response
if [[ "$response" == "y" ]]; then
  supabase db reset --local
  echo "✅ Migration complete!"
else
  echo "❌ Migration cancelled"
fi
```

**Effort:** 1 day
**Priority:** 🔴 High

---

### 🟡 8. Campaign Performance Analytics

**Current State:**

- Basic analytics exist in `/home/analytics`
- Limited campaign-specific insights
- No A/B testing capabilities

**Proposal:**
Add advanced campaign analytics:

- Call success rate trends
- Agent performance comparison
- Best time to call analysis
- Donor engagement scoring
- Campaign ROI calculator

**New Features:**

- Export analytics to PDF/CSV
- Schedule automatic reports
- Real-time campaign dashboards
- Predictive success scoring

**Effort:** 2-3 days
**Priority:** 🟡 Medium

---

### 🟡 9. Webhook Management System

**Current State:**

- Webhooks exist for Twilio status callbacks
- No centralized webhook management
- Difficult to debug webhook failures

**Proposal:**
Create webhook management UI:

- View all registered webhooks
- Test webhooks with sample payloads
- View webhook delivery history
- Retry failed webhooks
- Webhook signature verification

**Implementation:**

```typescript
// New table: webhook_logs
create table webhook_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  source text not null, -- 'twilio', 'salesforce', 'hubspot'
  event_type text not null,
  payload jsonb not null,
  status text not null, -- 'success', 'failed', 'pending'
  attempts int default 1,
  error_message text,
  created_at timestamptz default now()
);

// New page: /home/settings/webhooks
```

**Effort:** 2 days
**Priority:** 🟡 Medium

---

### 🟢 10. Agent Training Playground

**Current State:**

- Agents can be tested via `/agents/[id]/chat`
- Limited scenario testing
- No systematic training workflow

**Proposal:**
Build an agent training system:

- Pre-defined test scenarios (objections, questions, edge cases)
- Side-by-side comparison of agent responses
- Prompt iteration tracking (version control for prompts)
- Performance scoring based on test scenarios
- Export training reports

**Features:**

- 20+ pre-built scenarios (price objections, wrong number, voicemail, etc.)
- Batch testing (run all scenarios at once)
- Compare before/after prompt changes
- Share successful prompts across agents

**Effort:** 3 days
**Priority:** 🟢 Low

---

## Week-Long Features

### 🔴 11. Conversation Recording & Playback

**Current State:**

- Conversations are logged with transcripts
- No audio recording playback in UI

**Proposal:**
Full conversation recording system:

- Store call recordings in Supabase Storage
- Playback interface in conversation detail page
- Audio waveform visualization
- Highlight key moments (sentiment changes, objections)
- Download recordings for compliance

**Technical Implementation:**

```typescript
// 1. Configure Twilio recording
// app/api/twilio/twiml/route.ts
<Record
  recordingStatusCallback={`${baseUrl}/api/twilio/recording-callback`}
  recordingStatusCallbackEvent="completed"
/>

// 2. Store recordings in Supabase Storage
// buckets: call-recordings (private)

// 3. Add playback UI
// apps/web/app/home/conversations/[id]/_components/recording-player.tsx

// 4. Update database schema
alter table conversations add column recording_url text;
alter table conversations add column recording_duration int;
```

**Security:**

- Recordings are private (RLS policies)
- Pre-signed URLs with expiration
- Audit log for who accessed recordings
- Optional encryption at rest

**Effort:** 5-7 days
**Priority:** 🔴 High

---

### 🟡 12. Multi-Language Support

**Current State:**

- i18n infrastructure exists (`@kit/i18n`)
- Only English is implemented
- `languagePriority` feature flag exists but unused

**Proposal:**
Add multi-language support:

- Spanish (primary target for fundraising)
- French, German, Portuguese
- Language-specific agent prompts
- Translated UI for all pages
- RTL support for future languages (Arabic, Hebrew)

**Implementation:**

```typescript
// 1. Add translations
packages/i18n/locales/
  ├── en.json (existing)
  ├── es.json (new)
  ├── fr.json (new)
  └── de.json (new)

// 2. Update agents table
alter table agents add column language text default 'en';
alter table agents add column context_prompt_i18n jsonb;

// 3. Language selector in UI
// app/home/layout.tsx - add language dropdown

// 4. Agent prompt templates by language
// app/api/agents/generate-prompts/route.ts
// Use language-specific best practices
```

**Effort:** 5-7 days
**Priority:** 🟡 Medium

---

### 🟡 13. Advanced Workflow Automation

**Current State:**

- Basic workflow builder exists with ReactFlow
- Manual workflow execution
- Limited automation triggers

**Proposal:**
Enhanced workflow automation:

- **Triggers:** Time-based, event-based, condition-based
- **Actions:** Send email, create task, update CRM, trigger webhook
- **Conditions:** If/else logic, data validation, scoring
- **Integrations:** Connect to Zapier/Make for unlimited integrations

**New Node Types:**

- Delay (wait N hours/days)
- Branch (conditional logic)
- Loop (repeat for each donor)
- API Call (external HTTP requests)
- Data Transform (modify contact data)
- Send Notification (email/SMS/Slack)

**Example Workflows:**

1. **Follow-up Campaign:** After donation → wait 30 days → send thank you call
2. **Lead Nurturing:** New lead → call attempt → if no answer → wait 2 days → retry
3. **A/B Testing:** Randomly assign 50% to Agent A, 50% to Agent B → compare results

**Effort:** 7 days
**Priority:** 🟡 Medium

---

## Code Quality & Maintenance

### 🔴 14. TypeScript Strictness Improvements

**Current State:**

- Some type assertions and `any` usage
- Missing return types on some functions
- JSONB fields lack type safety

**Proposal:**
Improve type safety:

```typescript
// 1. Enable stricter TypeScript rules
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}

// 2. Create typed wrappers for JSONB columns
type ContactTags = string[];
type SourceMetadata = {
  salesforce_id?: string;
  hubspot_id?: string;
  imported_from?: 'csv' | 'manual' | 'integration';
};
type CustomFields = Record<string, string | number | boolean>;

// 3. Replace type assertions with Zod validation
const TagsSchema = z.array(z.string());
const tags = TagsSchema.parse(contact.tags); // Runtime validation

// 4. Add return types to all functions
function processContact(id: string): Promise<Contact> {
  // ...
}
```

**Effort:** 2 days
**Priority:** 🔴 High

---

### 🟡 15. Component Library Documentation

**Current State:**

- 40+ shared UI components in `@kit/ui`
- No visual documentation
- Difficult to discover available components

**Proposal:**
Set up Storybook for component documentation:

```bash
pnpm add -D @storybook/nextjs @storybook/react

# Create stories for all components
packages/ui/src/button.stories.tsx
packages/ui/src/dialog.stories.tsx
packages/ui/src/input.stories.tsx
# ... etc

# Add script to package.json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

**Benefits:**

- Visual component catalog
- Interactive playground
- Usage examples for each component
- Accessibility testing
- Faster development

**Effort:** 2 days
**Priority:** 🟡 Medium

---

### 🟢 16. Performance Optimization

**Current State:**

- No bundle size monitoring
- Large client-side JavaScript bundles
- Some render performance issues

**Proposal:**
Optimize application performance:

**1. Bundle Analysis:**

```bash
# Already available
pnpm analyze

# Find and fix:
# - Large dependencies (can we lazy load?)
# - Duplicate code (shared chunks)
# - Unused exports (tree-shaking)
```

**2. Code Splitting:**

```typescript
// Lazy load heavy components
const WorkflowBuilder = dynamic(
  () => import('./_components/workflow-builder'),
  { loading: () => <Skeleton /> }
);

// Lazy load charts (Recharts is heavy)
const AnalyticsDashboard = dynamic(
  () => import('./_components/analytics-dashboard'),
  { ssr: false }
);
```

**3. Image Optimization:**

```typescript
// Use next/image for all images
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Henk"
  width={200}
  height={50}
  priority // for above-fold images
/>
```

**4. Database Query Optimization:**

```typescript
// Only select needed columns
const { data } = await supabase
  .from('contacts')
  .select('id, name, email') // Not select('*')
  .limit(50);

// Add indexes for common queries
create index idx_contacts_business_id on contacts(business_id);
create index idx_campaigns_status on campaigns(status);
```

**Target Metrics:**

- Lighthouse score: 90+ on all pages
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 300KB gzipped

**Effort:** 3 days
**Priority:** 🟢 Low

---

## Developer Experience

### 🔴 17. Pre-commit Git Hooks

**Current State:**

- Manual type checking and linting
- Risk of committing broken code
- Inconsistent code formatting

**Proposal:**
Set up Husky + lint-staged:

```bash
pnpm add -D husky lint-staged

# .husky/pre-commit
pnpm lint-staged

# package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "tsc-files --noEmit" // Type check only changed files
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

**Checks:**

- ✅ TypeScript type checking
- ✅ ESLint (with auto-fix)
- ✅ Prettier formatting
- ✅ Secret detection (prevent API key leaks)
- ✅ TODO comment validation

**Effort:** 4 hours
**Priority:** 🔴 High

---

### 🟡 18. Development Seed Data Generator

**Current State:**

- Manual test data creation
- Inconsistent development environments
- Time-consuming setup for new developers

**Proposal:**
Automated seed data generation:

```typescript
// scripts/seed-dev-data.ts
/**
 * Generate realistic development data:
 * - 1 business account
 * - 5 team members
 * - 10 AI agents (different industries)
 * - 500 contacts (realistic names/emails)
 * - 5 campaigns (various statuses)
 * - 100 conversations (with transcripts)
 * - 3 integrations (configured but inactive)
 */
import { faker } from '@faker-js/faker';

async function seedDevData() {
  // Create agents with industry-specific prompts
  const agents = industries.map((industry) => ({
    name: `${industry} Fundraising Agent`,
    voice_id: 'professional-female',
    context_prompt: generateIndustryPrompt(industry),
    // ...
  }));

  // Create realistic contacts
  const contacts = Array.from({ length: 500 }, () => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+1##########'),
    tags: faker.helpers.arrayElements(['donor', 'prospect', 'volunteer']),
    // ...
  }));

  // ... etc
}
```

**Usage:**

```bash
pnpm seed:dev  # Full seed
pnpm seed:minimal  # Just basics
pnpm seed:reset  # Clear and reseed
```

**Effort:** 1.5 days
**Priority:** 🟡 Medium

---

### 🟢 19. API Documentation with OpenAPI

**Current State:**

- No API documentation
- Difficult for integrators to understand endpoints
- Inconsistent request/response formats

**Proposal:**
Generate OpenAPI (Swagger) documentation:

```typescript
// Use @asteasolutions/zod-to-openapi
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

// Define schemas
const CreateAgentSchema = z
  .object({
    name: z.string().min(1).openapi({ example: 'My Fundraising Agent' }),
    voice_id: z.string().openapi({ example: 'professional-female' }),
    // ...
  })
  .openapi('CreateAgent');

// Auto-generate /api/openapi.json
// Serve Swagger UI at /api/docs
```

**Benefits:**

- Interactive API documentation
- Request/response examples
- API client generation
- Type-safe API contracts

**Effort:** 2 days
**Priority:** 🟢 Low

---

## Monitoring & Observability

### 🔴 20. Application Performance Monitoring (APM)

**Current State:**

- No production performance monitoring
- Difficult to identify slow queries
- No visibility into user experience

**Proposal:**
Integrate APM solution (choose one):

**Option A: Vercel Analytics (built-in)**

```typescript
// Already installed: @vercel/analytics, @vercel/speed-insights
// Just enable Web Vitals tracking
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Track custom events
track('campaign_started', { campaign_id });
```

**Option B: Sentry (comprehensive)**

```bash
pnpm add @sentry/nextjs

# Auto-instrument everything:
# - Error tracking
# - Performance monitoring
# - Session replay
# - Release tracking
```

**Metrics to Track:**

- Page load times
- API endpoint latency
- Database query performance
- Error rates by page
- User flow drop-off points
- Real User Monitoring (RUM)

**Effort:** 1 day
**Priority:** 🔴 High

---

### 🟡 21. Database Query Performance Monitoring

**Current State:**

- No visibility into slow queries
- Potential N+1 query problems
- Missing database indexes

**Proposal:**
Set up query performance monitoring:

**1. Enable Supabase Query Performance:**

```sql
-- Check slow queries
select
  query,
  calls,
  total_time,
  mean_time,
  max_time
from pg_stat_statements
order by mean_time desc
limit 20;
```

**2. Add Query Logging:**

```typescript
// middleware: log slow queries
const startTime = Date.now();
const result = await supabase.from('contacts').select('*');
const duration = Date.now() - startTime;

if (duration > 1000) {
  logger.warn('Slow query detected', {
    table: 'contacts',
    duration,
    query: 'select *',
  });
}
```

**3. Create Missing Indexes:**

```sql
-- Analyze common queries and add indexes
create index idx_contacts_email on contacts(email);
create index idx_conversations_agent_id on conversations(agent_id);
create index idx_campaigns_business_status on campaigns(business_id, status);

-- Composite indexes for filtered queries
create index idx_contacts_business_tags on contacts(business_id, tags) using gin;
```

**Effort:** 1 day
**Priority:** 🟡 Medium

---

### 🟢 22. Feature Usage Analytics

**Current State:**

- No visibility into which features are used
- Difficult to prioritize development
- Unknown user behavior patterns

**Proposal:**
Track feature usage with PostHog or Mixpanel:

```typescript
// Track events
analytics.track('workflow_created', {
  node_count: nodes.length,
  agent_id: selectedAgent,
  template_used: templateId,
});

analytics.track('campaign_started', {
  campaign_id,
  contact_count: contacts.length,
  agent_type: agent.industry,
});

// Create dashboards:
// - Most used features
// - User journey funnels
// - Cohort retention analysis
// - A/B test results
```

**Effort:** 1.5 days
**Priority:** 🟢 Low

---

## Security Enhancements

### 🔴 23. API Rate Limiting (Global)

**Current State:**

- Only `/api/agents/generate-prompts` has rate limiting
- Other endpoints are vulnerable to abuse

**Proposal:**
Apply rate limiting to all API routes:

```typescript
// lib/rate-limit-config.ts
export const RATE_LIMITS = {
  default: { requests: 100, window: '15m' },
  auth: { requests: 5, window: '15m' },
  mutations: { requests: 30, window: '1m' },
  integrations: { requests: 10, window: '1m' },
  ai_generation: { requests: 10, window: '1m' },
};

// middleware.ts - apply globally
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const limit = getLimitForPath(path);

  const rateLimitResult = await rateLimiter.check(
    limit.requests,
    limit.window,
    getClientIdentifier(request),
  );

  if (!rateLimitResult.success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  return NextResponse.next();
}
```

**Effort:** 1 day
**Priority:** 🔴 High

---

### 🟡 24. Audit Logging System

**Current State:**

- No audit trail for sensitive operations
- Difficult to track who did what
- Compliance concerns

**Proposal:**
Create comprehensive audit logging:

```sql
-- New table: audit_logs
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  user_id uuid references auth.users(id),
  action text not null, -- 'create', 'update', 'delete', 'access'
  resource_type text not null, -- 'agent', 'campaign', 'contact', 'integration'
  resource_id uuid,
  changes jsonb, -- before/after values
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- Index for queries
create index idx_audit_logs_business on audit_logs(business_id, created_at desc);
create index idx_audit_logs_user on audit_logs(user_id, created_at desc);
```

**Track:**

- Agent creation/modification/deletion
- Campaign starts/stops
- Integration connections
- Contact data exports
- Team member access
- Settings changes

**UI:**

```typescript
// New page: /home/settings/audit-logs
// Display filterable log of all actions
// Export to CSV for compliance
```

**Effort:** 2 days
**Priority:** 🟡 Medium

---

### 🟢 25. Two-Factor Authentication (2FA)

**Current State:**

- Basic email/password authentication
- No 2FA enforcement option
- Risk of account compromise

**Proposal:**
Add 2FA support using Supabase MFA:

```typescript
// 1. Enable MFA in Supabase dashboard
// 2. Add 2FA setup page
// app/home/settings/security/page.tsx
import { useFetchMfaFactors } from '@kit/supabase/hooks/use-fetch-mfa-factors';

// QR code for TOTP setup
// Backup codes generation
// Trusted devices

// 3. Enforce 2FA for admin accounts
// RLS policy: require MFA for certain operations
```

**Effort:** 1.5 days
**Priority:** 🟢 Low

---

## User Experience Improvements

### 🟡 26. Bulk Operations Enhancement

**Current State:**

- Basic bulk actions exist in `BulkActionsBar.tsx`
- Limited functionality

**Proposal:**
Comprehensive bulk operations:

- **Contacts:** Bulk tag, bulk delete, bulk export, bulk add to list
- **Campaigns:** Bulk pause, bulk archive, bulk duplicate
- **Conversations:** Bulk export, bulk analyze sentiment
- **Progress tracking:** Show progress bar for bulk operations
- **Undo capability:** Allow reverting bulk actions

**Implementation:**

```typescript
// Use optimistic updates with React Query
const bulkUpdateMutation = useMutation({
  mutationFn: async (contactIds: string[]) => {
    // Show progress
    for (let i = 0; i < contactIds.length; i += 50) {
      const batch = contactIds.slice(i, i + 50);
      await updateContacts(batch);
      onProgress(i / contactIds.length);
    }
  },
  onSuccess: () => {
    toast.success('Updated 150 contacts');
    // Store action in undo stack
    undoStack.push({ action: 'bulk_update', contactIds, previousData });
  },
});
```

**Effort:** 2 days
**Priority:** 🟡 Medium

---

### 🟡 27. Smart Contact Deduplication

**Current State:**

- No duplicate detection
- Multiple entries for same person
- Data quality issues

**Proposal:**
Automatic duplicate detection and merging:

- Fuzzy matching on name + email + phone
- Suggest merges to user
- Smart merge (preserve best data from each)
- Merge history tracking

**Algorithm:**

```typescript
function findDuplicates(contacts: Contact[]) {
  // 1. Exact email match (100% duplicate)
  // 2. Same phone number (95% duplicate)
  // 3. Similar name + same company (85% duplicate)
  // 4. Levenshtein distance on name < 3 (70% duplicate)

  return duplicatePairs.map((pair) => ({
    contact1: pair[0],
    contact2: pair[1],
    confidence: pair.score,
    suggestedMerge: mergeSuggestion(pair),
  }));
}
```

**UI:**

```typescript
// New page: /home/leads/duplicates
// Show side-by-side comparison
// Allow manual merge or auto-merge
// Preserve history in audit log
```

**Effort:** 3 days
**Priority:** 🟡 Medium

---

### 🟢 28. Keyboard Shortcuts

**Current State:**

- No keyboard navigation
- Mouse-dependent interface

**Proposal:**
Add keyboard shortcuts for power users:

```typescript
// Global shortcuts
Cmd/Ctrl + K: Command palette (search anything)
Cmd/Ctrl + /: Show keyboard shortcuts
Cmd/Ctrl + B: Toggle sidebar

// Page-specific shortcuts
Agents page:
  N: New agent
  /: Focus search

Campaigns page:
  N: New campaign
  S: Start selected campaign
  P: Pause selected campaign

Contacts page:
  N: Add contact
  I: Import contacts
  E: Export selected

// Navigation
G then A: Go to Agents
G then C: Go to Campaigns
G then L: Go to Leads
G then D: Go to Dashboard
```

**Implementation:**

```typescript
// Use @radix-ui/react-command or cmdk
import { Command } from 'cmdk';

<Command.Dialog open={open} onOpenChange={setOpen}>
  <Command.Input placeholder="Search or jump to..." />
  <Command.List>
    <Command.Group heading="Navigation">
      <Command.Item onSelect={() => router.push('/home/agents')}>
        Agents
      </Command.Item>
      // ...
    </Command.Group>
  </Command.List>
</Command.Dialog>
```

**Effort:** 2 days
**Priority:** 🟢 Low

---

## Implementation Priority Matrix

| Priority  | Quick Wins                          | Medium Effort                                                               | Week-Long                                                 |
| --------- | ----------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------- |
| 🔴 High   | #1 Error Logging<br>#2 Clean TODOs  | #6 Unit Testing<br>#7 Migration Safety<br>#14 TypeScript                    | #11 Call Recording<br>#20 APM<br>#23 Rate Limiting        |
| 🟡 Medium | #3 Health Check<br>#4 Rate Limit UI | #8 Campaign Analytics<br>#9 Webhook Mgmt<br>#15 Storybook<br>#21 Query Perf | #12 Multi-Language<br>#13 Workflow Auto<br>#24 Audit Logs |
| 🟢 Low    | #5 Loading States                   | #10 Agent Training<br>#16 Performance<br>#18 Seed Data<br>#19 API Docs      | #22 Usage Analytics<br>#25 2FA<br>#28 Keyboard            |

---

## Recommended 1-Week Sprint

**Day 1-2: Foundation & DevEx**

- [ ] #1: Centralized error logging (Sentry integration)
- [ ] #2: Clean up TODO comments → GitHub issues
- [ ] #17: Pre-commit hooks (Husky + lint-staged)
- [ ] #3: Health check endpoint

**Day 3-4: Testing & Quality**

- [ ] #6: Unit testing infrastructure (Vitest setup)
- [ ] #14: TypeScript strictness improvements
- [ ] #7: Database migration safety system
- [ ] Write tests for critical hooks

**Day 5-7: Monitoring & User Features**

- [ ] #20: APM with Sentry or Vercel Analytics
- [ ] #23: Global API rate limiting
- [ ] #8: Enhanced campaign analytics (if time permits)
- [ ] #26: Bulk operations improvements (if time permits)

**Expected Outcomes:**

- ✅ Better code quality and developer experience
- ✅ Production-ready monitoring and error tracking
- ✅ Safer deployment process
- ✅ Foundation for future testing
- ✅ Improved application security

---

## Metrics to Track

After implementing these improvements, track:

**Code Quality:**

- Test coverage %
- TypeScript errors: 0
- ESLint warnings: < 10
- Bundle size (gzipped)

**Performance:**

- Lighthouse score: > 90
- API response time: p95 < 500ms
- Database query time: p95 < 100ms

**Reliability:**

- Error rate: < 0.1%
- Uptime: > 99.9%
- Failed deployments: 0

**User Experience:**

- Time to first interaction: < 2s
- Feature usage rate
- User satisfaction (NPS)

---

## Long-Term Roadmap (Beyond 1 Week)

**1-3 Months:**

- AI-powered donor insights and predictions
- Mobile app (React Native)
- Advanced CRM integrations (HubSpot, Pipedrive)
- SMS campaign support
- Video call capabilities
- White-label solution

**3-6 Months:**

- Enterprise features (SSO, RBAC, custom domains)
- AI agent voice cloning
- Multi-channel campaigns (email + voice + SMS)
- Reporting & compliance dashboard
- API for third-party integrations
- Marketplace for agent templates

---

**Document maintained by:** Claude Code
**Last reviewed:** November 18, 2025
**Next review:** December 18, 2025
