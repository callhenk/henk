# Twilio Voice Calling Setup Guide

This guide walks you through setting up Twilio Voice SDK for making outbound calls in Henk.

## Features

- Make outbound calls directly from the Henk platform
- Domain-restricted for security (only works on callhenk.com)
- Call tracking integrated with conversations and campaigns
- Automatic conversation record creation
- Real-time call status and duration tracking
- Mute/unmute and speaker controls

## Prerequisites

- A Twilio account ([Sign up here](https://www.twilio.com/try-twilio))
- A purchased Twilio phone number
- Access to the Henk platform on callhenk.com

## Setup Instructions

### 1. Create a Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a new account or log in
3. Complete phone verification
4. Note your Account SID from the dashboard

### 2. Purchase a Phone Number

1. Navigate to **Phone Numbers** → **Manage** → **Buy a Number**
2. Choose a phone number with Voice capabilities
3. Purchase the number (starts at $1/month)
4. Note the phone number in E.164 format (e.g., +1234567890)

### 3. Create API Keys

For security, use API keys instead of your main auth token:

1. Go to **Account** → **API keys & tokens**
2. Click **Create API Key**
3. Give it a friendly name (e.g., "Henk Voice")
4. Save the **SID** and **Secret** (you won't see the secret again!)

### 4. Create a TwiML Application

1. Navigate to **Voice** → **Manage** → **TwiML Apps**
2. Click **Create new TwiML App**
3. Configure as follows:
   - **Friendly Name**: Henk Voice App
   - **Voice Request URL**: `https://app.callhenk.com/api/twilio/twiml`
   - **Request Method**: HTTP POST
   - **Voice Status Callback URL**: (optional) `https://app.callhenk.com/api/twilio/status`
4. Save and note the Application SID

### 5. Configure Environment Variables

Add the following to your `.env.local` file:

```env
# Twilio Account Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio API Keys (recommended over auth token)
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your Twilio Phone Number
TWILIO_PHONE_NUMBER=+1234567890

# TwiML Application SID
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6. Deploy and Test

1. Deploy your changes to production
2. Navigate to **Calls** in the Henk sidebar
3. Enter a phone number and click "Call"
4. Verify the call connects successfully

## Usage Guide

### Making a Call

1. Go to the **Calls** page in Henk
2. (Optional) Select a contact from your database
3. (Optional) Associate with a campaign for tracking
4. Enter or verify the phone number
5. Click the **Call** button
6. Use the controls to:
   - Mute/unmute your microphone
   - Toggle speaker (if supported by browser)
   - End the call

### Call Tracking

- Calls are automatically logged in the conversations table
- If you selected a contact, the call is linked to that lead
- Campaign association helps with performance analytics
- Call duration and status are tracked automatically

## Security Features

### Domain Restriction

The calling feature is restricted to callhenk.com domains only:

- `callhenk.com`
- `www.callhenk.com`
- `app.callhenk.com`

This prevents unauthorized use of your Twilio credentials.

### Token-Based Authentication

- Tokens are generated server-side with 1-hour expiration
- Tokens are automatically refreshed before expiry
- Each token is tied to the authenticated user and business

### Secure API Endpoints

- All API endpoints require authentication
- Business context validation ensures multi-tenant isolation
- Rate limiting can be added for additional protection

## Troubleshooting

### Common Issues

**"Phone system error" message**

- Check that all Twilio environment variables are set correctly
- Verify your Twilio account has sufficient balance
- Ensure the TwiML App configuration is correct

**"Unauthorized domain" error**

- Verify you're accessing the app from callhenk.com
- Check that production environment variables are set

**Call connects but no audio**

- Check browser microphone permissions
- Ensure your browser supports WebRTC (Chrome, Firefox, Safari)
- Try refreshing the page and re-initializing

**"Failed to get token" error**

- Verify API keys are correct and active
- Check that the JWT signing is working correctly
- Look for errors in the server logs

### Browser Requirements

The Twilio Voice SDK requires:

- Modern browser with WebRTC support
- Microphone permissions granted
- Stable internet connection
- HTTPS connection (automatically on callhenk.com)

### Testing Locally

For local development:

1. Use ngrok or similar to expose your local server with HTTPS
2. Update the TwiML App URLs to point to your ngrok URL
3. The domain restriction is bypassed in development mode

## Cost Considerations

Twilio charges for:

- Phone numbers: ~$1/month per number
- Outbound calls: ~$0.013/minute (varies by country)
- Incoming calls: ~$0.0085/minute
- No charge for the Voice SDK itself

## Advanced Features (Future Enhancements)

Potential additions to the current implementation:

### Call Recording

- Add recording capabilities with user consent
- Store recordings in Supabase storage
- Link recordings to conversation records

### Call Transfers

- Transfer calls to other team members
- Warm transfers with consultation

### Call Queuing

- Queue multiple prospects for sequential calling
- Auto-dial next number after call ends

### WebRTC Diagnostics

- Pre-call connectivity tests
- Network quality indicators
- Audio device selection

### Analytics Dashboard

- Call success rates
- Average call duration by campaign
- Best times to call analysis

## API Reference

### POST /api/twilio/token

Generates a Twilio access token for the Voice SDK.

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "identity": "user_xxx_yyy",
    "callerId": "+1234567890",
    "expiresAt": "2024-01-01T12:00:00Z"
  }
}
```

### POST /api/twilio/twiml

Generates TwiML instructions for outbound calls.

**Request:**

```json
{
  "To": "+1234567890",
  "CallerId": "+0987654321"
}
```

**Response:** TwiML XML

## Support

For issues related to:

- **Twilio configuration**: Contact Twilio Support
- **Henk platform**: Create an issue in the repository
- **Integration bugs**: Check the browser console and server logs

## License

This feature uses the Twilio Voice SDK under their terms of service. Ensure compliance with telecommunications regulations in your jurisdiction.
