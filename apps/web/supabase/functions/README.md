# Edge Functions

Supabase Edge Functions for Henk's AI-powered fundraising platform.

## Overview

These edge functions are now integrated into the main henk repository for better developer experience and type sharing.

### Functions

- **campaign-orchestrator**: Places outbound calls via ElevenLabs (runs every 5 min)
- **conversation-orchestrator**: Syncs call history and outcomes (runs every 10 min)
- **sync-salesforce-leads**: Syncs Salesforce contacts and leads (runs every 15 min)

## Development

```bash
# From henk/apps/web directory:

# Serve functions locally
pnpm supabase:functions:serve

# Run tests
pnpm functions:test

# Deploy single function
supabase functions deploy campaign-orchestrator

# Deploy all functions
pnpm supabase:functions:deploy:all
```

## Testing

```bash
# Quick test (no seed/cleanup)
./supabase/functions/run-tests.sh quick

# Full test suite
./supabase/functions/run-tests.sh
```

## Production Deployment

Functions are deployed to: `https://plvxicajcpnnsxosmntd.supabase.co/functions/v1/`

```bash
# Deploy from apps/web directory
pnpm supabase:functions:deploy:all
```

## Environment Variables

Required in production:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ELEVENLABS_API_KEY`

## Migration Notes

Edge functions were migrated from separate repository to main henk monorepo on 2025-11-17.
This provides:

- Unified type system
- Single deployment process
- No port conflicts
- Easier local development
