-- Fix coordinate precision for exact UAC matches
-- If someone has the exact UAC, they should get exact coordinates for navigation

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
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    a.uac,
    a.country,
    a.region,
    a.city,
    a.street,
    a.building,
    -- If exact UAC match, always show exact coordinates (user was given the UAC intentionally)
    -- For partial matches in public addresses, show exact coordinates
    -- For partial matches in private addresses, show approximate coordinates
    CASE 
      WHEN UPPER(a.uac) = UPPER(search_query) THEN a.latitude  -- Exact UAC = exact coordinates
      WHEN a.public = true THEN a.latitude                     -- Public = exact coordinates
      ELSE ROUND(a.latitude::numeric, 3)::decimal(10,8)        -- Private partial match = approximate
    END as latitude,
    CASE 
      WHEN UPPER(a.uac) = UPPER(search_query) THEN a.longitude -- Exact UAC = exact coordinates
      WHEN a.public = true THEN a.longitude                    -- Public = exact coordinates  
      ELSE ROUND(a.longitude::numeric, 3)::decimal(11,8)       -- Private partial match = approximate
    END as longitude,
    a.address_type,
    -- Only show description for public addresses or exact UAC matches
    CASE 
      WHEN a.public = true OR UPPER(a.uac) = UPPER(search_query) THEN a.description
      ELSE NULL
    END as description,
    a.verified,
    a.public,
    a.created_at
  FROM public.addresses a
  WHERE 
    a.verified = true 
    AND (
      -- If searching by exact UAC, return both public and private addresses
      (UPPER(a.uac) = UPPER(search_query)) OR
      -- For other searches (street, city, building), only return public addresses
      (a.public = true AND (
        a.street ILIKE '%' || search_query || '%' OR
        a.city ILIKE '%' || search_query || '%' OR
        a.building ILIKE '%' || search_query || '%'
      ))
    )
  ORDER BY a.created_at DESC
  LIMIT 50;
$function$;