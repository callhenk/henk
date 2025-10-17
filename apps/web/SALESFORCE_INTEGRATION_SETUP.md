# Salesforce Integration Setup Guide

This guide walks you through setting up the Salesforce integration for your application, including creating a Connected App in Salesforce and configuring OAuth authentication.

## Prerequisites

- A Salesforce account with administrative access
- Access to your Salesforce Setup area
- Your application's callback URL

## Part 1: Create a Salesforce Connected App

### Step 1: Access Salesforce Setup

1. Log in to your Salesforce account
2. Click the gear icon (⚙️) in the top-right corner
3. Select **Setup** from the dropdown menu

### Step 2: Navigate to App Manager

1. In the Setup Quick Find box (left sidebar), type "App Manager"
2. Click **App Manager** under Apps
3. Click **New Connected App** button (top-right)

### Step 3: Configure Basic Information

Fill in the following fields:

**Basic Information:**
- **Connected App Name**: `Your App Name` (e.g., "Henk Integration")
- **API Name**: This will auto-populate based on the app name
- **Contact Email**: Your email address

### Step 4: Enable OAuth Settings

1. Check the box **Enable OAuth Settings**

2. **Callback URL**: Add your callback URLs (you can add multiple for different environments):
   ```
   http://localhost:3000/api/integrations/salesforce/callback
   https://app.callhenk.com/api/integrations/salesforce/callback
   ```

   > **Important**: Add one URL per line. For local development, include `http://localhost:3000/...`

3. **Selected OAuth Scopes**: Move the following scopes from "Available OAuth Scopes" to "Selected OAuth Scopes":
   - `Access the identity URL service (id, profile, email, address, phone)`
   - `Access and manage your data (api)`
   - `Perform requests on your behalf at any time (refresh_token, offline_access)`

   Click **Add** to move them to the right column.

4. **Additional OAuth Settings** (optional but recommended):
   - Check **Require Secret for Web Server Flow** (recommended for security)
   - Check **Require Secret for Refresh Token Flow**
   - Check **Enable Authorization Code and Credentials Flow**

### Step 5: Save the Connected App

1. Click **Save** at the bottom of the page
2. Click **Continue** on the confirmation page

> **Note**: It may take 2-10 minutes for your Connected App changes to take effect.

### Step 6: Get Your OAuth Credentials

1. After saving, you'll be redirected to the Connected App detail page
2. In the **API (Enable OAuth Settings)** section, you'll see:
   - **Consumer Key** (this is your Client ID)
   - **Consumer Secret** - Click **Click to reveal** to see it

3. **Copy these values** - you'll need them for your environment configuration

## Part 2: Configure Your Application

### Step 1: Update Environment Variables

Update your `.env.development` file (or `.env.local`) with your Salesforce credentials:

```bash
# Salesforce OAuth Configuration
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_REDIRECT_URI=http://localhost:3000/api/integrations/salesforce/callback
```

For production (`.env.production`):

```bash
# Salesforce OAuth Configuration
SALESFORCE_CLIENT_ID=your_consumer_key_here
SALESFORCE_CLIENT_SECRET=your_consumer_secret_here
SALESFORCE_REDIRECT_URI=https://app.callhenk.com/api/integrations/salesforce/callback
```

### Step 2: Restart Your Development Server

After updating environment variables, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
pnpm dev
```

## Part 3: Test the Integration

1. Navigate to the **Integrations** page in your application
2. Find the **Salesforce** integration card
3. Click **Connect**
4. Click **Continue** through the setup steps
5. Click **Connect to Salesforce** on the authentication step
6. You'll be redirected to Salesforce to authorize the connection
7. Review the permissions and click **Allow**
8. You'll be redirected back to your application

If successful, you should see the Salesforce integration status change to "Connected"!

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The callback URL in your application doesn't match what's configured in Salesforce.

**Solution**:
1. Check that your `SALESFORCE_REDIRECT_URI` environment variable exactly matches one of the Callback URLs in your Connected App settings
2. Make sure there are no trailing slashes or typos
3. Remember: `http://localhost:3000` ≠ `http://localhost:3001` ≠ `https://localhost:3000`

### Error: "invalid_client_id"

**Problem**: The Consumer Key (Client ID) is incorrect or the Connected App isn't active yet.

**Solutions**:
1. Verify your `SALESFORCE_CLIENT_ID` matches the Consumer Key from your Connected App
2. Wait 2-10 minutes after creating the Connected App for it to become active
3. Check that the Connected App is not disabled in Salesforce

### Error: "access_denied"

**Problem**: You clicked "Deny" when Salesforce asked for authorization, or your Salesforce user doesn't have API access.

**Solutions**:
1. Try connecting again and click "Allow" when prompted
2. Verify your Salesforce user profile has "API Enabled" permission:
   - Go to Setup → Users → Users
   - Click on your username
   - Check your Profile
   - Ensure "API Enabled" is checked in the profile permissions

### OAuth Flow Doesn't Start

**Problem**: Clicking "Connect to Salesforce" doesn't redirect to Salesforce.

**Solutions**:
1. Check browser console for errors
2. Verify environment variables are loaded (restart dev server)
3. Ensure the authorize endpoint is working: `/api/integrations/salesforce/authorize`

### "Internal Server Error" or "Configuration Error"

**Problem**: Server-side configuration issue.

**Solutions**:
1. Verify all three environment variables are set:
   - `SALESFORCE_CLIENT_ID`
   - `SALESFORCE_CLIENT_SECRET`
   - `SALESFORCE_REDIRECT_URI`
2. Check server logs for specific error messages
3. Restart your development server after changing environment variables

## Advanced Configuration

### Using Salesforce Sandbox

If you're using a Salesforce Sandbox environment for testing:

1. Change the authorization URL in your code from:
   ```
   https://login.salesforce.com/services/oauth2/authorize
   ```
   to:
   ```
   https://test.salesforce.com/services/oauth2/authorize
   ```

2. Update the token URL similarly in the callback handler

### Managing Multiple Environments

Best practice: Create separate Connected Apps for each environment:
- **Development Connected App**: Uses `http://localhost:*` callback URLs
- **Staging Connected App**: Uses your staging domain
- **Production Connected App**: Uses your production domain

This prevents OAuth errors and makes it easier to manage permissions per environment.

## Security Best Practices

1. **Never commit** your `.env` files to version control
2. **Rotate** your Consumer Secret regularly
3. **Use HTTPS** in production (always)
4. **Limit OAuth scopes** to only what your app needs
5. **Monitor** OAuth token usage in Salesforce Setup → Identity → OAuth and OpenID Connect Settings

## Additional Resources

- [Salesforce Connected Apps Documentation](https://help.salesforce.com/s/articleView?id=sf.connected_app_create.htm)
- [Salesforce OAuth 2.0 Web Server Flow](https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_web_server_flow.htm)
- [Salesforce API Documentation](https://developer.salesforce.com/docs/apis)

## Support

If you continue to experience issues:
1. Check the application logs for detailed error messages
2. Verify your Salesforce user has appropriate API permissions
3. Ensure your Connected App has been saved for at least 10 minutes
4. Contact support with the specific error message you're receiving
