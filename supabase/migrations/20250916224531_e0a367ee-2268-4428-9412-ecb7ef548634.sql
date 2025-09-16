-- Create backup metadata table for backup strategy
CREATE TABLE backup_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id TEXT NOT NULL UNIQUE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tables_included TEXT[] NOT NULL,
  record_counts JSONB DEFAULT '{}',
  size_bytes BIGINT DEFAULT 0,
  format TEXT DEFAULT 'json',
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on backup metadata
ALTER TABLE backup_metadata ENABLE ROW LEVEL SECURITY;

-- Backup metadata policies
CREATE POLICY "Admins can manage backup metadata" 
ON backup_metadata 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'registrar')
);