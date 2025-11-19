# Supabase Setup Instructions

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the migration file `migrations/001_initial_schema.sql`

## Storage Setup

### Option 1: Quick Setup (Recommended)
Just create the bucket in the UI, then run `FULL_SETUP.sql` which includes storage policies:
1. Go to Storage in your Supabase dashboard
2. Click "New Bucket"
3. Name: `documents`
4. Make it **Private** (not public)
5. Create bucket
6. Then run the complete `FULL_SETUP.sql` in SQL Editor (includes storage policies)

### Option 2: Manual Setup
If you already ran database migrations, add storage policies separately:

1. Create bucket named `documents` (Private)
2. Run these policies in SQL Editor:

```sql
-- Policy for authenticated users to upload their own files
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for authenticated users to read their own files
CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for service role to access all files (for n8n)
CREATE POLICY "Service role can access all documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
```

**Note:** The `FULL_SETUP.sql` file now includes both database tables AND storage policies!

## Environment Variables

After setting up Supabase, you'll need the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (keep secret!)

