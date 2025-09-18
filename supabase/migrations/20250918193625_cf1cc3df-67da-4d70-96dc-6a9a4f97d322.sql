-- Replace get_review_queue to remove bad aliasing and align with client expectations
CREATE OR REPLACE FUNCTION public.get_review_queue()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  latitude double precision,
  longitude double precision,
  street text,
  city text,
  region text,
  country text,
  building text,
  address_type text,
  description text,
  justification text,
  photo_url text,
  status text,
  flagged boolean,
  flag_reason text,
  flagged_by uuid,
  flagged_at timestamptz,
  requires_manual_review boolean,
  verification_analysis jsonb,
  verification_recommendations text[],
  verified boolean,
  public boolean,
  uac text,
  source_type text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT
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
    ar.justification,
    ar.photo_url,
    ar.status,
    ar.flagged,
    ar.flag_reason,
    ar.flagged_by,
    ar.flagged_at,
    coalesce(ar.requires_manual_review, false) as requires_manual_review,
    ar.verification_analysis,
    ar.verification_recommendations,
    coalesce(ar.verified,false) as verified,
    coalesce(ar.public,false) as public,
    ar.uac,
    ar.source_type,
    ar.created_at,
    ar.updated_at
  FROM public.address_requests ar
  WHERE ar.status <> 'rejected'
  ORDER BY ar.created_at DESC
$$;

-- Recreate get_rejected_addresses_queue without SECURITY DEFINER and with explicit search_path
CREATE OR REPLACE FUNCTION public.get_rejected_addresses_queue()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  latitude double precision,
  longitude double precision,
  street text,
  city text,
  region text,
  country text,
  building text,
  address_type text,
  description text,
  justification text,
  rejection_reason text,
  rejection_notes text,
  rejected_by uuid,
  rejected_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
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
    ar.justification,
    ar.rejection_reason,
    ar.rejection_notes,
    ar.rejected_by,
    ar.rejected_at,
    ar.created_at
  FROM public.address_requests ar
  WHERE ar.status = 'rejected'
  ORDER BY ar.rejected_at DESC NULLS LAST
$$;