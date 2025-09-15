-- Fix the check_address_duplicates function to work without PostGIS geography
CREATE OR REPLACE FUNCTION public.check_address_duplicates(
  p_latitude numeric, 
  p_longitude numeric, 
  p_street text, 
  p_city text, 
  p_region text, 
  p_country text, 
  p_exclude_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  coordinate_duplicate_count integer := 0;
  address_duplicate_count integer := 0;
  coordinate_tolerance numeric := 0.001; -- ~111 meters tolerance
  duplicate_results jsonb := '{}';
  coordinate_duplicates jsonb := '[]';
  address_duplicates jsonb := '[]';
BEGIN
  -- Check for coordinate duplicates (within tolerance using simple distance)
  SELECT 
    COUNT(*),
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'uac', uac,
        'street', street,
        'verified', verified,
        'public', public,
        'distance_approximate', SQRT(
          POWER((longitude - p_longitude) * 111320 * COS(RADIANS(p_latitude)), 2) +
          POWER((latitude - p_latitude) * 110540, 2)
        )
      )
    ), '[]'::jsonb)
  INTO coordinate_duplicate_count, coordinate_duplicates
  FROM public.addresses
  WHERE 
    ABS(latitude - p_latitude) < coordinate_tolerance
    AND ABS(longitude - p_longitude) < coordinate_tolerance
    AND (p_exclude_id IS NULL OR id != p_exclude_id);

  -- Check for exact address duplicates
  SELECT 
    COUNT(*),
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', id,
        'uac', uac,
        'latitude', latitude,
        'longitude', longitude,
        'verified', verified,
        'public', public
      )
    ), '[]'::jsonb)
  INTO address_duplicate_count, address_duplicates
  FROM public.addresses
  WHERE 
    LOWER(TRIM(street)) = LOWER(TRIM(p_street))
    AND LOWER(TRIM(city)) = LOWER(TRIM(p_city))
    AND LOWER(TRIM(region)) = LOWER(TRIM(p_region))
    AND LOWER(TRIM(country)) = LOWER(TRIM(p_country))
    AND (p_exclude_id IS NULL OR id != p_exclude_id);

  -- Build result object
  duplicate_results := jsonb_build_object(
    'has_duplicates', (coordinate_duplicate_count > 0 OR address_duplicate_count > 0),
    'coordinate_duplicates', jsonb_build_object(
      'count', coordinate_duplicate_count,
      'matches', coordinate_duplicates
    ),
    'address_duplicates', jsonb_build_object(
      'count', address_duplicate_count,
      'matches', address_duplicates
    ),
    'summary', jsonb_build_object(
      'total_duplicates', coordinate_duplicate_count + address_duplicate_count,
      'coordinate_matches', coordinate_duplicate_count,
      'address_matches', address_duplicate_count
    )
  );

  RETURN duplicate_results;
END;
$function$;