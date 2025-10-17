# Salesforce Integration - Current Status

## What's Built

✅ **OAuth Flow Code** - authorize and callback endpoints work
✅ **UI Components** - Integration card, drawer, setup guide all exist
✅ **Database Schema** - integrations table ready
✅ **Error Handling** - Comprehensive error messages
✅ **Session Management** - Cookies preserved during OAuth

## What's NOT Built (The Critical Missing Piece)

❌ **No Salesforce Package** - You haven't created a distributable Connected App package
❌ **No Installation URL** - Can't give customers a link to install your app
❌ **Single Credentials Only** - Code uses ONE set of env vars, not per-customer credentials

## The Problem

Your code expects this:
```env
SALESFORCE_CLIENT_ID=your_client_id_here
SALESFORCE_CLIENT_SECRET=your_client_secret_here
```

But these credentials only work if the Connected App exists in the **customer's Salesforce org**, which it doesn't.

## Why Customers Get "External client app is not installed"

1. You created a Connected App in YOUR Salesforce org
2. You set `SALESFORCE_CLIENT_ID` to that app's Consumer Key
3. Customer clicks "Connect to Salesforce"
4. They're redirected to THEIR Salesforce org's login
5. Salesforce looks for a Connected App with that Client ID **in THEIR org**
6. It doesn't exist → Error: "External client app is not installed in this org"

## Two Paths Forward

### Path A: Create a Salesforce Package (Recommended)

**Time: ~2-4 hours**

1. Create a Developer Edition Salesforce org
2. Create Connected App in that org
3. Create an unmanaged package containing the Connected App
4. Get the installation URL from Salesforce
5. Give customers that URL to install

**Result**: All customers install YOUR Connected App (same Client ID) into their orgs

**Pro**: Simple, scales well, no code changes needed
**Con**: Requires understanding Salesforce packaging

### Path B: Multi-Tenant Architecture

**Time: ~1-2 days of development**

1. Create a database table for per-customer OAuth configs:
```sql
create table salesforce_configs (
  business_id uuid references businesses(id),
  client_id text not null,
  client_secret text not null, -- encrypted
  primary key (business_id)
);
```

2. Update authorize endpoint to lookup credentials:
```typescript
const { data: config } = await supabase
  .from('salesforce_configs')
  .select('client_id, client_secret')
  .eq('business_id', businessId)
  .single();
```

3. Each customer creates their own Connected App
4. They send you their credentials
5. You store them per customer

**Result**: Each customer has their own Connected App with unique credentials

**Pro**: Gives customers full control
**Con**: Complex setup, harder to support, requires code changes

## Recommendation

**Do Path A** - Create the package. It's simpler and matches industry best practices.

## Next Steps for Path A

1. **Sign up for Salesforce Developer Edition** (free)
   - Go to https://developer.salesforce.com/signup
   - This becomes your "packaging org"

2. **Create the Connected App**
   - Setup → App Manager → New Connected App
   - Use callback: `https://app.callhenk.com/api/integrations/salesforce/callback`
   - Scopes: `api` and `refresh_token`
   - Copy the Consumer Key and Secret

3. **Update your environment variables**
   ```env
   SALESFORCE_CLIENT_ID=<consumer_key_from_step_2>
   SALESFORCE_CLIENT_SECRET=<consumer_secret_from_step_2>
   ```

4. **Create the package**
   - Setup → Packaging → Package Manager → New
   - Add your Connected App to the package
   - Upload/publish it

5. **Get the installation URL**
   - It will look like: `https://login.salesforce.com/packaging/installPackage.apexp?p0=04t...`
   - Save this URL

6. **Test it**
   - Create another free Salesforce Developer Edition org (simulates a customer)
   - Install your package using the URL from step 5
   - Try connecting from your app
   - Should work!

7. **Update documentation**
   - Replace "contact support for installation URL" with the actual URL
   - Or create an API endpoint that returns the URL
   - Mark the integration as "Available" instead of "Beta"

## Current Documentation Status

The setup guide at `/home/integrations/salesforce-setup` now says:

> "Salesforce Integration Currently in Beta - Please contact support@callhenk.com if you're interested in early access."

This is **honest** about the current state (not fully available) without giving misleading instructions.

## When You're Ready

Once you have the installation URL from Path A, update:

1. `SALESFORCE_SETUP_SUMMARY.md` - Add the real installation URL
2. `/home/integrations/salesforce-setup/page.tsx` - Replace "beta" notice with real instructions
3. `mock-data.tsx` - Change Salesforce status from 'disconnected' to 'available'
4. Test with a real customer org

## Questions?

- **Can I test without a package?** Yes, but only if you authenticate users from YOUR Salesforce org (not theirs)
- **Do I need AppExchange?** No, unmanaged packages work fine via direct installation URL
- **What about security?** OAuth is secure - each user authorizes individually, you never see passwords
- **Can I change the Connected App later?** Unmanaged packages allow updates, but Client ID stays the same
