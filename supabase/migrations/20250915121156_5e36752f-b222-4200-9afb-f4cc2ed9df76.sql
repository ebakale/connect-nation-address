-- Update get_review_queue to exclude rejected addresses
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
AS $function$
  -- Return only pending and flagged address requests for approval (exclude rejected)
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
  WHERE ar.status IN ('pending', 'flagged')
  ORDER BY ar.created_at DESC;
$function$;

-- Create new function to get rejected addresses
CREATE OR REPLACE FUNCTION public.get_rejected_addresses_queue()
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
  verification_recommendations text[],
  rejection_reason text,
  rejection_notes text,
  rejected_by uuid,
  rejected_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  -- Return rejected address requests
  SELECT 
    'rejected_request'::text as source_type,
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
    ar.verification_recommendations,
    ar.rejection_reason,
    ar.rejection_notes,
    ar.rejected_by,
    ar.rejected_at
  FROM public.address_requests ar
  WHERE ar.status = 'rejected'
  ORDER BY ar.rejected_at DESC;
$function$;