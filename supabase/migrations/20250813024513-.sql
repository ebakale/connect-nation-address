-- Fix the security definer view issue by dropping the problematic view
-- and creating a proper function instead

DROP VIEW IF EXISTS public.addresses_search;

-- Create a security definer function for safe address searching
CREATE OR REPLACE FUNCTION public.search_addresses_safely(search_query TEXT)
RETURNS TABLE (
  uac TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  street TEXT,
  building TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address_type TEXT,
  description TEXT,
  verified BOOLEAN,
  public BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    a.uac,
    a.country,
    a.region,
    a.city,
    a.street,
    a.building,
    -- Only show exact coordinates for public addresses, approximate for others
    CASE 
      WHEN a.public = true THEN a.latitude
      ELSE ROUND(a.latitude::numeric, 3)::decimal(10,8) -- Approximate to ~100m accuracy
    END as latitude,
    CASE 
      WHEN a.public = true THEN a.longitude  
      ELSE ROUND(a.longitude::numeric, 3)::decimal(11,8) -- Approximate to ~100m accuracy
    END as longitude,
    a.address_type,
    -- Only show description for public addresses
    CASE 
      WHEN a.public = true THEN a.description
      ELSE NULL
    END as description,
    a.verified,
    a.public,
    a.created_at
  FROM public.addresses a
  WHERE 
    a.verified = true 
    AND (
      a.uac ILIKE '%' || search_query || '%' OR
      a.street ILIKE '%' || search_query || '%' OR
      a.city ILIKE '%' || search_query || '%' OR
      a.building ILIKE '%' || search_query || '%'
    )
  ORDER BY a.created_at DESC
  LIMIT 50;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.search_addresses_safely(TEXT) TO authenticated, anon;