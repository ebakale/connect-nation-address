-- Data Validation Layer: Add comprehensive coordinate and format validation
ALTER TABLE addresses ADD CONSTRAINT valid_latitude 
CHECK (latitude BETWEEN -90 AND 90);

ALTER TABLE addresses ADD CONSTRAINT valid_longitude 
CHECK (longitude BETWEEN -180 AND 180);

-- Add address completeness scoring
ALTER TABLE addresses ADD COLUMN completeness_score NUMERIC DEFAULT 0;

-- Add format validation tracking
ALTER TABLE addresses ADD COLUMN format_validation JSONB DEFAULT '{}';

-- Add ISO compliance scoring
ALTER TABLE addresses ADD COLUMN iso_compliance_score NUMERIC DEFAULT 0;

-- Coverage Analytics: Create comprehensive coverage tracking
CREATE TABLE coverage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  total_buildings_estimated INTEGER DEFAULT 0,
  addresses_registered INTEGER DEFAULT 0,
  addresses_verified INTEGER DEFAULT 0,
  addresses_published INTEGER DEFAULT 0,
  coverage_percentage NUMERIC DEFAULT 0,
  verification_rate NUMERIC DEFAULT 0,
  publication_rate NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on coverage analytics
ALTER TABLE coverage_analytics ENABLE ROW LEVEL SECURITY;

-- Coverage analytics policies
CREATE POLICY "Staff can view coverage analytics" 
ON coverage_analytics 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'registrar') OR 
  has_role(auth.uid(), 'verifier')
);

CREATE POLICY "Admins and registrars can manage coverage analytics" 
ON coverage_analytics 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'registrar')
);

-- Address Audit Trail: Comprehensive audit logging
CREATE TABLE address_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address_id UUID REFERENCES addresses(id),
  action TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE address_audit_log ENABLE ROW LEVEL SECURITY;

-- Audit log policies
CREATE POLICY "Staff can view audit logs" 
ON address_audit_log 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'registrar') OR 
  has_role(auth.uid(), 'verifier')
);

CREATE POLICY "System can create audit logs" 
ON address_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Quality Metrics: Track data quality indicators
CREATE TABLE quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type TEXT NOT NULL, -- 'completeness', 'accuracy', 'duplication', 'coverage'
  region TEXT,
  city TEXT,
  metric_value NUMERIC NOT NULL,
  metric_details JSONB DEFAULT '{}',
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on quality metrics
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;

-- Quality metrics policies
CREATE POLICY "Staff can view quality metrics" 
ON quality_metrics 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'registrar') OR 
  has_role(auth.uid(), 'verifier')
);

CREATE POLICY "System can create quality metrics" 
ON quality_metrics 
FOR INSERT 
WITH CHECK (true);

-- Functions for coverage calculation
CREATE OR REPLACE FUNCTION calculate_coverage_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing analytics
  DELETE FROM coverage_analytics;
  
  -- Calculate coverage by region and city
  INSERT INTO coverage_analytics (
    region, 
    city, 
    addresses_registered, 
    addresses_verified, 
    addresses_published,
    verification_rate,
    publication_rate,
    coverage_percentage
  )
  SELECT 
    region,
    city,
    COUNT(*) as addresses_registered,
    COUNT(*) FILTER (WHERE verified = true) as addresses_verified,
    COUNT(*) FILTER (WHERE public = true) as addresses_published,
    ROUND(
      (COUNT(*) FILTER (WHERE verified = true)::numeric / NULLIF(COUNT(*), 0)) * 100, 2
    ) as verification_rate,
    ROUND(
      (COUNT(*) FILTER (WHERE public = true)::numeric / NULLIF(COUNT(*), 0)) * 100, 2
    ) as publication_rate,
    -- Coverage percentage would need external data for total buildings
    0 as coverage_percentage
  FROM addresses
  GROUP BY region, city;
  
  -- Update last_updated timestamp
  UPDATE coverage_analytics SET last_updated = NOW();
END;
$$;

-- Function to calculate address completeness score
CREATE OR REPLACE FUNCTION calculate_completeness_score(
  p_street TEXT,
  p_city TEXT,
  p_region TEXT,
  p_country TEXT,
  p_building TEXT,
  p_description TEXT,
  p_photo_url TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC
)
RETURNS NUMERIC
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  score NUMERIC := 0;
BEGIN
  -- Required fields (60 points total)
  IF p_street IS NOT NULL AND LENGTH(TRIM(p_street)) > 0 THEN score := score + 15; END IF;
  IF p_city IS NOT NULL AND LENGTH(TRIM(p_city)) > 0 THEN score := score + 15; END IF;
  IF p_region IS NOT NULL AND LENGTH(TRIM(p_region)) > 0 THEN score := score + 15; END IF;
  IF p_country IS NOT NULL AND LENGTH(TRIM(p_country)) > 0 THEN score := score + 15; END IF;
  
  -- Coordinates (20 points)
  IF p_latitude IS NOT NULL AND p_longitude IS NOT NULL THEN score := score + 20; END IF;
  
  -- Optional but valuable fields (20 points total)
  IF p_building IS NOT NULL AND LENGTH(TRIM(p_building)) > 0 THEN score := score + 5; END IF;
  IF p_description IS NOT NULL AND LENGTH(TRIM(p_description)) > 0 THEN score := score + 5; END IF;
  IF p_photo_url IS NOT NULL AND LENGTH(TRIM(p_photo_url)) > 0 THEN score := score + 10; END IF;
  
  RETURN score;
END;
$$;

-- Trigger to automatically calculate completeness score
CREATE OR REPLACE FUNCTION update_completeness_score()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.completeness_score := calculate_completeness_score(
    NEW.street,
    NEW.city,
    NEW.region,
    NEW.country,
    NEW.building,
    NEW.description,
    NEW.photo_url,
    NEW.latitude,
    NEW.longitude
  );
  RETURN NEW;
END;
$$;

-- Create trigger for completeness score
CREATE TRIGGER trigger_update_completeness_score
BEFORE INSERT OR UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION update_completeness_score();

-- Update existing addresses with completeness scores
UPDATE addresses SET completeness_score = calculate_completeness_score(
  street, city, region, country, building, description, photo_url, latitude, longitude
);