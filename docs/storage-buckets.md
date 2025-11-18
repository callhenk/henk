# Storage Buckets Configuration

## Overview

Storage buckets and their policies are **NOT managed via migrations**. They must be configured through the Supabase Dashboard or API.

> **Why?** Storage schema is managed by Supabase infrastructure and requires special migrations that users cannot create. Attempting to apply storage schema migrations will cause permission errors.

---

## Required Buckets

The following storage buckets must exist in your Supabase project:

### 1. `account_image`

- **Purpose**: User profile images
- **Public**: No
- **File Size Limit**: 5 MB
- **Allowed MIME Types**: `image/png`, `image/jpeg`, `image/webp`

### 2. `agent_assets`

- **Purpose**: Agent-specific files and resources
- **Public**: No
- **File Size Limit**: 10 MB
- **Allowed MIME Types**: `image/*`, `audio/*`

### 3. `campaign_assets`

- **Purpose**: Campaign-related files
- **Public**: No
- **File Size Limit**: 10 MB
- **Allowed MIME Types**: `image/*`, `audio/*`, `video/*`

### 4. `knowledge_base`

- **Purpose**: Knowledge base documents for agents
- **Public**: No
- **File Size Limit**: 50 MB
- **Allowed MIME Types**: `application/pdf`, `text/*`, `application/msword`, `application/vnd.*`

### 5. `workflow_assets`

- **Purpose**: Workflow-related files
- **Public**: No
- **File Size Limit**: 10 MB
- **Allowed MIME Types**: `image/*`, `application/json`

### 6. `audio`

- **Purpose**: Audio files for voice agents
- **Public**: No
- **File Size Limit**: 50 MB
- **Allowed MIME Types**: `audio/*`
- **Folders**:
  - `generated/` - AI-generated audio
  - `samples/` - Voice samples
  - `private/` - Private audio files

---

## Creating Buckets

### Option 1: Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (`plvxicajcpnnsxosmntd`)
3. Navigate to **Storage** → **New bucket**
4. For each bucket above:
   - Enter the bucket name
   - Set **Public** to OFF
   - Configure file size limit
   - Add allowed MIME types
   - Click **Create bucket**

### Option 2: Supabase API

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
);

// Create bucket
const { data, error } = await supabase.storage.createBucket('account_image', {
  public: false,
  fileSizeLimit: 5242880, // 5 MB in bytes
  allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
});
```

### Option 3: Supabase CLI

```bash
# Using Supabase CLI
supabase storage create account_image --public=false
```

---

## Storage Policies

Storage policies are automatically managed through RLS policies in your database.

### Policy Summary

| Bucket            | Access Level    | Requirements                                                  |
| ----------------- | --------------- | ------------------------------------------------------------- |
| `account_image`   | User-specific   | Can only access own images (via `auth.uid()`)                 |
| `agent_assets`    | Business-scoped | Team members can access their business's agent assets         |
| `campaign_assets` | Business-scoped | Team members can access their business's campaign assets      |
| `knowledge_base`  | Business-scoped | Team members can access their business's knowledge bases      |
| `workflow_assets` | Authenticated   | All authenticated users (business-scoped via app logic)       |
| `audio`           | Folder-based    | Access based on folder (`generated/`, `samples/`, `private/`) |

### Example Policies (Already in Production)

```sql
-- Account images: Users can only access their own
create policy "Users can access own images"
on storage.objects for select
to public
using (
  bucket_id = 'account_image'
  AND auth.uid()::text = split_part(name, '.', 1)
);

-- Agent assets: Business team members only
create policy "agent_assets"
on storage.objects for all
to public
using (
  bucket_id = 'agent_assets'
  AND (storage.foldername(name))[1] IN (
    SELECT a.id::text
    FROM agents a
    JOIN team_members tm ON a.business_id = tm.business_id
    WHERE tm.user_id = auth.uid()
    AND tm.status = 'active'
  )
);

-- Audio folders: Generated audio access
create policy "Give users access to generated folder read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'audio'
  AND (storage.foldername(name))[1] = 'generated'
  AND auth.role() = 'authenticated'
);
```

---

## Verification

### Check if Buckets Exist

**Via Dashboard:**

1. Go to Storage section
2. Verify all 6 buckets are listed

**Via SQL:**

```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY name;
```

**Expected Result:**

```
id                | name            | public | file_size_limit | allowed_mime_types
------------------|-----------------|--------|-----------------|-------------------
account_image     | account_image   | false  | 5242880        | {image/png,...}
agent_assets      | agent_assets    | false  | 10485760       | {image/*,...}
audio             | audio           | false  | 52428800       | {audio/*}
campaign_assets   | campaign_assets | false  | 10485760       | {image/*,...}
knowledge_base    | knowledge_base  | false  | 52428800       | {application/pdf,...}
workflow_assets   | workflow_assets | false  | 10485760       | {image/*,...}
```

### Check Policies

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('buckets', 'objects')
AND schemaname = 'storage'
ORDER BY tablename, policyname;
```

---

## Troubleshooting

### Bucket Not Found Error

**Error:** `Bucket not found`

**Solution:**

1. Check bucket exists in Dashboard
2. Verify bucket name matches exactly (case-sensitive)
3. Create bucket if missing

### Permission Denied

**Error:** `new row violates row-level security policy`

**Solution:**

1. Verify user is authenticated
2. Check if user is a team member of the business
3. Verify RLS policies are applied correctly

### Upload Fails - File Too Large

**Error:** `File size exceeds limit`

**Solution:**

1. Check bucket's `file_size_limit`
2. Increase limit in Dashboard if needed
3. Or compress/resize file before upload

### Upload Fails - Invalid MIME Type

**Error:** `File type not allowed`

**Solution:**

1. Check bucket's `allowed_mime_types`
2. Add missing MIME type to bucket configuration
3. Or convert file to allowed format

---

## Best Practices

### ✅ DO

- ✅ Create buckets via Dashboard for initial setup
- ✅ Use service role key for bucket creation
- ✅ Set appropriate file size limits
- ✅ Restrict MIME types to expected formats
- ✅ Keep buckets private (public = false)
- ✅ Use folder structure for organization (e.g., `audio/generated/`, `audio/samples/`)

### ❌ DON'T

- ❌ Create buckets via SQL migrations (will fail)
- ❌ Make buckets public unless absolutely necessary
- ❌ Allow unlimited file sizes
- ❌ Skip MIME type restrictions
- ❌ Forget to set up RLS policies

---

## Local Development

For local Supabase, buckets are **automatically created** from the seed data or you can create them via the local Studio:

1. Start local Supabase: `pnpm supabase:start`
2. Open Studio: http://127.0.0.1:54323
3. Go to Storage
4. Create buckets as needed

**Note:** Local buckets are reset when you run `supabase reset`.

---

## Production Setup Checklist

- [ ] All 6 buckets created in Supabase Dashboard
- [ ] File size limits configured
- [ ] MIME types restricted
- [ ] All buckets set to private
- [ ] RLS policies verified (check via SQL)
- [ ] Test upload/download from app
- [ ] Verify folder-based access (for `audio` bucket)

---

## References

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage RLS Policies](https://supabase.com/docs/guides/storage/security/access-control)
- [Storage Management API](https://supabase.com/docs/reference/javascript/storage-createbucket)
