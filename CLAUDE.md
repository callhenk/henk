# Claude Code Guidelines for Henk

This document provides context and guidelines for working on the Henk platform with Claude Code.

> **Documentation Note:** The project documentation has been cleaned and organized (Nov 2024). All available documentation is in the `docs/` folder. See `docs/README.md` for the complete index. Additional documentation includes:
>
> - `docs/demo-system.md` - Demo and self-onboarding system
> - `docs/development-workflow.md` - Development workflow guide
> - `docs/environment.md` - Environment setup and configuration
> - `docs/tech-stack.md` - Technology stack details
> - `docs/qa-plan.md` - QA and testing plan
> - `docs/pre-push-checklist.md` - Pre-deployment checklist

## Project Overview

Henk is a conversational AI fundraising and campaign management platform built with Next.js, Supabase, and TypeScript. The platform enables businesses to create AI voice agents powered by ElevenLabs to conduct automated fundraising calls, manage donor relationships, run campaigns, and integrate with CRM systems.

## Repository Structure

```
henk/
├── apps/
│   ├── e2e/                    # End-to-end tests
│   └── web/                    # Main Next.js application
│       ├── app/                # Next.js App Router pages
│       │   ├── (marketing)/    # Marketing pages (landing, pricing)
│       │   ├── home/           # Authenticated app pages
│       │   ├── api/            # API routes
│       │   └── auth/           # Authentication pages
│       ├── components/         # Shared React components
│       ├── config/             # Application configuration
│       │   ├── app.config.ts
│       │   ├── auth.config.ts
│       │   ├── feature-flags.config.ts
│       │   ├── navigation.config.tsx
│       │   └── paths.config.ts
│       ├── lib/                # Utility functions and types
│       │   ├── middleware/     # Authentication & authorization middleware
│       │   ├── supabase/       # Supabase client helpers
│       │   ├── constants/      # Application constants
│       │   └── database.types.ts
│       ├── supabase/           # Supabase configuration and migrations
│       │   ├── migrations/     # Database migration files
│       │   └── tests/          # Database tests
│       └── package.json
├── packages/
│   ├── i18n/                   # Internationalization (@kit/i18n)
│   ├── next/                   # Next.js utilities (@kit/next)
│   ├── shared/                 # Shared utilities (@kit/shared)
│   ├── supabase/              # Supabase client and hooks (@kit/supabase)
│   │   └── src/
│   │       ├── hooks/          # React Query hooks by domain
│   │       └── database.types.ts
│   └── ui/                    # Shared UI components (@kit/ui - shadcn/ui)
├── docs/                       # Project documentation
└── pnpm-workspace.yaml        # Monorepo configuration
```

## Development Workflow

### Starting Development

```bash
# Start the development server (with environment variables and pino-pretty logging)
pnpm dev

# Start local Supabase instance
pnpm supabase:start

# Check Supabase status
pnpm supabase:status
```

### Running Tests & Checks

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format checking
pnpm format

# Build (production)
pnpm build

# Build (test environment)
pnpm build:test
```

### Database Operations

```bash
# Reset local database
pnpm supabase:reset

# Run database tests
pnpm supabase:test

# Lint database
pnpm supabase:db:lint

# Generate TypeScript types from database schema
pnpm supabase:typegen

# Deploy to Supabase (requires SUPABASE_PROJECT_REF)
pnpm supabase:deploy

# Dump local database data
pnpm supabase:db:dump:local
```

## Code Style Guidelines

### TypeScript Conventions

- **Use strict typing**: Leverage TypeScript's type system fully. Avoid `any` types.
- **Database types**: Use generated types from `lib/database.types.ts` or `@kit/supabase/src/database.types.ts`
- **Export types**: Export types alongside components for reusability
- **Type imports**: Use `type` keyword for type-only imports: `import type { User } from './types'`

### React Patterns

- **Use Server Components by default**: Only add `'use client'` when needed (hooks, browser APIs, interactivity)
- **Hooks**: Import React Query hooks from `@kit/supabase/hooks/*`
- **UI Components**: Import from `@kit/ui/*` (shadcn/ui based)
- **Icons**: Use `lucide-react` for icons
- **Forms**: Use `react-hook-form` with `zod` validation

### UI Design Principles

**Keep It Simple:**

- Avoid over-complicating designs with excessive gradients, shadows, or complex animations
- Prefer clean, straightforward layouts over overly "fancy" designs
- Use Tailwind's utility classes judiciously - more classes ≠ better design
- The best UI is often the simplest one that clearly communicates its purpose

**Step Indicators & Progress:**

- Use horizontal layouts for step indicators (not vertical or complex wrapped layouts)
- Prefer numbered steps (1, 2, 3) or simple icons
- Completed steps: checkmark icons with green/success color
- Current step: highlighted with primary color and optional ring
- Future steps: muted color with border
- Keep step labels short (1-2 words max)

**Alignment & Spacing:**

- **Center-align headers and titles** for landing/demo pages
- **Left-align content** for dashboard/app pages
- Use consistent spacing with Tailwind's spacing scale (gap-2, gap-3, gap-4, etc.)
- Avoid mixing different spacing systems in the same component

**Colors & Theming:**

- Stick to the project's color palette (primary, secondary, muted, etc.)
- Use semantic colors: green for success, red for errors, blue for info
- Support both light and dark modes with `dark:` prefixes
- Avoid hardcoded colors - use Tailwind theme colors

**Responsive Design:**

- Mobile-first approach: design for mobile, enhance for desktop
- Use `sm:`, `md:`, `lg:` prefixes for responsive adjustments
- Test on mobile viewport (375px width minimum)
- Ensure touch targets are at least 44x44px on mobile

**Common Mistakes to Avoid:**

- ❌ Adding complex gradient backgrounds to simple pages
- ❌ Using excessive blur effects (`blur-3xl`, backdrop-blur)
- ❌ Creating overly complex step indicators with multiple layers
- ❌ Mixing center and left alignment in the same section
- ❌ Using `React.cloneElement` for simple icon rendering (just render the icon directly)
- ❌ Forgetting to import React when using JSX features like `React.cloneElement`

### File Naming

- **Components**: PascalCase (e.g., `IntegrationCard.tsx`)
- **Utilities**: kebab-case (e.g., `format-date.ts`)
- **Routes**: kebab-case folders (e.g., `app/home/integrations/`)
- **Types**: PascalCase (e.g., `UiIntegration`)

### Component Organization

```typescript
// 1. 'use client' directive (if needed)
'use client';

// 2. Imports (external, then internal)
import { useState } from 'react';

import { Button } from '@kit/ui/button';

// 1. 'use client' directive (if needed)

// 1. 'use client' directive (if needed)

// 1. 'use client' directive (if needed)

// 1. 'use client' directive (if needed)

// 3. Types/Interfaces
interface MyComponentProps {
  title: string;
}

// 4. Component
export function MyComponent({ title }: MyComponentProps) {
  // ...
}

// 5. Helper functions (if not exported)
function helperFunction() {
  // ...
}
```

## Key Technologies

- **Framework**: Next.js 15.3.2 (App Router) with React 19.1.0
- **Database**: Supabase (PostgreSQL) with supabase-js 2.48.1
- **Styling**: Tailwind CSS 4.1.7 with autoprefixer
- **UI Library**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (@tanstack/react-query 5.77.2)
- **Forms**: react-hook-form 7.56+ with zod 3.25+ validation
- **Icons**: lucide-react
- **Date Handling**: date-fns 4.1+
- **AI Services**:
  - **Voice AI**: ElevenLabs (@elevenlabs/react) for conversational AI agents
  - **Prompt Generation**: OpenAI GPT for intelligent agent prompt generation
- **Workflow Builder**: ReactFlow 11+ for visual campaign workflow design
- **Data Tables**: @tanstack/react-table for advanced table functionality
- **Charts**: Recharts 2.15+ for data visualization
- **Drag & Drop**: @dnd-kit for sortable lists and drag interactions
- **Toast Notifications**: sonner for user feedback
- **Theme Management**: next-themes for dark/light mode

## Environment Variables

The project uses environment-specific configuration:

- `.env.local` - Local development (gitignored)
- `.env.test` - Test environment (gitignored)
- Use `pnpm with-env` to run commands with `.env.local`
- Use `pnpm with-env:test` to run commands with `.env.test`

**Required Variables:**

- `NEXT_PUBLIC_APP_URL` - Application URL (e.g., `http://localhost:3000`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (safe for client-side)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only, never expose)
- `ELEVENLABS_API_KEY` - ElevenLabs API key for voice generation and conversational AI
- `OPENAI_API_KEY` - OpenAI API key for agent prompt generation

**Optional Variables:**

- `SUPABASE_PROJECT_REF` - Supabase project reference for deployment
- `ANALYZE` - Set to `true` to enable bundle analysis (`pnpm analyze`)
- `NODE_ENV` - Environment mode (`development`, `production`, `test`)

**Security Notes:**

- **NEVER commit `.env.local` or `.env.test`** - they are gitignored for security
- **Server-only secrets**: `SUPABASE_SERVICE_ROLE_KEY`, `ELEVENLABS_API_KEY`, `OPENAI_API_KEY` should only be used in server components, API routes, or server actions
- **Client-safe variables**: Only `NEXT_PUBLIC_*` prefixed variables are exposed to the browser
- **Pre-commit hook**: The repository includes secret detection to prevent accidental commits of sensitive data

## Database Schema

### Key Tables

**Core Business:**

- `businesses` - Business/organization records (multi-tenant root)
- `team_members` - User memberships in businesses (access control)

**Donors/Contacts:**

- `contacts` - Donor/contact records from multiple sources (Salesforce, CSV, manual, HubSpot)
  - Contains: name, email, phone, tags (JSONB), source_metadata (JSONB), custom_fields (JSONB)
- `contact_lists` - Grouping donors for campaigns (static/dynamic lists)
- `contact_list_members` - Many-to-many join table for contacts and lists

**Campaigns & Workflows:**

- `campaigns` - Campaign records with status, goals, and metrics
- `workflows` - Workflow definitions for campaigns (ReactFlow graphs)
- `workflow_nodes` - Nodes in workflow graphs (call actions, conditions, delays)
- `workflow_edges` - Edges connecting workflow nodes (flow logic)

**AI Agents & Conversations:**

- `agents` - AI voice agents configuration with ElevenLabs integration
  - Contains: name, voice settings, context_prompt, starting_message, ElevenLabs agent_id
  - Prompts follow ElevenLabs best practices (tone, guardrails, conversation flow)
- `conversations` - Call records with transcripts, duration, status
- `conversation_events` - Event stream for call progress tracking

**Integrations & Data:**

- `integrations` - Third-party integration connections (Salesforce, HubSpot, etc.)
  - Contains: credentials (JSONB), config (JSONB), status
- `leads` - Lead records with `contact_id` foreign key

**Performance & Monitoring:**

- `performance_metrics` - Agent and campaign performance tracking
- `call_attempts` - Individual call attempt records
- `call_logs` - Detailed call logs and outcomes

### Integration Schema

Integrations use flexible JSONB columns:

- `credentials` - OAuth tokens, API keys (encrypted)
- `config` - Integration-specific configuration
- `status` - One of: `active`, `inactive`, `connected`, `disconnected`, `needs_attention`, `error`, `coming_soon`, `deprecated`

## Configuration Files

The `apps/web/config/` directory contains centralized application configuration:

### app.config.ts

Application-wide settings (name, description, URLs, features)

### auth.config.ts

Authentication settings (providers, session duration, redirects)

### feature-flags.config.ts

Feature toggles for enabling/disabling functionality

### navigation.config.tsx

Sidebar navigation structure with icons and paths

### paths.config.ts

Path definitions with Zod validation for type-safe routing

**Pattern for adding new routes:**

```typescript
// 1. Add to paths.config.ts
export const pathsConfig = z.object({
  myNewFeature: z.object({
    index: z.string().default('/home/my-feature'),
  }),
});

// 2. Add to navigation.config.tsx
{
  label: 'My Feature',
  path: configuration.paths.myNewFeature.index,
  Icon: <MyIcon className="h-4" />,
}
```

## Common Patterns

### React Query Mutations

```typescript
import { useCreateIntegration } from '@kit/supabase/hooks/integrations/use-integration-mutations';

const createIntegration = useCreateIntegration();

await createIntegration.mutateAsync({
  name: 'Salesforce',
  type: 'crm',
  status: 'inactive',
  credentials: { clientId, clientSecret },
  config: { env: 'production' },
});
```

### Authentication Middleware

```typescript
// lib/middleware/auth.ts
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function requireAuth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  return user;
}
```

### Rate Limiting

```typescript
import { RATE_LIMITS } from '~/lib/constants';
import rateLimiter from '~/lib/simple-rate-limit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  const rateLimitResult = await rateLimiter.check(
    RATE_LIMITS.PROMPT_GENERATION.requests,
    RATE_LIMITS.PROMPT_GENERATION.window,
    `prompt-gen:${ip}`,
  );

  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Process request...
}
```

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Query data
  const { data, error } = await supabase
    .from('integrations')
    .select('*')
    .eq('business_id', businessId);

  return NextResponse.json({ data });
}
```

### Server Components with Data Loading

```typescript
import { createClient } from '@/lib/supabase/server';

export default async function IntegrationsPage() {
  const supabase = await createClient();

  const { data: integrations } = await supabase
    .from('integrations')
    .select('*');

  return <IntegrationsController items={integrations} />;
}
```

## Testing Guidelines

- Write tests in `supabase/tests/*.sql` for database functions
- Run with `pnpm supabase:test`
- Use the test environment for integration testing: `pnpm build:test && pnpm start:test`

## Git Workflow

### Commit Messages

Follow conventional commits format:

- `feat: Add Salesforce integration`
- `fix: Resolve OAuth callback error`
- `refactor: Simplify integration drawer logic`
- `docs: Update Salesforce setup guide`
- `chore: Update dependencies`

**Important:** Do NOT include "Co-Authored-By: Claude" or any AI attribution in commit messages.

### Branch Naming

- `feature/integration-salesforce`
- `fix/oauth-callback-error`
- `refactor/simplify-drawer`
- `docs/update-guides`

## AI Agent Development

### ElevenLabs Conversational AI Best Practices

The platform uses ElevenLabs Conversational AI for voice agents. Agent prompts follow a structured format with hardcoded best practices:

**Required Sections in Agent Prompts:**

1. **Identity & Purpose** - Who the agent is and what they do
2. **Tone** - How the agent speaks (natural, conversational, brief)
3. **Conversation Flow** - Structured steps for handling calls
4. **Guardrails** - Boundaries and safety rules
5. **Tools** - Available integrations and capabilities

**Hardcoded Best Practice Sections:**

```typescript
// These sections are automatically included in all agent prompts
const TONE_SECTION = `# Tone
- Use natural speech patterns with occasional filler words
- Keep responses conversational and concise (2-3 sentences)
- Mirror the user's energy level and formality
- Use brief pauses (commas, ellipses) for natural rhythm
- Speak numbers clearly: "one two three" not "123"
- Check understanding: "Does that make sense?"
- Adapt technical language to user's knowledge level`;

const GUARDRAILS_SECTION = `# Guardrails
- Stay On Topic: Politely redirect off-topic questions
- Honesty: Say "I'm not sure" rather than guessing
- Privacy: Never ask for unnecessary sensitive information
- Boundaries: Maintain professional role
- Brevity: Keep responses under 30 seconds
- No Fabrication: Only provide verified information`;
```

### AI Prompt Generation API

```typescript
// POST /api/agents/generate-prompts
// Generates optimized prompts using OpenAI GPT

interface GeneratePromptsRequest {
  description: string;
  fieldType: 'context_prompt' | 'starting_message' | 'both';
  agentName?: string;
  industry?: string;
}

// Rate limited: 10 requests per 60 seconds per IP
// Returns: Generated prompts following ElevenLabs best practices
```

### Agent Voice Settings

```typescript
interface AgentVoiceSettings {
  stability: number; // 0-1, how consistent the voice is
  similarity_boost: number; // 0-1, how closely it matches the voice
  style: number; // 0-1, exaggeration level
  use_speaker_boost: boolean;
}
```

### Creating an Agent

1. **Design the agent's identity and purpose**
2. **Generate optimized prompts** via `/api/agents/generate-prompts`
3. **Select a voice** from ElevenLabs voice library
4. **Configure voice settings** (stability, similarity, style)
5. **Test with sample conversations**
6. **Iterate based on performance**

### Agent Knowledge Base

Agents can access knowledge through:

- **Context Prompt**: Background information about the organization
- **Integration Data**: Real-time data from CRM (Salesforce, HubSpot)
- **Contact Information**: Donor history, preferences, giving patterns
- **Campaign Details**: Current campaign goals, progress, talking points

## Integration Development

When building new integrations:

1. **Define Schema**: Add to `apps/web/app/home/integrations/_components/mock-data.tsx`
2. **API Routes**: Create authorize and callback routes in `apps/web/app/api/integrations/[name]/`
3. **Database**: Store credentials in JSONB `credentials` column
4. **UI**: Integration cards auto-generate from schema
5. **Documentation**: Create in-app guide at `/home/integrations/[name]-guide/page.tsx`

### OAuth Flow Pattern

```typescript
// authorize route
export async function GET(request: NextRequest) {
  // 1. Get business-specific credentials from database
  // 2. Build authorization URL
  // 3. Store state in database
  // 4. Redirect to provider
}

// callback route
export async function GET(request: NextRequest) {
  // 1. Verify state parameter
  // 2. Exchange code for tokens
  // 3. Store tokens in integration credentials
  // 4. Update status to 'active'
  // 5. Redirect to integrations page
}
```

## Documentation Standards

- **User-facing guides**: Create in-app pages (e.g., `/home/integrations/salesforce-guide/page.tsx`)
- **Admin/developer docs**: Keep as markdown in repo root (e.g., `SALESFORCE_ADMIN_SETUP.md`)
- **API documentation**: Use JSDoc comments for functions
- **Component documentation**: Include usage examples in comments

## Common Tasks

### Adding a New Integration

1. Add schema to `mock-data.tsx`
2. Create `/api/integrations/[name]/authorize/route.ts`
3. Create `/api/integrations/[name]/callback/route.ts`
4. Create in-app guide at `/home/integrations/[name]-guide/page.tsx`
5. Test OAuth flow end-to-end
6. Document admin setup if needed

### Updating Database Schema

1. Create migration: `supabase migration new migration_name`
2. Write SQL in `apps/web/supabase/migrations/`
3. Test locally: `pnpm supabase:reset` (resets local DB and applies all migrations)
4. Run database tests: `pnpm supabase:test`
5. Lint database: `pnpm supabase:db:lint` (checks for common issues)
6. Generate types: `pnpm supabase:typegen` (updates both packages and app types)
7. Update affected code and run `pnpm typecheck`
8. Deploy safely: `pnpm supabase:deploy:safe` (uses safe deployment script)

**IMPORTANT**: Never use `pnpm supabase:deploy:UNSAFE` - it's intentionally broken to prevent accidental production deploys. Always use `pnpm supabase:deploy:safe` which runs the safe deployment script.

### Bundle Analysis

```bash
# Analyze production bundle size
pnpm analyze

# This builds with ANALYZE=true and opens the bundle analyzer
# Helps identify large dependencies and optimization opportunities
```

### Debugging Supabase

```bash
# Check logs
supabase functions logs

# Reset and start fresh
pnpm supabase:reset

# Check connection
pnpm supabase:status

# Dump local database data (for backups or sharing state)
pnpm supabase:db:dump:local

# Start Supabase (starts if stopped, shows status if running)
pnpm supabase:start
```

### Common Workflows

**Starting a new feature:**

```bash
# 1. Ensure Supabase is running
pnpm supabase:start

# 2. Start development server with logs
pnpm dev

# 3. Make changes and test

# 4. Check types and lint
pnpm typecheck
pnpm lint
```

**After making database changes:**

```bash
# 1. Create migration
supabase migration new feature_name

# 2. Edit migration file in apps/web/supabase/migrations/

# 3. Reset local database to apply migration
pnpm supabase:reset

# 4. Test migration
pnpm supabase:test

# 5. Generate new types
pnpm supabase:typegen

# 6. Fix any TypeScript errors
pnpm typecheck
```

**Before pushing code:**

```bash
# Run all checks
pnpm typecheck
pnpm lint
pnpm build

# See docs/pre-push-checklist.md for full checklist
```

## Performance Considerations

- **Minimize client components**: Use server components when possible
- **Optimize images**: Use Next.js `<Image>` component
- **Code splitting**: Dynamic imports for heavy components
- **Database queries**: Use `.select()` to fetch only needed columns
- **React Query**: Configure appropriate stale times and cache

## Security Best Practices

### Secret Management

- **Never commit secrets**: Use environment variables (`.env.local`, `.env.test`)
- **Pre-commit hook**: Automatic secret detection prevents accidental commits
- **Server-only secrets**: Keep API keys in server components/routes only
- **Client-safe variables**: Only expose `NEXT_PUBLIC_*` prefixed vars to browser
- **Encrypt sensitive data**: Store encrypted credentials in database JSONB columns

### Authentication & Authorization

- **Always verify authentication**: Use `requireAuth()` middleware in protected routes
- **RLS policies**: All tables have Row Level Security enabled
- **Multi-tenant isolation**: Always filter by `business_id` via `team_members` join
- **Never bypass RLS**: Use service role key only when absolutely necessary

### Input Validation & Sanitization

- **Validate all inputs**: Use zod schemas for type-safe validation
- **Sanitize database queries**: Use Supabase's parameterized queries
- **Prevent injection**: Never concatenate user input into queries
- **Validate file uploads**: Check file types, sizes, and content

### Rate Limiting

- **Protect expensive operations**: Use rate limiter for AI generation, bulk operations
- **Per-IP limits**: Track by IP address for anonymous endpoints
- **Per-user limits**: Track by user ID for authenticated endpoints
- **Example**: Prompt generation limited to 10 requests/60 seconds

### API Security

- **CORS**: Only allow trusted origins
- **CSRF protection**: Use `@edge-csrf/nextjs` for form submissions
- **Error handling**: Never expose sensitive info in error messages
- **Logging**: Log security events without exposing credentials

### Data Protection

- **PII handling**: Treat donor data as sensitive personal information
- **Data retention**: Follow compliance requirements for donor data
- **Audit trail**: Log access to sensitive data
- **Backup security**: Ensure backups are encrypted and access-controlled

## Troubleshooting

### Supabase Connection Issues

```bash
pnpm supabase:stop
pnpm supabase:start
```

### Type Generation Issues

```bash
pnpm supabase:typegen
pnpm typecheck
```

### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build
```

## Resources

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs) - App Router, Server Components, API Routes
- [Supabase Documentation](https://supabase.com/docs) - Database, Auth, Realtime, Storage
- [ElevenLabs Conversational AI](https://elevenlabs.io/docs/conversational-ai) - Voice agents, best practices
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference) - GPT models, prompt engineering
- [shadcn/ui Components](https://ui.shadcn.com) - UI component library
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [React Query](https://tanstack.com/query/latest) - Data fetching and state management
- [ReactFlow](https://reactflow.dev/) - Workflow builder components
- [Zod](https://zod.dev/) - TypeScript-first schema validation

### Internal Documentation

All project documentation is in the `docs/` folder:

- `docs/README.md` - Complete documentation index
- `docs/quick-start.md` - Getting started guide
- `docs/development-workflow.md` - Development best practices
- `docs/tech-stack.md` - Technology stack details
- `docs/project-structure.md` - Repository organization
- `docs/environment.md` - Environment configuration
- `docs/demo-system.md` - Demo and self-onboarding
- `docs/supabase-local-development.md` - Local Supabase setup
- `docs/storage-buckets.md` - File storage patterns
- `docs/qa-plan.md` - Testing and QA strategy
- `docs/pre-push-checklist.md` - Pre-deployment checklist

---

## Important Notes for Claude

### Terminology

- **UI uses "Donors"** terminology (`/home/donors` route, "Donors" in navigation)
- **Backend/database uses "contacts"** (`contacts` table, `useContacts()` hooks)
- **Do NOT rename database tables/hooks** to match UI terminology - this is intentional

### Database Type Generation

After any migration that modifies the schema, you MUST regenerate types in TWO locations:

```bash
pnpm supabase:typegen  # Generates both:
# 1. packages/supabase/src/database.types.ts (shared across packages)
# 2. apps/web/lib/database.types.ts (app-specific copy)
```

### Multi-Tenancy Pattern

All data queries MUST be scoped by business:

```typescript
const { data: businessContext } = useBusinessContext();
// Always filter by business_id
.eq('business_id', businessContext.business_id)
```

### Row Level Security (RLS)

- All tables have RLS enabled
- Policies check `team_members` table for access
- Never bypass RLS policies in application code

### Integration Development

When checking if integration is database-backed vs. mock:

```typescript
const isDbIntegration = item.id.length > 20; // UUIDs are longer than simple IDs
```

### Hooks Pattern

- **Query hooks**: `packages/supabase/src/hooks/[domain]/use-[domain].ts`
- **Mutation hooks**: `packages/supabase/src/hooks/[domain]/use-[domain]-mutations.ts`
- Always invalidate queries after mutations using `queryClient.invalidateQueries()`

### Navigation Changes

When adding new routes, update BOTH:

1. `config/paths.config.ts` - Define path with Zod validation
2. `config/navigation.config.tsx` - Add to sidebar with icon

### Type Safety with JSONB

JSONB columns (tags, source_metadata, custom_fields) need explicit casting:

```typescript
{(contact.tags as string[]).map(...)}
```

### Workspace Packages (@kit/\*)

The monorepo uses workspace packages with the `@kit/` prefix:

- `@kit/ui` - Shared UI components (shadcn/ui)
- `@kit/supabase` - Supabase client, hooks, and types
- `@kit/next` - Next.js utilities
- `@kit/i18n` - Internationalization
- `@kit/auth` - Authentication utilities
- `@kit/accounts` - Account management

**Import pattern:**

```typescript
import { useAgents } from '@kit/supabase/hooks/agents/use-agents';
import { Button } from '@kit/ui/button';
```

### OpenAI Integration

- **Purpose**: Generate optimized AI agent prompts
- **Location**: `apps/web/app/api/agents/generate-prompts/route.ts`
- **Rate limit**: 10 requests per 60 seconds per IP
- **Environment**: Requires `OPENAI_API_KEY`
- **Pattern**: Hardcoded best practice sections + dynamic generation

### Constants Organization

Store constants in `apps/web/lib/constants/`:

- `index.ts` - General constants (rate limits, features)
- `demo.ts` - Demo system configuration
- Domain-specific constants as needed

### Demo System

The platform includes a self-onboarding demo:

- Public access for prospects to test the platform
- Pre-configured demo data (agents, campaigns, donors)
- See `docs/demo-system.md` for details

### ElevenLabs Agent Best Practices

When working with AI agents:

- **Always include hardcoded sections**: Tone, Guardrails, Tools
- **Keep prompts concise**: Agents perform better with clear, brief instructions
- **Test voice settings**: stability, similarity_boost, style affect quality
- **Natural conversation flow**: Structure as numbered steps
- **Handle missing API key gracefully**: Check for `ELEVENLABS_API_KEY` before using

### Development Checklist

- Always use `pnpm` instead of `npm` or `yarn`
- Run `pnpm typecheck` before committing
- Run `pnpm lint` to catch issues early
- Environment variables loaded via `pnpm with-env` wrapper
- Server components are default; only use `'use client'` when necessary
- After database migrations, run `pnpm supabase:typegen` (generates types in TWO locations)
- Test rate-limited endpoints carefully to avoid lockout during development
- Never commit `.env.local` or `.env.test` files (pre-commit hook will catch this)
