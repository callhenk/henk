# Making Your Salesforce Connected App Available to All Users

## The Problem

By default, Salesforce Connected Apps are only available in the org where they're created. When external users (in different Salesforce orgs) try to connect, they get:

```
"External client app is not installed in this org"
```

## Solution Options

### Option 1: AppExchange Listing (Production Ready)

This makes your app available to ALL Salesforce users across all orgs.

**Pros:**
- ✅ Users can install from Salesforce AppExchange
- ✅ Professional and trustworthy
- ✅ Works for all Salesforce editions
- ✅ No per-user setup required

**Cons:**
- ⏰ Requires Salesforce security review (weeks to months)
- 💰 May require AppExchange listing fee
- 📋 More documentation required

**When to use:** Production apps with many users

---

### Option 2: Install URL (Quick Solution)

Provide users with a direct installation URL for your Connected App.

**Pros:**
- ✅ Works immediately (no review needed)
- ✅ Simple to implement
- ✅ Good for beta/testing

**Cons:**
- ⚠️ Users must manually install the app in their org
- ⚠️ Requires Salesforce admin privileges
- ⚠️ Less professional experience

**When to use:** Beta testing, internal tools, smaller user base

---

### Option 3: Use OAuth Username-Password Flow (Not Recommended)

Users provide their Salesforce credentials directly.

**Pros:**
- ✅ No app installation needed

**Cons:**
- ❌ Requires users to share passwords (security risk)
- ❌ Breaks when users change passwords
- ❌ Against Salesforce best practices
- ❌ Can't use SSO/MFA

**When to use:** Never for production

---

## Recommended Approach: Option 2 (Install URL)

For now, use the Install URL approach while you prepare for AppExchange listing.

### Step 1: Get Your Connected App Install URL

1. Go to your Salesforce Setup → App Manager
2. Find your Connected App
3. Click the dropdown → **View**
4. Copy the URL from your browser - it looks like:
   ```
   https://YOUR_INSTANCE.salesforce.com/app/mgmt/forceconnectedapps/forceAppDetail.apexp?applicationId=YOUR_APP_ID
   ```

5. Convert it to an install URL:
   ```
   https://login.salesforce.com/packaging/installPackage.apexp?p0=YOUR_CONSUMER_KEY
   ```

### Step 2: Update Your Application UI

Add installation instructions to your integration flow.

### Step 3: User Installation Process

When users click "Connect to Salesforce", they need to:

1. **Install the app first** (one-time, requires admin)
   - Visit the install URL
   - Approve installation
   - Select "Install for All Users"

2. **Then connect** through your application
   - Click "Connect to Salesforce"
   - Authorize access
   - Done!

---

## Implementation: Add Installation Flow to Your App

### Update the Integration Drawer

Add pre-authorization step explaining the installation requirement.

---

## Better Solution: Salesforce Developer Edition App

Create your Connected App in a **Salesforce Developer Edition** org and make it a **Managed Package**.

### Benefits:
- Can distribute to other orgs
- Version control
- Better for production use

### Steps:

1. **Sign up for Salesforce Developer Edition** (free)
   - Go to https://developer.salesforce.com/signup
   - Create a new Developer Edition org

2. **Create Connected App in Dev Edition**
   - Follow the same steps as before
   - Create it in your Developer Edition org

3. **Create a Managed Package**
   - Setup → Package Manager
   - Create New Package
   - Add your Connected App to the package
   - Upload the package

4. **Get Installation URL**
   - The package will have an installation URL
   - Share this URL with your users

---

## Long-Term Solution: AppExchange

For a production-ready, professional solution:

### 1. Prepare Your App

- Complete security review requirements
- Create comprehensive documentation
- Set up support channels
- Prepare marketing materials

### 2. Submit for Security Review

- Go to Salesforce Partner Community
- Submit your Connected App for security review
- Provide required documentation
- Answer security questionnaire

### 3. Create AppExchange Listing

- Design listing page
- Add screenshots and videos
- Write clear description
- Set pricing (if applicable)

### 4. Review Process

- Security review: 2-8 weeks
- AppExchange approval: 1-2 weeks
- Address any feedback
- Final approval

### 5. Launch

- App available on AppExchange
- Users can install with one click
- Appears in their org's App Launcher

---

## Quick Fix for Testing

While you decide on the long-term approach, here's a quick workaround:

### Have Each User Create a Connected App (Temporary)

Update your documentation to guide users through creating their own Connected App:

**Pros:**
- ✅ Works immediately
- ✅ No review process

**Cons:**
- ❌ Poor user experience
- ❌ Each user needs admin access
- ❌ Technical knowledge required
- ❌ Not scalable

**Only use this for:** MVP testing with technical users

---

## Recommended Path Forward

### Phase 1: Now (Quick Start)
- Use Install URL approach
- Guide users through app installation
- Test with beta users

### Phase 2: Next 1-2 Months
- Create Managed Package in Developer Edition
- Improve installation experience
- Gather user feedback

### Phase 3: Production (3-6 Months)
- Submit for Salesforce Security Review
- Create AppExchange listing
- Launch publicly

---

## Resources

- [Salesforce Connected Apps Documentation](https://help.salesforce.com/s/articleView?id=sf.connected_app_overview.htm)
- [AppExchange Partner Program](https://partners.salesforce.com/)
- [Security Review Requirements](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/security_review_guidelines.htm)
- [Managed Packages Guide](https://developer.salesforce.com/docs/atlas.en-us.packagingGuide.meta/packagingGuide/)

---

## Alternative: Use Salesforce's Standard OAuth

If you need immediate solution without app installation:

### Use "OAuth 2.0 Username-Password Flow"

This allows users to connect without installing anything, but requires:
- Username
- Password
- Security Token

**Implementation:**
```typescript
// User provides these credentials
const credentials = {
  username: 'user@example.com',
  password: 'password',
  securityToken: 'token',
  // Or use OAuth with refresh token
};
```

**Note:** This is less secure and not recommended for production.

---

## Summary

**Immediate (Testing):**
- Provide install URL to users
- Guide them through installation
- They can then connect

**Production (Recommended):**
- Create Managed Package
- Submit for AppExchange
- Users install from AppExchange
- Seamless experience

The "External client app is not installed" error is expected behavior - it's Salesforce's way of protecting users from unauthorized apps.
