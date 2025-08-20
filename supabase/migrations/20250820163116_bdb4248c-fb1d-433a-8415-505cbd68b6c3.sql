-- Add columns to store detailed verification analysis for flagged addresses
ALTER TABLE public.addresses
ADD COLUMN verification_analysis jsonb,
ADD COLUMN verification_recommendations text[];

ALTER TABLE public.address_requests  
ADD COLUMN verification_analysis jsonb,
ADD COLUMN verification_recommendations text[];

-- Drop and recreate the get_review_queue function with new columns
DROP FUNCTION IF EXISTS public.get_review_queue();

CREATE OR REPLACE FUNCTION public.get_review_queue()
RETURNS TABLE (
  source_type text,
  id uuid,
  user_id uuid,
  latitude numeric,
  longitude numeric,
  street text,
  city text,
  region text,
  country text,
  building text,
  address_type text,
  description text,
  photo_url text,
  status text,
  justification text,
  flagged boolean,
  flag_reason text,
  flagged_by uuid,
  flagged_at timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  uac text,
  verified boolean,
  public boolean,
  verification_analysis jsonb,
  verification_recommendations text[]
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Return pending address requests
  SELECT 
    'request'::text as source_type,
    ar.id,
    ar.user_id,
    ar.latitude,
    ar.longitude,
    ar.street,
    ar.city,
    ar.region,
    ar.country,
    ar.building,
    ar.address_type,
    ar.description,
    ar.photo_url,
    ar.status,
    ar.justification,
    ar.flagged,
    ar.flag_reason,
    ar.flagged_by,
    ar.flagged_at,
    ar.created_at,
    ar.updated_at,
    NULL::text as uac,
    NULL::boolean as verified,
    NULL::boolean as public,
    ar.verification_analysis,
    ar.verification_recommendations
  FROM public.address_requests ar
  WHERE ar.status = 'pending'
  
  UNION ALL
  
  -- Return flagged addresses  
  SELECT 
    'flagged_address'::text as source_type,
    a.id,
    a.user_id,
    a.latitude,
    a.longitude,
    a.street,
    a.city,
    a.region,
    a.country,
    a.building,
    a.address_type,
    a.description,
    a.photo_url,
    'flagged'::text as status,
    ('Flagged for re-review: ' || COALESCE(a.flag_reason, 'No reason provided'))::text as justification,
    a.flagged,
    a.flag_reason,
    a.flagged_by,
    a.flagged_at,
    a.created_at,
    a.updated_at,
    a.uac,
    a.verified,
    a.public,
    a.verification_analysis,
    a.verification_recommendations
  FROM public.addresses a
  WHERE a.flagged = true
  
  ORDER BY created_at DESC;
$function$;

-- Update the flag_address_for_review function to include analysis data
CREATE OR REPLACE FUNCTION public.flag_address_for_review(
  p_address_id uuid,
  p_reason text,
  p_analysis jsonb DEFAULT NULL,
  p_recommendations text[] DEFAULT NULL,
  p_flagged_by uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  address_record addresses%ROWTYPE;
BEGIN
  -- Get the address details
  SELECT * INTO address_record 
  FROM public.addresses 
  WHERE id = p_address_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Create a new address request for re-review with analysis data
  INSERT INTO public.address_requests (
    user_id,
    latitude,
    longitude,
    street,
    city,
    region,
    country,
    building,
    address_type,
    description,
    photo_url,
    status,
    justification,
    flagged,
    flag_reason,
    flagged_by,
    flagged_at,
    verification_analysis,
    verification_recommendations
  ) VALUES (
    address_record.user_id,
    address_record.latitude,
    address_record.longitude,
    address_record.street,
    address_record.city,
    address_record.region,
    address_record.country,
    address_record.building,
    address_record.address_type,
    address_record.description,
    address_record.photo_url,
    'pending',
    'Re-review required: ' || p_reason,
    true,
    p_reason,
    p_flagged_by,
    now(),
    p_analysis,
    p_recommendations
  );
  
  -- Update the original address with flag info and analysis
  UPDATE public.addresses 
  SET 
    flagged = true,
    flag_reason = p_reason,
    flagged_by = p_flagged_by,
    flagged_at = now(),
    verified = false,
    public = false,
    verification_analysis = p_analysis,
    verification_recommendations = p_recommendations
  WHERE id = p_address_id;
  
  RETURN TRUE;
END;
$function$;