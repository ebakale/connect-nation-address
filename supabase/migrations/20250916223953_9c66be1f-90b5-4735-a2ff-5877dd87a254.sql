-- Fix function search path security warnings by adding SET search_path = public

-- Fix calculate_coverage_analytics function
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

-- Fix calculate_completeness_score function
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
SET search_path = public
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

-- Fix update_completeness_score function
CREATE OR REPLACE FUNCTION update_completeness_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
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