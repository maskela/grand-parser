-- ==================== GRAND PARSER DATABASE SETUP ====================
-- This script:
-- 1. Drops old tables (if they exist)
-- 2. Creates new tables for Grand Parser
-- 3. Sets up Row Level Security
-- Run this entire script in Supabase SQL Editor
-- =====================================================================

-- ==================== STEP 1: CLEANUP ====================
-- Drop existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS conversions CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS get_user_id_from_clerk(TEXT) CASCADE;

-- ==================== STEP 2: CREATE TABLES ====================

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  json_schema JSONB,
  message_template TEXT,
  level_of_details TEXT,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create results table
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL UNIQUE REFERENCES documents(id) ON DELETE CASCADE,
  extracted_json JSONB,
  generated_message TEXT,
  raw_text TEXT,
  confidence DECIMAL(5,4),
  warnings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================== STEP 3: CREATE INDEXES ====================

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_template_id ON documents(template_id);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_results_document_id ON results(document_id);
CREATE INDEX idx_templates_created_by ON templates(created_by);
CREATE INDEX idx_templates_is_public ON templates(is_public);

-- ==================== STEP 4: ENABLE ROW LEVEL SECURITY ====================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- ==================== STEP 5: CREATE RLS POLICIES ====================

-- RLS Policies for users table
CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update their own data"
  ON users FOR UPDATE
  USING (auth.uid()::text = clerk_id);

-- RLS Policies for templates table
CREATE POLICY "Users can view public templates or their own"
  ON templates FOR SELECT
  TO authenticated
  USING (
    is_public = true OR 
    created_by IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
  );

CREATE POLICY "Users can create templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (created_by IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can delete their own templates"
  ON templates FOR DELETE
  TO authenticated
  USING (
    created_by IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text)
    AND is_public = false
  );

-- RLS Policies for documents table
CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can update their own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

CREATE POLICY "Users can delete their own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE clerk_id = auth.uid()::text));

-- RLS Policies for results table
CREATE POLICY "Users can view results for their own documents"
  ON results FOR SELECT
  TO authenticated
  USING (document_id IN (
    SELECT d.id FROM documents d
    INNER JOIN users u ON d.user_id = u.id
    WHERE u.clerk_id = auth.uid()::text
  ));

CREATE POLICY "Service role can manage all results"
  ON results FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ==================== STEP 6: STORAGE BUCKET POLICIES ====================
-- NOTE: You must first create the 'documents' bucket in Supabase Storage UI
-- Go to Storage → New Bucket → Name: "documents" → Private: YES

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

-- ==================== DONE! ====================
-- You should see "Success. No rows returned"
-- 
-- FINAL STEPS:
-- 1. Go to Storage → Create bucket named "documents" (Private)
-- 2. Run this entire SQL script
-- 3. Verify tables at: http://localhost:7777/api/debug/db
-- 4. Test upload functionality

