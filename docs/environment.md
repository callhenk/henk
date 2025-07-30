# Environment Configuration

This guide explains how to configure environment variables for the Henk AI project, including local development, staging, and production environments.

## 🚀 Environment Setup

### Environment Files

The project uses different environment files for different contexts:

| File | Purpose | Environment |
|------|---------|-------------|
| `.env.example` | Template with all required variables | Development |
| `.env.local` | Local development overrides | Development |
| `.env.test` | Testing environment | Testing |
| `.env.production` | Production environment | Production |

### Creating Your Environment File

```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the file with your values
nano .env.local
```

## 🔧 Required Environment Variables

### Supabase Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ |

**How to get these values**:
1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy the Project URL and API keys

### Twilio Configuration (Voice Calls)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `AC1234567890abcdef...` | ✅ |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `1234567890abcdef...` | ✅ |
| `TWILIO_CALLER_ID` | Verified Twilio phone number | `+1234567890` | ✅ |

**How to get these values**:
1. Sign up for a Twilio account
2. Go to Console → Account Info
3. Copy Account SID and Auth Token
4. Buy a phone number in Console → Phone Numbers

### ElevenLabs Configuration (AI Voice)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `ELEVENLABS_API_KEY` | ElevenLabs API key | `1234567890abcdef...` | ✅ |

**How to get this value**:
1. Sign up for ElevenLabs account
2. Go to Profile → API Key
3. Copy your API key

### Application Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SITE_URL` | Your site URL | `http://localhost:3000` | ✅ |
| `NEXT_PUBLIC_PRODUCT_NAME` | Product name | `Henk AI` | ✅ |
| `NODE_ENV` | Environment mode | `development` | ✅ |

## 🔒 Security Variables

### Authentication & Security

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CAPTCHA_SECRET_TOKEN` | Cloudflare Turnstile secret | `0x4AAAAAA...` | Optional |
| `NEXTAUTH_SECRET` | NextAuth secret | `your-secret-key` | ✅ |
| `NEXTAUTH_URL` | NextAuth URL | `http://localhost:3000` | ✅ |

### Database Security

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SUPABASE_JWT_SECRET` | JWT secret for Supabase | `your-jwt-secret` | ✅ |
| `DATABASE_URL` | Direct database URL | `postgresql://...` | Optional |

## 🌐 Optional Configuration

### Analytics & Monitoring

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` | Optional |
| `VERCEL_ANALYTICS_ID` | Vercel Analytics ID | `auto` | Optional |
| `LOGTAIL_TOKEN` | Logtail token | `src_xxxxxxxx` | Optional |

### Email Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server host | `smtp.gmail.com` | Optional |
| `SMTP_PORT` | SMTP server port | `587` | Optional |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` | Optional |
| `SMTP_PASS` | SMTP password | `your-app-password` | Optional |

### Feature Flags

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_ENABLE_MFA` | Enable MFA | `true` | Optional |
| `NEXT_PUBLIC_ENABLE_SIGNUP` | Enable signup | `true` | Optional |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | Enable analytics | `true` | Optional |

## 📝 Complete Environment Example

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Twilio Configuration
TWILIO_ACCOUNT_SID=AC1234567890abcdef...
TWILIO_AUTH_TOKEN=1234567890abcdef...
TWILIO_CALLER_ID=+1234567890

# ElevenLabs Configuration
ELEVENLABS_API_KEY=1234567890abcdef...

# Application Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_PRODUCT_NAME=Henk AI
NODE_ENV=development

# Security
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
CAPTCHA_SECRET_TOKEN=0x4AAAAAA...

# Optional Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=auto

# Optional Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Feature Flags
NEXT_PUBLIC_ENABLE_MFA=true
NEXT_PUBLIC_ENABLE_SIGNUP=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🔄 Environment Management

### Development Environment

```bash
# Start with example file
cp .env.example .env.local

# Edit with your values
nano .env.local

# Verify configuration
pnpm run typecheck
pnpm run lint
```

### Testing Environment

```bash
# Create test environment
cp .env.example .env.test

# Edit for testing
nano .env.test

# Run tests with test environment
NODE_ENV=test pnpm run test
```

### Production Environment

```bash
# Set production variables
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_PRODUCT_NAME=Henk AI

# Build for production
pnpm run build
```

## 🔍 Environment Validation

### Validation Script

The project includes environment validation:

```bash
# Check required variables
pnpm run requirements

# Validate environment
pnpm run typecheck
```

### Common Validation Errors

1. **Missing Required Variables**
   ```bash
   # Error: SUPABASE_URL is required
   # Solution: Add to .env.local
   SUPABASE_URL=https://your-project.supabase.co
   ```

2. **Invalid API Keys**
   ```bash
   # Error: Invalid Supabase key
   # Solution: Check your Supabase dashboard
   ```

3. **Wrong Environment**
   ```bash
   # Error: NODE_ENV not set
   # Solution: Set NODE_ENV=development
   ```

## 🚨 Security Best Practices

### Environment Variable Security

1. **Never commit secrets**:
   ```bash
   # .env.local is in .gitignore
   # Never add secrets to version control
   ```

2. **Use strong secrets**:
   ```bash
   # Generate strong secrets
   openssl rand -base64 32
   ```

3. **Rotate keys regularly**:
   ```bash
   # Update API keys periodically
   # Monitor for unauthorized access
   ```

### Production Security

1. **Use environment-specific keys**:
   ```bash
   # Different keys for dev/staging/prod
   SUPABASE_URL=https://prod-project.supabase.co
   ```

2. **Enable security features**:
   ```bash
   # Enable MFA in production
   NEXT_PUBLIC_ENABLE_MFA=true
   ```

3. **Monitor access**:
   ```bash
   # Enable logging
   LOGTAIL_TOKEN=src_xxxxxxxx
   ```

## 🔧 Environment-Specific Configurations

### Local Development

```bash
# .env.local
NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_URL=http://localhost:54321
```

### Staging Environment

```bash
# Staging variables
NODE_ENV=staging
NEXT_PUBLIC_SITE_URL=https://staging.henk.ai
SUPABASE_URL=https://staging-project.supabase.co
```

### Production Environment

```bash
# Production variables
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://henk.ai
SUPABASE_URL=https://prod-project.supabase.co
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   ```bash
   # Check file exists
   ls -la .env.local
   
   # Restart development server
   pnpm run dev
   ```

2. **API Key Errors**
   ```bash
   # Verify keys are correct
   # Check service dashboards
   # Ensure no extra spaces
   ```

3. **Database Connection Issues**
   ```bash
   # Check Supabase URL and keys
   # Verify project is active
   # Check network connectivity
   ```

### Debug Environment

```bash
# Check environment variables
echo $SUPABASE_URL
echo $TWILIO_ACCOUNT_SID

# Validate configuration
pnpm run typecheck
pnpm run lint
```

---

## 🎯 Quick Setup

### 1. Copy Environment Template
```bash
cp .env.example .env.local
```

### 2. Fill Required Variables
```bash
# Edit .env.local with your values
nano .env.local
```

### 3. Validate Configuration
```bash
pnpm run typecheck
pnpm run lint
```

### 4. Start Development
```bash
pnpm run dev
```

---

*This environment configuration guide ensures your development environment is properly set up. For deployment configuration, see [Deployment Guide](./deployment.md).* 