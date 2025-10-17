# Salesforce Connected App Deployment Guide

## The "Installation URL" Explained

When the documentation mentions "installation URL," it refers to a **Salesforce package installation link** that allows customers to install your Connected App into their Salesforce org with one click.

## Current Situation

Right now, you have a Connected App configured with:
- Client ID: `SALESFORCE_CLIENT_ID` (environment variable)
- Client Secret: `SALESFORCE_CLIENT_SECRET` (environment variable)
- Callback URL: `https://app.callhenk.com/api/integrations/salesforce/callback`

**Problem**: This Connected App only exists in YOUR Salesforce org. When users try to connect, they get the error "External client app is not installed in this org" because the Connected App doesn't exist in THEIR org.

## Solution: Create a Distributable Package

You need to create a Salesforce package that contains your Connected App, so customers can install it into their own orgs.

### Step 1: Create a Developer Edition Org (if you don't have one)

1. Go to https://developer.salesforce.com/signup
2. Create a free Developer Edition org
3. This will be your "packaging org"

### Step 2: Create the Connected App in Your Developer Org

1. Log into your Developer Edition org
2. Go to **Setup → App Manager → New Connected App**
3. Configure it with these settings:

```
Connected App Name: Henk
API Name: Henk
Contact Email: support@callhenk.com
Description: Henk integration for campaign management

☑ Enable OAuth Settings
Callback URL: https://app.callhenk.com/api/integrations/salesforce/callback

Selected OAuth Scopes:
  - Access and manage your data (api)
  - Perform requests at any time (refresh_token, offline_access)

☐ Require Secret for Web Server Flow (leave unchecked for easier distribution)
☐ Require Secret for Refresh Token Flow (leave unchecked)
```

4. Save and note the **Consumer Key** (this is your CLIENT_ID)
5. Click "Click to reveal" for the **Consumer Secret** (this is your CLIENT_SECRET)
6. Update your `.env` files with these credentials

### Step 3: Create an Unmanaged Package

#### Option A: Simple Unmanaged Package (Quick Start)

1. In your Developer org, go to **Setup → Packaging → Package Manager**
2. Click **New** under "Unmanaged Packages"
3. Enter package details:
   - Package Name: `Henk Integration`
   - Description: `Enables Henk integration for Salesforce`
4. Click **Add Components**
5. Select **Connected Apps** → Select your "Henk" Connected App
6. Click **Add To Package**
7. Click **Upload** (even for unmanaged, you get a distribution URL)

The installation URL will look like:
```
https://login.salesforce.com/packaging/installPackage.apexp?p0=04t...
```

#### Option B: Managed Package (For Production Use)

This is more complex but recommended for production:

1. Register a namespace in your Developer org:
   - **Setup → Packaging → Package Manager → Edit**
   - Choose a unique namespace (e.g., `henk`)
2. Create a managed package instead of unmanaged
3. Upload a version
4. Submit to AppExchange (optional, but recommended)

**Benefits:**
- Automatic updates for customers
- Better version control
- Professional appearance
- Can be listed on AppExchange

### Step 4: Distribute the Installation URL

Once you have the package URL, you can:

1. **Email it directly to customers:**
   ```
   Subject: Henk Salesforce Integration Setup

   Hi [Customer Name],

   To enable the Henk integration with your Salesforce org, please have your
   Salesforce administrator install our Connected App using this link:

   https://login.salesforce.com/packaging/installPackage.apexp?p0=04t...

   Installation steps:
   1. Click the link above (must be logged into Salesforce as admin)
   2. Choose "Install for All Users"
   3. Click "Install"
   4. Once installed, all users can connect from https://app.callhenk.com/home/integrations

   Best regards,
   Henk Support
   ```

2. **Store it in your database** and serve it via an API endpoint:
   ```typescript
   // app/api/integrations/salesforce/install-url/route.ts
   export async function GET() {
     return NextResponse.json({
       install_url: process.env.SALESFORCE_PACKAGE_INSTALL_URL,
       instructions: "Click to install the Henk Connected App..."
     });
   }
   ```

3. **Create a dedicated page:**
   ```typescript
   // app/home/integrations/salesforce-install/page.tsx
   export default function SalesforceInstallPage() {
     return (
       <div>
         <h1>Install Henk for Salesforce</h1>
         <a href={process.env.NEXT_PUBLIC_SALESFORCE_INSTALL_URL}>
           Install Now
         </a>
       </div>
     );
   }
   ```

## Alternative: Multi-Tenant Architecture

If you don't want to use packages, you could store customer-specific credentials:

```typescript
// This allows each customer to create their own Connected App
// Store their credentials in your database

// 1. Update database schema
create table salesforce_oauth_configs (
  business_id uuid references businesses(id),
  client_id text not null,
  client_secret text not null, -- encrypted
  created_at timestamptz default now()
);

// 2. Update authorize endpoint to look up credentials
const config = await supabase
  .from('salesforce_oauth_configs')
  .select('client_id, client_secret')
  .eq('business_id', businessId)
  .single();

if (!config.data) {
  return NextResponse.json({
    error: 'Salesforce not configured for your organization'
  });
}

// Use config.data.client_id and config.data.client_secret
```

**Pros:**
- No package distribution needed
- Each customer has their own Connected App

**Cons:**
- More complex setup per customer
- Requires storing and managing multiple credentials
- Customer admins must manually create Connected Apps

## Recommended Approach

**For MVP/Early Customers**: Use the **Simple Unmanaged Package** approach
- Faster to implement
- Good enough for <100 customers
- Installation URL that you email to customers

**For Scale/Production**: Use the **Managed Package + AppExchange** approach
- Professional
- Automatic updates
- Discovery via AppExchange
- Better for 100+ customers

## Next Steps

1. ☐ Create Developer Edition org (if needed)
2. ☐ Create Connected App with correct settings
3. ☐ Update environment variables with new credentials
4. ☐ Create unmanaged package with the Connected App
5. ☐ Get installation URL from Salesforce
6. ☐ Test installation in a test Salesforce org
7. ☐ Update documentation with actual installation URL
8. ☐ (Optional) Submit to AppExchange for wider distribution

## Testing the Installation

1. Create a second Salesforce Developer Edition org (test customer)
2. Use the installation URL to install your package
3. Try the OAuth flow from your app
4. Verify the connection works
5. Verify tokens are saved correctly

## Current Error Explained

The error "External client app is not installed in this org" happens because:

1. Your Connected App exists in YOUR Salesforce org
2. User tries to authenticate from THEIR Salesforce org
3. Salesforce checks if the Connected App (by Client ID) exists in THEIR org
4. It doesn't exist → Error

**The package installation** puts a copy of your Connected App into their org, using the same Client ID you configured.

## Questions?

- **Q: Can I skip packaging and just give customers my Client ID/Secret?**
  A: No. The Connected App must physically exist in their org.

- **Q: Will each customer need different credentials?**
  A: No. The package approach means everyone uses the SAME credentials (yours).

- **Q: What about security?**
  A: OAuth is user-specific. Each user authorizes YOUR app to access THEIR data.

- **Q: Can I test without packaging?**
  A: Yes, but only if you authenticate users from YOUR Salesforce org (not theirs).
