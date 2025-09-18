-- Fix the get_rejected_addresses_queue function to use requester_id
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
  rejected_at timestamp with time zone,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT 
    ar.id,
    ar.requester_id as user_id, -- Use requester_id as user_id for consistency
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