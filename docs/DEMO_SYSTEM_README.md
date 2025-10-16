# Demo System Documentation

## Overview

The Henk demo system provides a secure, token-based way to give clients and prospects access to test the AI voice calling platform without requiring account registration. It consists of two main components:

1. **Token Generator** (`/generate-token`) - Creates secure demo links
2. **Demo Page** (`/demo`) - Provides voice testing interface with token-based authentication

## Architecture

### Components

```
┌─────────────────┐
│ Token Generator │
│ /generate-token │  ← Admin creates demo links
└────────┬────────┘
         │
         │ Creates encrypted token
         ▼
┌─────────────────┐
│  Demo Token     │  ← Shared with client
│  (Base64 URL)   │
└────────┬────────┘
         │
         │ Client clicks link
         ▼
┌─────────────────┐
│   Demo Page     │  ← Auto-login & test interface
│     /demo       │
└─────────────────┘
```

### Security Flow

1. **Token Creation**: Credentials are encrypted using XOR encryption with `NEXT_PUBLIC_SUPABASE_ANON_KEY` as the secret
2. **Token Format**: `Base64(timestamp:encrypted_payload)`
3. **Token Validation**: Token is decrypted and credentials are extracted
4. **Auto-Login**: Demo page automatically signs in using extracted credentials
5. **Access**: User gains temporary access to demo features

## How to Create a Demo Link

### Step 1: Access Token Generator

Navigate to `/generate-token` in your browser:

```
https://your-domain.com/generate-token
```

### Step 2: Enter Credentials

The token generator needs demo account credentials:

- **Email**: Enter a valid demo user email (e.g., `demo@callhenk.com`)
- **Password**: Enter the corresponding password (e.g., `demo123`)

**Important**: The email and password must match an existing Supabase account that has:

- Access to agents in the database
- Proper permissions to view campaigns
- Phone numbers configured for outbound calling

### Step 2.5: Select Available Agents (Optional)

Choose which agents will be available in the demo:

- **Select Specific Agents**: Check the agents you want to include in the demo
- **Select All**: Click "Select All" to include all agents
- **Clear All**: Click "Clear All" to deselect all agents
- **Show All**: Leave all agents unchecked to show all agents (default behavior)

**Why restrict agents?**
- Customize demo for specific use cases
- Hide agents that are still in development
- Show only relevant agents for the client's industry
- Simplify the demo experience with fewer options

### Step 3: Generate Token

Click **"Generate Demo Token"** to create:

- **Demo Token**: Encrypted authentication token
- **Demo URL**: Complete link ready to share

Example generated URL:

```
https://your-domain.com/demo?token=MTcyOTI2MTIwMDAwMDpkYWRiZGRiZmJm...
```

### Step 4: Share with Client

Copy the **Demo URL** and share it with your client via:

- Email
- Slack/Teams message
- SMS
- Any secure communication channel

## Demo Page Features

The `/demo` page provides two testing modes:

### 1. Phone Demo Tab

Allows clients to receive a live demonstration call:

- **Select AI Agent**: Choose from available voice agents
- **Enter Phone Number**: Provide number to receive demo call
- **Place Call**: System initiates outbound call using Twilio

**Backend Flow**:

```
1. User enters phone number
2. Selects agent
3. Clicks "Start Demo Call"
4. POST /api/campaigns/simulate-call
5. Twilio places call using agent's ElevenLabs configuration
6. Client receives demonstration call
```

### 2. Voice Chat Tab

Provides browser-based voice conversation:

- **Select AI Agent**: Choose voice agent for conversation
- **Start Voice Chat**: Opens in-browser voice interface
- **Real-time Conversation**: Uses ElevenLabs WebSocket for live interaction

**Backend Flow**:

```
1. User selects agent
2. Clicks "Start Voice Conversation"
3. Opens RealtimeVoiceChat component
4. Connects to ElevenLabs via WebSocket
5. Real-time voice interaction in browser
```

## Technical Implementation

### Token Generation (`/lib/demo-auth.ts`)

```typescript
export interface DemoTokenData {
  email: string;
  password: string;
  allowedAgentIds?: string[];
}

export function createDemoToken(data: DemoTokenData): string {
  const payload = JSON.stringify(data);
  const encrypted = simpleEncrypt(payload, DEMO_SECRET);
  const timestamp = Date.now().toString();
  const combined = `${timestamp}:${encrypted}`;
  return Buffer.from(combined).toString('base64');
}
```

### Token Verification

```typescript
export function verifyDemoToken(token: string): DemoTokenData | null {
  try {
    const combined = Buffer.from(token, 'base64').toString('utf8');
    const [timestampStr, encrypted] = combined.split(':');
    const decrypted = simpleDecrypt(encrypted, DEMO_SECRET);
    return JSON.parse(decrypted) as DemoTokenData;
  } catch (error) {
    return null;
  }
}
```

### Auto-Login Flow (`/demo/page.tsx`)

```typescript
useEffect(() => {
  // Prevent multiple login attempts
  if (loginAttempted) return;

  const token = searchParams.get('token');

  // Validate token
  const credentials = verifyDemoToken(token);

  if (credentials) {
    // Set allowed agent IDs if provided in token
    if (credentials.allowedAgentIds && credentials.allowedAgentIds.length > 0) {
      setAllowedAgentIds(credentials.allowedAgentIds);
    }

    // Auto-login with extracted credentials
    signInMutation.mutateAsync({
      email: credentials.email,
      password: credentials.password,
    });
  }
}, [searchParams]);

// Filter agents based on allowedAgentIds from token
const agents = allowedAgentIds
  ? allAgents.filter((agent) => allowedAgentIds.includes(agent.id))
  : allAgents;
```

## Environment Requirements

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key  # Used as encryption secret

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Twilio (for phone demos)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token

# ElevenLabs (for voice chat)
ELEVENLABS_API_KEY=your_api_key
```

### Database Requirements

The demo user account needs access to:

1. **Agents Table**: At least one active agent with:
   - `elevenlabs_agent_id` configured
   - `status` = 'active'
   - Valid voice settings

2. **Phone Numbers**: At least one Twilio number with:
   - `supports_outbound` = true
   - Valid caller_id configuration

3. **Campaigns** (optional): Demo campaigns for context

## Security Considerations

### Token Security

✅ **Secure Practices**:

- Tokens are encrypted (not just Base64 encoded)
- Each token includes a timestamp for uniqueness
- Tokens are URL-safe Base64 encoded

⚠️ **Security Notes**:

- Tokens contain encrypted credentials, not session tokens
- Tokens don't expire (consider adding expiration if needed)
- XOR encryption is simple; consider stronger encryption for production
- Anyone with the token URL can access the demo

### Best Practices

1. **Create dedicated demo accounts**:
   - Don't use admin or production accounts
   - Limit permissions to demo-only data
   - Use separate database or sandboxed environment

2. **Token Management**:
   - Generate new tokens for each demo session
   - Don't reuse tokens across multiple clients
   - Revoke demo account access after demo period

3. **Rate Limiting**:
   - Consider implementing rate limits on demo endpoints
   - Monitor demo usage to prevent abuse
   - Set daily call caps on demo campaigns

## Troubleshooting

### Issue: "Invalid demo token" error

**Cause**: Token decryption failed
**Solution**:

- Ensure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is consistent
- Regenerate token using `/generate-token`
- Check that token wasn't truncated when copying

### Issue: "Authentication failed" error

**Cause**: Credentials in token don't match Supabase account
**Solution**:

- Verify demo account exists in Supabase Auth
- Check email/password are correct
- Ensure account is active (not disabled)

### Issue: "No AI Assistants Available"

**Cause**: Demo account can't access agents
**Solution**:

- Check agents exist in database
- Verify agents have correct `business_id`
- Ensure demo user has proper RLS policies

### Issue: "Phone demo not working"

**Cause**: Twilio configuration issue
**Solution**:

- Verify Twilio credentials in environment variables
- Check phone numbers are configured with `supports_outbound = true`
- Review Twilio console for error logs
- Ensure sufficient Twilio account balance

### Issue: Page crashes/infinite loop

**Cause**: Authentication loop (fixed in latest version)
**Solution**:

- Ensure you're using the latest version with `loginAttempted` state
- Clear browser cache and cookies
- Check browser console for specific errors

## API Endpoints

### POST `/api/generate-demo-token`

Generates encrypted demo token.

**Request**:

```json
{
  "email": "demo@callhenk.com",
  "password": "demo123",
  "allowedAgentIds": ["agent-1", "agent-2"]  // Optional: omit or empty array to show all agents
}
```

**Response**:

```json
{
  "success": true,
  "token": "MTcyOTI2MTIwMDAwMDpkYWRiZGRiZmJm...",
  "url": "https://your-domain.com/demo?token=MTcyOTI2MTIwMDAwMDpkYWRiZGRiZmJm..."
}
```

### POST `/api/campaigns/simulate-call`

Initiates demo phone call.

**Request**:

```json
{
  "to_number": "+15551234567",
  "agent_id": "ell_agent_001",
  "caller_id": "+15559876543",
  "lead_name": "Demo Prospect",
  "goal_metric": "pledge_rate"
}
```

**Response**:

```json
{
  "success": true,
  "call_sid": "CA1234567890abcdef",
  "message": "Call initiated successfully"
}
```

## Demo Setup Checklist

Before sharing demo links, ensure:

- [ ] Demo account created in Supabase Auth
- [ ] At least one agent configured with ElevenLabs
- [ ] Select which agents to include in demo (or leave empty for all)
- [ ] Twilio phone number configured for outbound calls
- [ ] Environment variables properly set
- [ ] Test demo link yourself first
- [ ] Verify both Phone Demo and Voice Chat tabs work
- [ ] Check that only selected agents are displayed
- [ ] Confirm calls/conversations connect successfully

## Usage Analytics

Track demo usage by monitoring:

1. **Conversations Table**: Filter by demo account campaigns
2. **Call Logs**: Review Twilio call history for demo numbers
3. **Agent Usage**: Check which agents are used most in demos
4. **Conversion Tracking**: Monitor if demos lead to sign-ups

## Future Enhancements

Potential improvements to consider:

1. **Token Expiration**: Add time-based expiration to tokens
2. **Usage Limits**: Restrict number of calls per token
3. **Analytics Dashboard**: Track demo engagement metrics
4. **Custom Branding**: Allow per-client demo customization
5. **Session Recording**: Save demo sessions for review
6. **Multi-language**: Support international demo experiences
7. **Scheduling**: Allow clients to schedule demo calls
8. **Feedback Collection**: Gather client feedback post-demo

## Support

For issues or questions about the demo system:

1. Check browser console for error messages
2. Review Supabase logs for authentication issues
3. Check Twilio logs for call failures
4. Verify ElevenLabs agent configuration
5. Contact development team with specific error details

---

**Last Updated**: October 2024  
**Version**: 1.0  
**Maintainer**: Henk Development Team
