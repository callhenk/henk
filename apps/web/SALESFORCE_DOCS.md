# Salesforce Integration Documentation

## For Users

### 📖 In-App Setup Guide (Primary)
**Location**: `/home/integrations/salesforce-guide`

This is the main guide users should follow. It includes:
- Step-by-step instructions with screenshots
- 3-step setup wizard walkthrough
- Troubleshooting common issues
- Visual design with icons and color-coded sections

**How to access:**
1. Navigate to Settings → Integrations
2. Find the Salesforce card
3. Click "Setup Guide (5 min)" link
4. Or click "Connect" and follow the guide links in the wizard

---

## For Administrators & Developers

### 🔧 SALESFORCE_ADMIN_SETUP.md
Detailed technical guide for Salesforce administrators including:
- Comprehensive Connected App configuration
- OAuth scope details
- Security best practices
- Multi-environment setup
- Maintenance and monitoring

### 🚀 SALESFORCE_DEPLOYMENT_GUIDE.md
For system administrators deploying Henk:
- Package distribution strategies
- Managed vs unmanaged packages
- Multi-tenant architecture options
- Installation URL generation

---

## Quick Reference

| Audience | Document | Purpose |
|----------|----------|---------|
| **End Users** | `/home/integrations/salesforce-guide` | Setup guide (in-app) |
| **Salesforce Admins** | `SALESFORCE_ADMIN_SETUP.md` | Technical details |
| **System Admins** | `SALESFORCE_DEPLOYMENT_GUIDE.md` | Deployment options |

---

## Integration Flow

```
User → Setup Guide → Create Connected App → Enter Credentials → OAuth → Connected!
```

1. User visits Salesforce card and clicks "Setup Guide"
2. Follows in-app guide to create Connected App
3. Enters Client ID and Secret in Henk
4. Clicks "Connect to Salesforce"
5. Authorizes via OAuth
6. Returns to Henk with connected status

---

**Last Updated**: 2025-01-18
