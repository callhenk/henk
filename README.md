Here's your updated **README** for Henk, integrating the boilerplate behind the scenes but keeping the focus entirely on your product:

---

# Henk

**Henk** is an AI-powered voice fundraising platform that enables charities to engage donors through natural phone conversations at scale. By combining synthetic speech, CRM integration, and compliance-centric design, Henk reduces operational costs while improving donor experience and conversion rates.

---

## 🚀 Quick Start (Local Development)

> Goal: Run the full stack locally in ≤10 minutes.

### 1. Clone & install

```bash
git clone git@github.com:callhenk/henk.git
cd henk
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in required keys:

| Variable                    | Notes                     |
| --------------------------- | ------------------------- |
| `SUPABASE_URL`              | Your Supabase project URL |
| `SUPABASE_ANON_KEY`         | Supabase anon key         |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `TWILIO_ACCOUNT_SID`        | Twilio dev account SID    |
| `TWILIO_AUTH_TOKEN`         | Twilio auth token         |
| `TWILIO_CALLER_ID`          | Verified Twilio number    |
| `ELEVENLABS_API_KEY`        | ElevenLabs API key        |

### 3. Start Supabase

Make sure Docker is running, then:

```bash
pnpm run supabase:web:start
```

To reset the database (optional):

```bash
pnpm run supabase:web:reset
```

### 4. Run the dev server

```bash
pnpm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### 5. Expose webhook endpoint

```bash
ngrok http 3000
```

Copy the HTTPS forwarding URL and paste it into the Twilio Console → Programmable Voice → Webhook:

```
/api/twilio/webhook
```

---

## 🧠 Tech Stack & AI Tooling

| Layer                    | Primary Tech                                      | Notes                                              |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------- |
| **Frontend**             | Next.js 15 + TypeScript                           | Tailwind CSS v4, Radix UI, React Query, Shadcn UI  |
| **API / BFF**            | Next.js API Routes                                | tRPC for end-to-end typing                         |
| **Database & Auth**      | Supabase (Postgres 16 + RLS + Realtime)           | Auth, storage, row-level security                  |
| **Workers & Cron**       | Supabase Edge Functions                           | Campaign dialer, CSV importer, scheduled rollups   |
| **Voice & Conversation** | ElevenLabs Conversational AI                      | Natural speech, transcription, and dynamic logic   |
| **Telephony**            | Twilio Programmable Voice + TwiML                 | Outbound calls, DTMF capture, webhook handling     |
| **Deployment**           | Vercel                                            | Serverless frontend + backend, preview deployments |
| **Observability**        | Pino → Logtail, Vercel Analytics, Twilio Debugger | Slack alerts for error + spend monitoring          |
| **Dev Tools**            | GitHub Copilot, Cursor AI                         | AI-powered coding + refactoring                    |

> _Why this stack?_ It’s fast to build with, serverless by default, and AI-native. Calls are powered by ElevenLabs and Twilio; Supabase handles your data securely and efficiently.

---

## 📦 Project Structure

```
apps/
└── web/
    ├── app/             # App Router: marketing, auth, app pages
    ├── supabase/        # Database config, migrations, seed
    └── config/          # App-level settings
packages/
├── ui/                  # Reusable UI components
└── features/            # Modular feature packages (e.g. auth)
```

---

## ⚙️ Scripts

| Task             | Command                       |
| ---------------- | ----------------------------- |
| Start dev server | `pnpm run dev`                |
| Start Supabase   | `pnpm run supabase:web:start` |
| Reset Supabase   | `pnpm run supabase:web:reset` |
| Format code      | `pnpm run format:fix`         |
| Lint code        | `pnpm run lint`               |
| Type check       | `pnpm run typecheck`          |

---

## 🛠 Troubleshooting

- **401 Supabase**: Check `SUPABASE_ANON_KEY`
- **Twilio error 11200**: Restart ngrok and update webhook
- **No audio on call**: Check ElevenLabs quota or voice config
