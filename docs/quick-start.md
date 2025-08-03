# Quick Start Guide

Get Henk up and running on your local machine in under 10 minutes! This guide will walk you through the essential setup steps.

## 🚀 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18.18.0 or higher)
- **pnpm** (v9.12.0 or higher)
- **Docker** (for Supabase local development)
- **Git**

### Installing Prerequisites

```bash
# Install Node.js (if not already installed)
# Visit: https://nodejs.org/

# Install pnpm
npm install -g pnpm

# Install Docker
# Visit: https://www.docker.com/products/docker-desktop/
```

## ⚡ Quick Setup (10 minutes)

### 1. Clone the Repository

```bash
git clone git@github.com:callhenk/henk.git
cd henk
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo and set up the workspace.

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env.local
```

Edit `.env.local` and fill in the required values:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Twilio Configuration (for voice calls)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_CALLER_ID=your_verified_twilio_number

# ElevenLabs Configuration (for AI voice)
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Optional: Other configurations
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=Henk
```

### 4. Start Supabase (Local Database)

Make sure Docker is running, then:

```bash
# Start Supabase local development
pnpm run supabase:web:start

# Optional: Reset database to clean state
pnpm run supabase:web:reset
```

### 5. Start the Development Server

```bash
pnpm run dev
```

The application will be available at: **http://localhost:3000**

### 6. Set Up Webhook (Optional - for voice calls)

If you want to test voice functionality:

```bash
# Install ngrok (if not already installed)
# Visit: https://ngrok.com/

# Expose your local server
ngrok http 3000
```

Copy the HTTPS URL from ngrok and configure it in your Twilio Console:

- Go to Twilio Console → Programmable Voice → Webhook
- Set the webhook URL to: `https://your-ngrok-url.ngrok.io/api/twilio/webhook`

## ✅ Verification

You should now have:

- ✅ **Local development server** running on http://localhost:3000
- ✅ **Supabase local instance** running with database
- ✅ **All dependencies** installed and working
- ✅ **Environment variables** configured

## 🎯 Next Steps

Now that you're up and running:

1. **Explore the Application**: Visit http://localhost:3000 and explore the interface
2. **Check the Database**: Visit http://localhost:54323 for Supabase Studio
3. **Read the Documentation**:
   - [Project Structure](./project-structure.md) - Understand the codebase
   - [Development Workflow](./development-workflow.md) - Learn how to contribute
   - [Architecture Overview](./architecture.md) - Understand the system design

## 🚨 Common Issues

### Supabase Won't Start

```bash
# Make sure Docker is running
docker --version

# Check Supabase status
pnpm run supabase:web:status

# Reset if needed
pnpm run supabase:web:reset
```

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or use a different port
PORT=3001 pnpm run dev
```

### Environment Variables Missing

```bash
# Check if .env.local exists
ls -la .env.local

# Copy example if missing
cp .env.example .env.local
```

### Dependencies Issues

```bash
# Clear cache and reinstall
pnpm clean
pnpm install
```

## 🔧 Development Scripts

Here are the most commonly used scripts:

| Command                       | Purpose                   |
| ----------------------------- | ------------------------- |
| `pnpm run dev`                | Start development server  |
| `pnpm run build`              | Build for production      |
| `pnpm run lint`               | Run ESLint                |
| `pnpm run typecheck`          | Run TypeScript checks     |
| `pnpm run format:fix`         | Format code with Prettier |
| `pnpm run supabase:web:start` | Start local Supabase      |
| `pnpm run supabase:web:stop`  | Stop local Supabase       |

## 📞 Need Help?

- **Technical Issues**: Check [Troubleshooting](./troubleshooting.md)
- **Architecture Questions**: See [Architecture Overview](./architecture.md)
- **Development Process**: Read [Development Workflow](./development-workflow.md)

---

_This quick start guide gets you up and running fast. For detailed setup instructions, see [Development Setup](./development-setup.md)._
