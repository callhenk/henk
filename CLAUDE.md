# Claude Code Guidelines for Henk

This document provides context and guidelines for working on the Henk platform with Claude Code.

> **Documentation Note:** The project documentation has been cleaned and organized (Nov 2024). All available documentation is in the `docs/` folder. See `docs/README.md` for the complete index. References to non-existent documentation files have been removed.

## Project Overview

Henk is a fundraising and campaign management platform built with Next.js, Supabase, and TypeScript. The platform helps businesses manage campaigns, integrations, and client relationships.

## Repository Structure

```
henk/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── app/                # Next.js App Router pages
│       ├── lib/                # Utility functions and types
│       ├── supabase/           # Supabase configuration and migrations
│       └── package.json
├── packages/
│   ├── supabase/              # Supabase client and hooks
│   ├── ui/                    # Shared UI components (shadcn/ui)
│   └── ...
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

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **UI Library**: shadcn/ui (Radix UI primitives)
- **State Management**: React Query (@tanstack/react-query)
- **Forms**: react-hook-form + zod
- **Icons**: lucide-react
- **Date Handling**: date-fns
- **AI Voice**: ElevenLabs (@elevenlabs/react) for conversational AI agents
- **Workflow Builder**: ReactFlow for visual campaign workflow design

## Environment Variables

The project uses environment-specific configuration:

- `.env.local` - Local development (gitignored)
- `.env.test` - Test environment (gitignored)
- Use `pnpm with-env` to run commands with `.env.local`
- Use `pnpm with-env:test` to run commands with `.env.test`

**Required Variables:**
- `NEXT_PUBLIC_APP_URL` - Application URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `ELEVENLABS_API_KEY` - ElevenLabs API key for voice generation and conversational AI

## Database Schema

### Key Tables

- `businesses` - Business/organization records
- `team_members` - User memberships in businesses
- `contacts` - Donor/contact records from multiple sources (Salesforce, CSV, manual, HubSpot)
- `contact_lists` - Grouping donors for campaigns (static/dynamic lists)
- `contact_list_members` - Many-to-many join table for contacts and lists
- `campaigns` - Campaign records
- `agents` - AI voice agents configuration with ElevenLabs integration
- `conversations` - Call records with transcripts
- `integrations` - Third-party integration connections
- `leads` - Lead records with `contact_id` foreign key
- `workflows` - Workflow definitions for campaigns
- `workflow_nodes` - Nodes in workflow graphs
- `workflow_edges` - Edges connecting workflow nodes

### Integration Schema

Integrations use flexible JSONB columns:
- `credentials` - OAuth tokens, API keys (encrypted)
- `config` - Integration-specific configuration
- `status` - One of: `active`, `inactive`, `connected`, `disconnected`, `needs_attention`, `error`, `coming_soon`, `deprecated`

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

### API Routes

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();

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

### Branch Naming

- `feature/integration-salesforce`
- `fix/oauth-callback-error`
- `refactor/simplify-drawer`
- `docs/update-guides`

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
2. Write SQL in `supabase/migrations/`
3. Test locally: `pnpm supabase:reset`
4. Generate types: `pnpm supabase:typegen`
5. Update affected code
6. Deploy: `pnpm supabase:deploy`

### Debugging Supabase

```bash
# Check logs
supabase functions logs

# Reset and start fresh
pnpm supabase:reset

# Check connection
pnpm supabase:status
```

## Performance Considerations

- **Minimize client components**: Use server components when possible
- **Optimize images**: Use Next.js `<Image>` component
- **Code splitting**: Dynamic imports for heavy components
- **Database queries**: Use `.select()` to fetch only needed columns
- **React Query**: Configure appropriate stale times and cache

## Security Best Practices

- **Never commit secrets**: Use environment variables
- **Encrypt sensitive data**: Store encrypted in database
- **Validate inputs**: Use zod schemas
- **API routes**: Always verify authentication
- **RLS policies**: Ensure Supabase Row Level Security is enabled
- **CORS**: Only allow trusted origins

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

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/latest)

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

### Development Checklist
- Always use `pnpm` instead of `npm` or `yarn`
- Run `pnpm typecheck` before committing
- Environment variables loaded via `pnpm with-env` wrapper
- Server components are default; only use `'use client'` when necessary
