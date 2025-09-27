-- Fix get_review_queue function - use requester_id which exists in the table
CREATE OR REPLACE FUNCTION public.get_review_queue()
RETURNS TABLE (
  address_type text,
  building text,
  city text,
  country text,
  created_at timestamp with time zone,
  description text,
  flag_reason text,
  flagged boolean,
  flagged_at timestamp with time zone,
  flagged_by uuid,
  id uuid,
  justification text,
  latitude double precision,
  longitude double precision,
  photo_url text,
  public boolean,
  region text,
  requires_manual_review boolean,
  source_type text,
  status text,
  street text,
  uac text,
  updated_at timestamp with time zone,
  user_id uuid,
  verification_analysis jsonb,
  verification_recommendations text[],
  verified boolean
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    ar.address_type,
    ar.building,
    ar.city,
    ar.country,
    ar.created_at,
    ar.description,
    ar.flag_reason,
    COALESCE(ar.flagged, false) as flagged,
    ar.flagged_at,
    ar.flagged_by,
    ar.id,
    ar.justification,
    ar.latitude,
    ar.longitude,
    ar.photo_url,
    false as public, -- Address requests don't have public field
    ar.region,
    COALESCE(ar.requires_manual_review, false) as requires_manual_review,
    'request' as source_type,
    ar.status,
    ar.street,
    NULL::text as uac, -- Address requests don't have UAC yet
    ar.updated_at,
    ar.requester_id as user_id, -- Map requester_id to user_id for the interface
    ar.verification_analysis,
    ar.verification_recommendations,
    false as verified -- Address requests aren't verified yet
  FROM public.address_requests ar
  WHERE ar.status IN ('pending', 'flagged')
  ORDER BY ar.created_at DESC
$$;