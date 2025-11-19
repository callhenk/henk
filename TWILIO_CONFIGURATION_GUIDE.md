# Twilio Voice Configuration Guide

This guide explains how to configure Twilio Voice for the calls feature in Henk. If calls connect but you hear no audio on either side, this is usually due to missing or incorrect TwiML App configuration.

## Prerequisites

- Active Twilio account
- Twilio phone number purchased
- Access to Twilio Console

## Required Environment Variables

Add these to your `.env.local` file:

```bash
# Twilio Account SID (found in Twilio Console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio Auth Token (found in Twilio Console)
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio API Key SID (create under Account → API keys & tokens)
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Twilio API Key Secret (shown once when creating API key)
TWILIO_API_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your Twilio phone number (in E.164 format: +1234567890)
TWILIO_PHONE_NUMBER=+1234567890

# TwiML App SID (create in TwiML Apps section - see below)
TWILIO_TWIML_APP_SID=APxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Push Credential SID for mobile apps
TWILIO_PUSH_CREDENTIAL_SID=CRxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Step-by-Step Configuration

### 1. Get Account SID and Auth Token

1. Go to [Twilio Console](https://console.twilio.com/)
2. Copy your **Account SID** and **Auth Token** from the dashboard
3. Add them to `.env.local`

### 2. Create API Key

API Keys are used for secure token generation:

1. Go to **Account → API keys & tokens → API keys**
2. Click **Create API Key**
3. Give it a friendly name (e.g., "Henk Voice API Key")
4. Key type: **Standard**
5. Copy the **SID** and **Secret** (secret is shown only once!)
6. Add them to `.env.local` as `TWILIO_API_KEY_SID` and `TWILIO_API_KEY_SECRET`

### 3. Purchase a Phone Number

You need a Twilio phone number with Voice capabilities:

1. Go to **Phone Numbers → Manage → Buy a number**
2. Select your country and search for numbers with **Voice** capability
3. Purchase the number
4. Copy the phone number in E.164 format (e.g., `+1234567890`)
5. Add it to `.env.local` as `TWILIO_PHONE_NUMBER`

### 4. Create TwiML App (CRITICAL FOR AUDIO)

**This is the most important step** - without this, calls will connect but have no audio:

1. Go to **Develop → Voice → Manage → TwiML Apps**
2. Click **Create new TwiML App**
3. Fill in the form:
   - **Friendly Name**: `Henk Voice App` (or any name you prefer)
   - **Voice Configuration → Request URL**:
     ```
     https://your-domain.com/api/twilio/twiml
     ```
     OR for local development:
     ```
     https://your-ngrok-url.ngrok.io/api/twilio/twiml
     ```
   - **HTTP Method**: `POST`
   - **Status Callback URL** (optional but recommended):
     ```
     https://your-domain.com/api/twilio/status
     ```
4. Click **Create**
5. Copy the **SID** (starts with `AP...`)
6. Add it to `.env.local` as `TWILIO_TWIML_APP_SID`

### 5. Local Development with ngrok

For local testing, you need to expose your local server to the internet:

```bash
# Start your development server
pnpm dev

# In another terminal, start ngrok
ngrok http 3000

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update your TwiML App Voice URL with this ngrok URL
```

**Important**: Update the TwiML App Voice URL every time you restart ngrok (free tier assigns random URLs).

### 6. Verify Configuration

Test your configuration:

```bash
# 1. Start the dev server
pnpm dev

# 2. Visit http://localhost:3000/home/calls
# 3. Check the debug logs for:
#    ✅ Token received successfully
#    ✅ Device is ready!
#    🎤 Found X microphone(s) and Y speaker(s)

# 4. Try making a test call
#    Enter a phone number (your mobile number for testing)
#    Click "Call"
#    You should see: ✅ Call accepted - audio should now be active
```

## Troubleshooting

### Calls Connect But No Audio

**Symptom**: Call status shows "connected" but neither party can hear each other.

**Cause**: TwiML App Voice URL is not configured or incorrect.

**Solution**:

1. Check that `TWILIO_TWIML_APP_SID` in `.env.local` matches the TwiML App you configured
2. Verify the TwiML App Voice URL is correct:
   - Go to Twilio Console → TwiML Apps
   - Click on your app
   - Verify **Voice Request URL** points to `/api/twilio/twiml`
   - Must be HTTPS (use ngrok for local dev)
3. Test the TwiML endpoint directly:

   ```bash
   curl -X POST "https://your-domain.com/api/twilio/twiml?To=%2B1234567890" \
     -H "Content-Type: application/x-www-form-urlencoded"

   # Should return XML like:
   # <?xml version="1.0" encoding="UTF-8"?>
   # <Response>
   #   <Dial callerId="+1234567890" answerOnBridge="true" timeout="30">
   #     <Number>+1234567890</Number>
   #   </Dial>
   # </Response>
   ```

### Device Initialization Fails

**Symptom**: Debug logs show "Token API error" or "Device error".

**Cause**: Missing or incorrect environment variables.

**Solution**:

1. Verify all environment variables are set in `.env.local`
2. Check that API Key SID and Secret are correct
3. Ensure you're using API Key (not Account SID) for token generation
4. Restart the dev server after changing environment variables

### Microphone Permission Denied

**Symptom**: "Microphone access denied" error when trying to call.

**Cause**: Browser blocked microphone access.

**Solution**:

1. Click the camera/microphone icon in browser address bar
2. Allow microphone access
3. Refresh the page and try again
4. Some browsers require HTTPS even for localhost (use `https://localhost:3000` with a self-signed cert)

### Token Expiration Issues

**Symptom**: Calls work initially but stop after some time.

**Cause**: Access tokens expire after 1 hour (default).

**Solution**:

- The app automatically refreshes tokens when they're about to expire
- If issues persist, check browser console for token refresh errors
- Verify the `/api/twilio/token` endpoint is accessible

### Audio Quality Issues

**Symptom**: Audio is choppy, delayed, or low quality.

**Solution**:

1. Check your internet connection (both caller and recipient)
2. The app uses Opus codec (high quality) with PCMU fallback
3. Close other apps using bandwidth
4. Try different network (cellular vs WiFi)

## Production Deployment Checklist

Before deploying to production:

- [ ] Set all environment variables in your hosting platform
- [ ] Use your production domain in TwiML App Voice URL
- [ ] Enable Twilio signature validation (uncomment in `/api/twilio/twiml/route.ts`)
- [ ] Configure CORS properly (production domain only)
- [ ] Set up monitoring for failed calls
- [ ] Test from different networks and devices
- [ ] Configure status callbacks for call tracking
- [ ] Review Twilio pricing and set up billing alerts

## TwiML App Configuration Reference

Your TwiML App should have these settings:

| Setting                | Value                                       |
| ---------------------- | ------------------------------------------- |
| Voice Request URL      | `https://your-domain.com/api/twilio/twiml`  |
| Voice Request Method   | `POST`                                      |
| Status Callback URL    | `https://your-domain.com/api/twilio/status` |
| Status Callback Method | `POST`                                      |

## Security Best Practices

1. **Never commit** `.env.local` to git
2. **Rotate** API keys regularly
3. **Enable** Twilio signature validation in production
4. **Restrict** `/home/calls` page to authorized users only (currently restricted to `@callhenk.com` emails)
5. **Monitor** Twilio usage and set spending limits
6. **Use** separate Twilio accounts for dev/staging/prod

## Cost Considerations

Twilio charges for:

- **Voice minutes**: $0.013 - $0.085 per minute (varies by country)
- **Phone numbers**: ~$1/month per number
- **Recordings**: $0.0025 per minute (if enabled)

Calculate costs: [Twilio Pricing Calculator](https://www.twilio.com/voice/pricing)

## Additional Resources

- [Twilio Voice SDK Documentation](https://www.twilio.com/docs/voice/sdks/javascript)
- [TwiML Documentation](https://www.twilio.com/docs/voice/twiml)
- [Access Token Documentation](https://www.twilio.com/docs/iam/access-tokens)
- [ngrok Documentation](https://ngrok.com/docs)

## Support

If you continue to experience issues:

1. Check browser console for JavaScript errors
2. Review Twilio Console → Monitor → Logs → Calls for call details
3. Verify TwiML responses in Twilio debugger
4. Test with a different phone number
5. Try a different browser or device
