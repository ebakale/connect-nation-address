-- Add unique constraint to coverage_analytics table and populate data

-- First add the unique constraint
ALTER TABLE coverage_analytics ADD CONSTRAINT coverage_analytics_region_city_unique UNIQUE (region, city);

-- Now populate the coverage_analytics table with actual data
INSERT INTO coverage_analytics (
  region, 
  city, 
  addresses_registered, 
  addresses_verified, 
  addresses_published,
  verification_rate,
  publication_rate,
  coverage_percentage,
  last_updated
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
  0 as coverage_percentage,
  NOW() as last_updated
FROM addresses
WHERE region IS NOT NULL AND city IS NOT NULL
GROUP BY region, city;

-- Update the calculate_coverage_analytics function to be safer
CREATE OR REPLACE FUNCTION public.calculate_coverage_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use INSERT ... ON CONFLICT instead of DELETE + INSERT for better safety
  INSERT INTO coverage_analytics (
    region, 
    city, 
    addresses_registered, 
    addresses_verified, 
    addresses_published,
    verification_rate,
    publication_rate,
    coverage_percentage,
    last_updated
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
    0 as coverage_percentage,
    NOW() as last_updated
  FROM addresses
  WHERE region IS NOT NULL AND city IS NOT NULL
  GROUP BY region, city
  ON CONFLICT (region, city) DO UPDATE SET
    addresses_registered = EXCLUDED.addresses_registered,
    addresses_verified = EXCLUDED.addresses_verified,
    addresses_published = EXCLUDED.addresses_published,
    verification_rate = EXCLUDED.verification_rate,
    publication_rate = EXCLUDED.publication_rate,
    last_updated = EXCLUDED.last_updated;
END;
$$;