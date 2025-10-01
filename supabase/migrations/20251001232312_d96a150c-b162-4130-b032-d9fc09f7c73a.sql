-- Remove hardcoded LIMIT 50 from search function so public portal can return all matches
CREATE OR REPLACE FUNCTION public.search_addresses_safely(search_query text)
RETURNS TABLE(
  uac text,
  country text,
  region text,
  city text,
  street text,
  building text,
  latitude numeric,
  longitude numeric,
  address_type text,
  description text,
  verified boolean,
  public boolean,
  created_at timestamp with time zone,
  completeness_score numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    a.uac,
    a.country,
    a.region,
    a.city,
    a.street,
    a.building,
    -- Exact UAC => exact coordinates; public => exact; private partial => approximate
    CASE 
      WHEN UPPER(a.uac) = UPPER(search_query) THEN a.latitude
      WHEN a.public = true THEN a.latitude
      ELSE ROUND(a.latitude::numeric, 3)::decimal(10,8)
    END as latitude,
    CASE 
      WHEN UPPER(a.uac) = UPPER(search_query) THEN a.longitude
      WHEN a.public = true THEN a.longitude
      ELSE ROUND(a.longitude::numeric, 3)::decimal(11,8)
    END as longitude,
    a.address_type,
    CASE 
      WHEN a.public = true OR UPPER(a.uac) = UPPER(search_query) THEN a.description
      ELSE NULL
    END as description,
    a.verified,
    a.public,
    a.created_at,
    a.completeness_score
  FROM addresses a
  WHERE 
    a.verified = true 
    AND (
      -- Exact UAC: return both public and private
      (UPPER(a.uac) = UPPER(search_query)) OR
      -- Otherwise only public addresses matching text fields
      (a.public = true AND (
        a.street ILIKE '%' || search_query || '%' OR
        a.city ILIKE '%' || search_query || '%' OR
        a.building ILIKE '%' || search_query || '%'
      ))
    )
  ORDER BY a.created_at DESC;
$function$;