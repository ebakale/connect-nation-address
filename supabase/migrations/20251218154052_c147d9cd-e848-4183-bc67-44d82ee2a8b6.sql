-- Corrected backfill with fuzzy coordinate matching (within ~11 meters)
-- This fixes the previous backfill that used exact matching

UPDATE public.address_requests ar
SET approved_address_id = (
  SELECT a.id 
  FROM public.addresses a
  WHERE ar.requester_id = a.user_id
    AND (
      -- Fuzzy coordinate match (within ~11 meters)
      (ar.latitude IS NOT NULL AND a.latitude IS NOT NULL 
       AND ABS(ar.latitude - a.latitude) < 0.0001
       AND ABS(ar.longitude - a.longitude) < 0.0001)
      OR
      -- Fallback: exact street/city/region match when coordinates unavailable
      (ar.latitude IS NULL AND LOWER(ar.street) = LOWER(a.street) 
       AND LOWER(ar.city) = LOWER(a.city)
       AND LOWER(ar.region) = LOWER(a.region))
    )
    AND LOWER(ar.street) = LOWER(a.street)
    AND LOWER(ar.city) = LOWER(a.city)
  ORDER BY a.created_at DESC
  LIMIT 1
)
WHERE ar.status = 'approved'
  AND ar.approved_address_id IS NULL;