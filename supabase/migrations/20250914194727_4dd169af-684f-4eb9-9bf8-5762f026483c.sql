-- Fix the search_addresses_safely function to only return public addresses in search results
-- Private addresses should not appear in general search results

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
    a.latitude,
    a.longitude,
    a.address_type,
    a.description,
    a.verified,
    a.public,
    a.created_at
  FROM public.addresses a
  WHERE 
    a.verified = true 
    AND a.public = true  -- Only return public addresses in search results
    AND (
      a.uac ILIKE '%' || search_query || '%' OR
      a.street ILIKE '%' || search_query || '%' OR
      a.city ILIKE '%' || search_query || '%' OR
      a.building ILIKE '%' || search_query || '%'
    )
  ORDER BY a.created_at DESC
  LIMIT 50;
$function$;