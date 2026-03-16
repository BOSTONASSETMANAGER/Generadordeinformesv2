-- ============================================
-- Golden Templates: Feedback Learning System
-- Approved reports become reference templates
-- ============================================

-- Create golden_templates table
CREATE TABLE IF NOT EXISTS rb2.golden_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES rb2.reports(id) ON DELETE SET NULL,
  version_id UUID REFERENCES rb2.report_versions(id) ON DELETE SET NULL,
  ticker TEXT,
  category TEXT NOT NULL DEFAULT 'opciones_premium',
  html_content TEXT NOT NULL,
  html_hash TEXT NOT NULL,
  structural_fingerprint JSONB,
  quality_score FLOAT DEFAULT 1.0,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_golden_templates_user_id ON rb2.golden_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_golden_templates_ticker ON rb2.golden_templates(ticker);
CREATE INDEX IF NOT EXISTS idx_golden_templates_category ON rb2.golden_templates(category);
CREATE INDEX IF NOT EXISTS idx_golden_templates_hash ON rb2.golden_templates(html_hash);
CREATE INDEX IF NOT EXISTS idx_golden_templates_active ON rb2.golden_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_golden_templates_quality ON rb2.golden_templates(quality_score DESC) WHERE is_active = true;

-- RLS
ALTER TABLE rb2.golden_templates ENABLE ROW LEVEL SECURITY;

-- Policies: users can CRUD their own golden templates
CREATE POLICY "golden_select" ON rb2.golden_templates
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "golden_insert" ON rb2.golden_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "golden_update" ON rb2.golden_templates
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "golden_delete" ON rb2.golden_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON rb2.golden_templates TO anon, authenticated, service_role;
