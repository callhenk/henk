# Multi-Factor Authentication (MFA) Production Setup

This guide explains how to enable MFA in your production Supabase project.

## Prerequisites

- Supabase project at https://app.callhenk.com
- Admin access to Supabase Dashboard
- Supabase CLI installed and linked to your project

## Option 1: Enable MFA via Supabase Dashboard (Recommended)

### Step 1: Navigate to Authentication Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your `henk-ai` project
3. Navigate to **Authentication** → **Providers**
4. Scroll down to **Multi-Factor Authentication**

### Step 2: Enable MFA

1. Toggle **Enable Multi-Factor Authentication** to ON
2. Configure the following settings:
   - **Maximum enrolled factors per user**: `10`
   - **Allow unenrollment**: `true` (recommended for better UX)
   - **Require MFA for all users**: `false` (let users opt-in)

### Step 3: Configure TOTP Settings

1. Under **TOTP Settings**:
   - **Issuer**: `Henk` (or `app.callhenk.com`)
   - **Period**: `30` seconds (default)
   - **Skew**: `1` (allows 1 time period before/after for clock drift)
   - **Algorithm**: `SHA1` (most compatible with authenticator apps)

### Step 4: Save and Test

1. Click **Save**
2. Test MFA enrollment in your app at https://app.callhenk.com/home/settings/security

## Option 2: Enable MFA via Supabase CLI

### Step 1: Link to Production Project

```bash
# If not already linked
supabase link --project-ref YOUR_PROJECT_REF
```

### Step 2: Update Production Config

Create or update your production config file:

```bash
# Create a production config patch
cat > supabase/production-mfa.toml << EOF
[auth.mfa]
max_enrolled_factors = 10
EOF
```

### Step 3: Deploy to Production

**⚠️ WARNING**: This will update your production authentication settings!

```bash
# Review changes first
supabase db diff --linked

# Deploy the configuration
supabase db push --linked
```

## Verification Steps

After enabling MFA in production:

### 1. Test MFA Enrollment Flow

1. Go to https://app.callhenk.com/home/settings/security
2. Click "Setup a new Factor"
3. Enter a factor name (e.g., "My Phone")
4. Scan the QR code with an authenticator app (Google Authenticator, Authy, 1Password, etc.)
5. Enter the 6-digit verification code
6. Verify the factor appears in your enrolled factors list

### 2. Test MFA Sign-In Flow

1. Sign out of your account
2. Sign back in with email and password
3. You should be prompted for the MFA code
4. Enter the code from your authenticator app
5. Verify you can access your account

### 3. Test Factor Management

1. Go to Security Settings
2. Verify you can see your enrolled factors
3. Test unenrolling a factor (optional)
4. Re-enroll to confirm the flow works

## Production Environment Variables

Ensure these are set in your production environment:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-only!

# App Configuration
NEXT_PUBLIC_APP_URL=https://app.callhenk.com
NEXT_PUBLIC_SITE_URL=https://app.callhenk.com
```

## Monitoring and Analytics

### Track MFA Adoption

Monitor MFA adoption in your Supabase Dashboard:

1. Go to **Authentication** → **Users**
2. Filter by users with MFA enabled
3. Track adoption rate over time

### SQL Query for MFA Stats

```sql
-- Count users with MFA enabled
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN array_length(factors, 1) > 0 THEN 1 END) as users_with_mfa,
  ROUND(
    COUNT(CASE WHEN array_length(factors, 1) > 0 THEN 1 END)::numeric /
    COUNT(*)::numeric * 100,
    2
  ) as mfa_adoption_rate
FROM auth.users;
```

## Security Best Practices

### 1. Recovery Codes

Consider implementing recovery codes for users who lose access to their authenticator app:

- Store encrypted recovery codes in user metadata
- Allow users to download/print recovery codes after enrollment
- Implement a "lost authenticator" recovery flow

### 2. Rate Limiting

Ensure rate limiting is enabled for MFA verification attempts:

- Limit verification attempts to prevent brute force
- Implement lockout after failed attempts
- Use Supabase's built-in rate limiting or add custom middleware

### 3. User Education

Provide clear documentation for users:

- How to set up MFA
- Which authenticator apps to use
- What to do if they lose their device
- How to contact support for MFA issues

## Troubleshooting

### QR Code Won't Generate

**Symptoms**: "QR Code Error" message when trying to enroll

**Solutions**:
1. Verify MFA is enabled in Supabase Dashboard
2. Check that user has a valid session
3. Ensure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
4. Check browser console for errors
5. Verify Supabase service is not experiencing issues

### Verification Code Always Fails

**Symptoms**: Valid TOTP codes are rejected

**Solutions**:
1. Check device time is synchronized (TOTP is time-based)
2. Verify TOTP settings (period: 30s, algorithm: SHA1)
3. Increase skew tolerance in Supabase settings
4. Try entering the next code (wait 30 seconds)

### Users Locked Out

**Symptoms**: User can't access account after enabling MFA

**Solutions**:
1. Use Supabase Dashboard → Authentication → Users
2. Find the user and unenroll their factors manually
3. Implement a recovery code system to prevent this
4. Consider adding a "backup email" verification option

## Rollback Plan

If you need to disable MFA in production:

### Via Dashboard

1. Go to Authentication → Providers
2. Toggle MFA to OFF
3. All existing enrolled factors will be preserved but not enforced

### Via CLI

```bash
# This will disable MFA enforcement but preserve enrolled factors
supabase db reset --linked  # ⚠️ Use with caution!
```

## Support and Resources

- [Supabase MFA Documentation](https://supabase.com/docs/guides/auth/auth-mfa)
- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- Henk Support: support@callhenk.com
- Emergency MFA Issues: Contact Supabase Support

## Next Steps

After enabling MFA in production:

1. ✅ Monitor error logs for MFA-related issues
2. ✅ Track MFA adoption metrics
3. ✅ Create user documentation/help center articles
4. ✅ Consider making MFA mandatory for admin users
5. ✅ Implement recovery code system
6. ✅ Add MFA status to user profile/dashboard
