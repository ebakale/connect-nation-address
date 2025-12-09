-- Create the missing generate_uac function that wraps generate_unified_uac_unique
-- This function is called by approve_address_request with (country, region, city, latitude, longitude)

CREATE OR REPLACE FUNCTION public.generate_uac(
  p_country text,
  p_region text,
  p_city text,
  p_latitude numeric,
  p_longitude numeric
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delegate to the existing function, using a random UUID since the address_id is not available at this point
  RETURN public.generate_unified_uac_unique(p_country, p_region, p_city, gen_random_uuid());
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_uac(text, text, text, numeric, numeric) TO authenticated;

COMMENT ON FUNCTION public.generate_uac(text, text, text, numeric, numeric) IS 'Wrapper function for generate_unified_uac_unique that accepts latitude/longitude parameters for compatibility with approve_address_request';