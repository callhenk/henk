## Next.js API Routes

Base path: `/api`

This document enumerates the existing Next.js API routes so you can deprecate overlapping Supabase Edge Functions.

### Agents

- `/agents` — **GET**, **POST**
- `/agents/[id]` — **GET**, **PUT**, **DELETE**
- `/agents/train` — **POST**

### Agent Conversation

- `/agent-conversation` — **POST**, **PUT**
- `/agent-conversation/start` — **POST**
- `/agent-conversation/send` — **POST**
- `/agent-conversation/test-voice` — **POST**

### Campaigns

- `/campaigns` — **GET**, **POST**
- `/campaigns/[id]` — **GET**, **PUT**, **DELETE**
- `/campaigns/[id]/start` — **POST**
- `/campaigns/[id]/stop` — **POST**

### Authentication

- `/auth/user` — **GET**
- `/auth/business` — **GET**

### ElevenLabs (generic)

- `/elevenlabs/generate` — **POST**
- `/elevenlabs/voices` — **GET**
- `/elevenlabs/test-voice` — **POST**
- `/elevenlabs/knowledge-base` — **GET**, **POST**
- `/elevenlabs/knowledge-base/[id]` — **GET**, **PATCH**, **DELETE**

Notes:

- These endpoints call ElevenLabs directly and do not use Supabase Edge Functions.
- Voices are fetched via ElevenLabs v2 as per docs: https://elevenlabs.io/docs/api-reference/voices/search

### ElevenLabs Agent

- `/elevenlabs-agent` — **POST**
- `/elevenlabs-agent/list` — **GET**
- `/elevenlabs-agent/create` — **POST**
- `/elevenlabs-agent/delete/[id]` — **DELETE**
- `/elevenlabs-agent/details/[id]` — **GET**
- `/elevenlabs-agent/train` — **POST**
- `/elevenlabs-agent/update` — **PATCH**
- `/elevenlabs-agent/knowledge-base` — **GET**, **POST**
- `/elevenlabs-agent/knowledge-base/[id]` — **GET**, **DELETE**
- `/elevenlabs-agent/knowledge-base/upload` — **POST**

### Voice (wrapper) — Deprecated

- `/voice/voices` — **GET** (use `/elevenlabs/voices`)
- `/voice/generate` — **POST** (use `/elevenlabs/generate`)
- `/voice/test` — **POST** (use `/elevenlabs/test-voice`)

These wrapper routes duplicate the ElevenLabs endpoints and will be removed after clients migrate.

### Testing/Utilities

- `/test-elevenlabs` — **GET**

---

Notes:

- All routes follow Next.js App Router conventions under `apps/web/app/api/*/route.ts` with exported HTTP method handlers.
- Auth, validation, and response formats follow our API standards in the workspace rules.
