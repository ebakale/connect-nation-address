-- Create table to store translation fixes
CREATE TABLE IF NOT EXISTS translation_fixes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  namespace TEXT NOT NULL,
  key TEXT NOT NULL,
  translation_en TEXT NOT NULL,
  translation_es TEXT NOT NULL,
  translation_fr TEXT NOT NULL,
  fixed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fixed_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'applied' CHECK (status IN ('pending', 'applied', 'rejected')),
  UNIQUE(namespace, key)
);

-- Enable RLS
ALTER TABLE translation_fixes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage translation fixes
CREATE POLICY "Admins can manage translation fixes"
  ON translation_fixes
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_translation_fixes_namespace_key ON translation_fixes(namespace, key);
CREATE INDEX IF NOT EXISTS idx_translation_fixes_status ON translation_fixes(status);