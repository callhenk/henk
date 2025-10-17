# Salesforce Integration - Quick Reference

## For Users

**Setup Guide**: Navigate to `/home/integrations/salesforce-setup` in your app

### Quick Steps

1. **Administrator** installs the app in Salesforce (one-time)
2. **Users** connect by clicking "Connect" on the Integrations page
3. Authorize access in Salesforce
4. Done!

## For Administrators

### One-Time Setup Required

Your Salesforce admin needs to install our Connected App in your Salesforce org before anyone can connect.

**Why?** Salesforce requires apps to be explicitly installed in each organization for security.

### Installation Process

1. Contact support@callhenk.com for the installation URL
2. Click the URL and approve the app installation
3. Select "Install for All Users"
4. Notify your team they can now connect

## Common Errors

### "External client app is not installed"
- **Meaning**: Admin setup not complete
- **Solution**: Complete administrator installation first

### "Access denied"
- **Meaning**: User clicked "Deny" in Salesforce
- **Solution**: Try again and click "Allow"

### "API Enabled permission missing"
- **Meaning**: User doesn't have API access
- **Solution**: Admin needs to enable "API Enabled" in user profile

## Technical Documentation

For developers and administrators:

- **Admin Setup**: `SALESFORCE_ADMIN_SETUP.md`
- **Technical Details**: `SALESFORCE_INTEGRATION_SETUP.md`
- **AppExchange Info**: `SALESFORCE_APP_EXCHANGE_SETUP.md`
- **Code Review**: `SALESFORCE_INTEGRATION_REVIEW.md`

## Support

**Email**: support@callhenk.com
**Setup Guide**: https://app.callhenk.com/home/integrations/salesforce-setup
