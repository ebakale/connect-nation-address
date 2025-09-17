-- Fix the calculate_coverage_analytics function to properly clear data
CREATE OR REPLACE FUNCTION public.calculate_coverage_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Clear existing analytics with proper WHERE clause
  DELETE FROM coverage_analytics WHERE region IS NOT NULL OR region IS NULL;
  
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
$function$;