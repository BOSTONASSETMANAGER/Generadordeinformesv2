-- ============================================
-- STEP 1: Run this first to check what exists
-- ============================================
-- Check if rb2 schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'rb2';

-- Check if tables exist
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_schema = 'rb2';

-- Check columns of rb2.reports (if it exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'rb2' AND table_name = 'reports';

-- ============================================
-- STEP 2: If tables are missing or incomplete,
-- DROP and recreate everything cleanly
-- ============================================

-- Drop existing tables (cascade to remove dependencies)
DROP TABLE IF EXISTS rb2.report_versions CASCADE;
DROP TABLE IF EXISTS rb2.extractions CASCADE;
DROP TABLE IF EXISTS rb2.report_sources CASCADE;
DROP TABLE IF EXISTS rb2.reports CASCADE;

-- Drop and recreate schema
DROP SCHEMA IF EXISTS rb2 CASCADE;
CREATE SCHEMA rb2;

-- Grant usage
GRANT USAGE ON SCHEMA rb2 TO anon, authenticated, service_role;

-- Create reports table
CREATE TABLE rb2.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'opciones_premium',
  ticker TEXT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  current_version INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create report_sources table
CREATE TABLE rb2.report_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES rb2.reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'pdf',
  file_url TEXT,
  file_size BIGINT,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create extractions table
CREATE TABLE rb2.extractions (
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

-- Create report_versions table
CREATE TABLE rb2.report_versions (
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

-- Indexes
CREATE INDEX idx_reports_user_id ON rb2.reports(user_id);
CREATE INDEX idx_reports_status ON rb2.reports(status);
CREATE INDEX idx_report_sources_report_id ON rb2.report_sources(report_id);
CREATE INDEX idx_extractions_report_id ON rb2.extractions(report_id);
CREATE INDEX idx_report_versions_report_id ON rb2.report_versions(report_id);

-- RLS
ALTER TABLE rb2.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb2.report_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb2.extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rb2.report_versions ENABLE ROW LEVEL SECURITY;

-- Policies for reports
CREATE POLICY "reports_select" ON rb2.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "reports_insert" ON rb2.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reports_update" ON rb2.reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "reports_delete" ON rb2.reports FOR DELETE USING (auth.uid() = user_id);

-- Policies for report_sources
CREATE POLICY "sources_select" ON rb2.report_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sources_insert" ON rb2.report_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sources_delete" ON rb2.report_sources FOR DELETE USING (auth.uid() = user_id);

-- Policies for extractions
CREATE POLICY "extractions_select" ON rb2.extractions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "extractions_insert" ON rb2.extractions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for report_versions
CREATE POLICY "versions_select" ON rb2.report_versions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "versions_insert" ON rb2.report_versions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA rb2 TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA rb2 TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA rb2 GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA rb2 GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

-- ============================================
-- STEP 3: Verify the fix
-- ============================================
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'rb2' AND table_name = 'reports'
ORDER BY ordinal_position;

-- ============================================
-- STEP 4: Create storage bucket (run separately)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('report-sources', 'report-sources', true)
-- ON CONFLICT (id) DO NOTHING;
