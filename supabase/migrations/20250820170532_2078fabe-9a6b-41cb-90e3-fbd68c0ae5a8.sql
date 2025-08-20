-- Create function to approve address request and create address
CREATE OR REPLACE FUNCTION public.approve_address_request(
  p_request_id uuid,
  p_approved_by uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  request_record address_requests%ROWTYPE;
  new_address_id uuid;
  generated_uac text;
BEGIN
  -- Get the address request details
  SELECT * INTO request_record 
  FROM public.address_requests 
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address request not found or not pending';
  END IF;
  
  -- Generate UAC for the new address
  generated_uac := generate_unified_uac_unique(
    request_record.country,
    request_record.region, 
    request_record.city,
    request_record.id
  );
  
  -- Create the address
  INSERT INTO public.addresses (
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
    uac,
    verified,
    public,
    verification_analysis,
    verification_recommendations
  ) VALUES (
    request_record.user_id,
    request_record.latitude,
    request_record.longitude,
    request_record.street,
    request_record.city,
    request_record.region,
    request_record.country,
    request_record.building,
    request_record.address_type,
    request_record.description,
    request_record.photo_url,
    generated_uac,
    true,  -- Approved addresses are verified
    false, -- Initially private, can be made public later
    request_record.verification_analysis,
    request_record.verification_recommendations
  ) RETURNING id INTO new_address_id;
  
  -- Update the request status to approved
  UPDATE public.address_requests 
  SET 
    status = 'approved',
    reviewed_by = p_approved_by,
    reviewed_at = now()
  WHERE id = p_request_id;
  
  RETURN new_address_id;
END;
$$;

-- Update get_review_queue to only return pending requests (not flagged addresses)
CREATE OR REPLACE FUNCTION public.get_review_queue()
RETURNS TABLE(
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Return only pending address requests for approval
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
  ORDER BY ar.created_at DESC;
$$;

-- Create function to get flagged addresses for re-review
CREATE OR REPLACE FUNCTION public.get_flagged_addresses_queue()
RETURNS TABLE(
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
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  -- Return flagged addresses for re-review
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
  ORDER BY a.flagged_at DESC;
$$;