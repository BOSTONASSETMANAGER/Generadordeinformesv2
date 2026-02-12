-- ============================================
-- RB2 Schema: Report Builder v2
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create the schema
CREATE SCHEMA IF NOT EXISTS rb2;

-- 2. Grant usage to PostgREST roles
GRANT USAGE ON SCHEMA rb2 TO anon, authenticated, service_role;

-- 3. Tables

-- rb2.reports
CREATE TABLE IF NOT EXISTS rb2.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'opciones_premium',
  ticker TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'processing', 'ready', 'error', 'published')),
  current_version INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- rb2.report_sources
CREATE TABLE IF NOT EXISTS rb2.report_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES rb2.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_url TEXT,
  file_size BIGINT,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'ready'
    CHECK (status IN ('uploading', 'ready', 'processing', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- rb2.extractions
CREATE TABLE IF NOT EXISTS rb2.extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES rb2.reports(id) ON DELETE CASCADE,
  source_id UUID REFERENCES rb2.report_sources(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  extracted_json JSONB NOT NULL DEFAULT '{}',
  issues JSONB NOT NULL DEFAULT '[]',
  needs_review BOOLEAN NOT NULL DEFAULT false,
  validation_issues JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- rb2.report_versions
CREATE TABLE IF NOT EXISTS rb2.report_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES rb2.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  template_id UUID,
  html_content TEXT NOT NULL DEFAULT '',
  report_data JSONB,
  warnings JSONB DEFAULT '[]',
  meta JSONB DEFAULT '{}',
  change_log JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON rb2.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON rb2.reports(status);
CREATE INDEX IF NOT EXISTS idx_report_sources_report_id ON rb2.report_sources(report_id);
CREATE INDEX IF NOT EXISTS idx_extractions_report_id ON rb2.extractions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_versions_report_id ON rb2.report_versions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_versions_version ON rb2.report_versions(report_id, version_number);

-- 5. RLS Policies
ALTER TABLE rb2.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb2.report_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb2.extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb2.report_versions ENABLE ROW LEVEL SECURITY;

-- Reports: users can CRUD their own
CREATE POLICY "Users can view own reports" ON rb2.reports
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reports" ON rb2.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON rb2.reports
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON rb2.reports
  FOR DELETE USING (auth.uid() = user_id);

-- Report sources: users can CRUD their own
CREATE POLICY "Users can view own sources" ON rb2.report_sources
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sources" ON rb2.report_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sources" ON rb2.report_sources
  FOR DELETE USING (auth.uid() = user_id);

-- Extractions: users can CRUD their own
CREATE POLICY "Users can view own extractions" ON rb2.extractions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create extractions" ON rb2.extractions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Report versions: users can CRUD their own
CREATE POLICY "Users can view own versions" ON rb2.report_versions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create versions" ON rb2.report_versions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Grant table permissions to roles
GRANT ALL ON ALL TABLES IN SCHEMA rb2 TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA rb2 TO anon, authenticated, service_role;

-- 7. Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA rb2 GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA rb2 GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ============================================
-- IMPORTANT: After running this SQL, you must also:
-- 1. Go to Supabase Dashboard → Settings → API
-- 2. Add 'rb2' to "Exposed schemas"
-- 3. Save and wait for PostgREST to reload
-- ============================================
