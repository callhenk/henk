# Salesforce Integration - Admin Setup Guide

This guide is for administrators setting up the centralized Salesforce OAuth integration that all users will connect through.

## Overview

You only need to create **ONE** Salesforce Connected App for your entire application. All your users will authenticate through this single app to connect their individual Salesforce accounts.

## Why This Approach?

- **Seamless for users**: Users just click "Connect to Salesforce" and authorize - no setup required
- **Centralized management**: You control the OAuth credentials
- **Better security**: Credentials are managed server-side
- **Easier updates**: Make changes in one place

## Prerequisites

- A Salesforce account (Production or Developer Edition recommended)
- Administrative access to create Connected Apps
- Access to your application's server environment variables

---

## Step 1: Create the Salesforce Connected App

### 1.1 Access Salesforce Setup

1. Log into your Salesforce account at https://login.salesforce.com
2. Click the gear icon (⚙️) in the top-right
3. Select **Setup**

### 1.2 Navigate to App Manager

1. In the Quick Find box (left sidebar), type "App Manager"
2. Click **App Manager** under Apps
3. Click **New Connected App** (top-right)

### 1.3 Configure Basic Information

**Basic Information:**
- **Connected App Name**: `Henk Integration` (or your app name)
- **API Name**: Auto-populated (e.g., `Henk_Integration`)
- **Contact Email**: Your admin email address
- **Description**: (Optional) "OAuth integration for connecting Salesforce accounts to Henk"

### 1.4 Enable OAuth Settings

1. ✅ Check **Enable OAuth Settings**

2. **Callback URL**: Add your callback URLs for all environments:
   ```
   https://app.callhenk.com/api/integrations/salesforce/callback
   https://staging.callhenk.com/api/integrations/salesforce/callback
   ```

   > **Note**: Add one URL per line. Do NOT include localhost URLs in production.

3. **Selected OAuth Scopes**: Add these scopes:
   - ✅ `Access the identity URL service (id, profile, email, address, phone)`
   - ✅ `Access and manage your data (api)`
   - ✅ `Perform requests on your behalf at any time (refresh_token, offline_access)`

   Click **Add** to move them to "Selected OAuth Scopes"

4. **Additional Settings**:
   - ✅ **Require Secret for Web Server Flow** (recommended)
   - ✅ **Require Secret for Refresh Token Flow**
   - ✅ **Enable Authorization Code and Credentials Flow**

### 1.5 Save and Wait

1. Click **Save**
2. Click **Continue** on the confirmation page
3. ⏰ **Wait 2-10 minutes** for the Connected App to propagate

---

## Step 2: Get Your OAuth Credentials

### 2.1 View Consumer Key and Secret

1. You'll be on the Connected App detail page
2. Find the **API (Enable OAuth Settings)** section
3. Copy the **Consumer Key** - this is your `SALESFORCE_CLIENT_ID`
4. Click **Click to reveal** next to Consumer Secret
5. Copy the **Consumer Secret** - this is your `SALESFORCE_CLIENT_SECRET`

⚠️ **Keep these credentials secure!** They should NEVER be committed to version control.

---

## Step 3: Configure Your Application

### 3.1 Set Environment Variables

Add these to your environment configuration:

**Production (`.env.production` or your hosting platform):**
```bash
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_REDIRECT_URI=https://app.callhenk.com/api/integrations/salesforce/callback
```

**Staging:**
```bash
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_REDIRECT_URI=https://staging.callhenk.com/api/integrations/salesforce/callback
```

### 3.2 Secure Your Credentials

**For cloud hosting (recommended):**
- Vercel: Add to Environment Variables in project settings
- AWS/Heroku: Use their secrets management
- Railway/Render: Add to environment variables

**Never:**
- ❌ Commit credentials to Git
- ❌ Share credentials in Slack/Email
- ❌ Store in plain text files

### 3.3 Deploy Your Application

1. Add the environment variables to your hosting platform
2. Deploy your application
3. Verify the variables are loaded (check server logs)

---

## Step 4: Test the Integration

### 4.1 Test User Flow

1. Log into your application with a test account
2. Navigate to **Integrations** page
3. Click **Connect** on the Salesforce integration
4. Click **Continue** → **Connect to Salesforce**
5. You should be redirected to Salesforce
6. Approve the connection
7. You should be redirected back and see "Connected" status

### 4.2 Verify Data Storage

Check that the integration was saved:
```sql
SELECT * FROM integrations WHERE type = 'crm' AND name = 'Salesforce';
```

You should see:
- ✅ Status: 'connected'
- ✅ Tokens in credentials field
- ✅ Instance URL in config

---

## Step 5: Ongoing Management

### Monitoring

**Check Connected App Usage:**
1. Salesforce Setup → Identity → OAuth and OpenID Connect Settings
2. Monitor active sessions and token usage

**Review Logs:**
- Monitor your application logs for OAuth errors
- Set up alerts for failed token refreshes

### Maintenance

**Rotate Credentials (Quarterly Recommended):**
1. In Salesforce Connected App, regenerate Consumer Secret
2. Update environment variables
3. Deploy updated configuration
4. Monitor for errors

**Update Scopes (If Needed):**
1. Edit the Connected App in Salesforce
2. Add/remove OAuth scopes
3. Users will need to re-authorize next time they connect

### Troubleshooting

**Users Can't Connect:**
- Verify environment variables are set correctly
- Check Connected App is active (not disabled)
- Ensure callback URL exactly matches
- Wait 10 minutes after making Connected App changes

**Token Refresh Failures:**
- Check that refresh tokens are being stored
- Verify "Perform requests on your behalf at any time" scope is enabled
- Check Salesforce session settings (Setup → Session Settings)

---

## Multi-Environment Setup

### Option 1: Single Connected App (Simpler)

Use one Connected App with multiple callback URLs:
- ✅ Easier to manage
- ✅ Fewer credentials to secure
- ⚠️ Same scopes for all environments

### Option 2: Separate Connected Apps (More Secure)

Create separate Connected Apps for each environment:
- **Development Connected App**: Limited scopes, test data
- **Staging Connected App**: Production-like scopes
- **Production Connected App**: Full scopes

Benefits:
- 🔒 Better security isolation
- 🧪 Test scope changes before production
- 📊 Separate usage analytics

---

## Security Best Practices

1. **Use HTTPS only** - Never use HTTP in production
2. **Rotate secrets regularly** - Every 90 days recommended
3. **Monitor token usage** - Set up alerts for unusual activity
4. **Limit scopes** - Only request what you need
5. **Enable IP restrictions** (Optional) - In Connected App settings
6. **Review user sessions** - Regularly audit connected users
7. **Implement token refresh** - Handle expired tokens gracefully

---

## What Your Users See

With this setup complete, your users will have a simple experience:

1. Navigate to Integrations page
2. Click "Connect" on Salesforce
3. Authorize the connection (one click)
4. Done! ✅

No setup, no API keys, no technical knowledge required.

---

## Support

If you encounter issues:

1. Check the error message in your application
2. Review server logs for detailed errors
3. Verify environment variables are set
4. Check Salesforce Connected App status
5. Ensure callback URLs match exactly

For Salesforce-specific issues, see:
- [Connected Apps Documentation](https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm)
- [OAuth 2.0 Web Server Flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm)
