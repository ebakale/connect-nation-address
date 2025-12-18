-- Add missing jurisdiction columns to nar_authorities table
ALTER TABLE nar_authorities 
ADD COLUMN IF NOT EXISTS jurisdiction_region TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction_city TEXT;