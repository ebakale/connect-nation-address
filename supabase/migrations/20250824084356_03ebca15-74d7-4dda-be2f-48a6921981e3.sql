-- Insert a few incidents sourced from existing addresses (if any)
WITH addr AS (
  SELECT 
    id,
    uac,
    country,
    region,
    city,
    street,
    latitude,
    longitude
  FROM public.addresses
  WHERE verified = true
  ORDER BY created_at DESC
  LIMIT 3
), numbered AS (
  SELECT 
    *,
    ROW_NUMBER() OVER () AS rn
  FROM addr
)
INSERT INTO public.emergency_incidents (
  incident_number,
  emergency_type,
  priority_level,
  status,
  reported_at,
  encrypted_message,
  encrypted_contact_info,
  encrypted_address,
  encrypted_latitude,
  encrypted_longitude,
  location_accuracy,
  language_code,
  dispatcher_notes,
  assigned_units
)
SELECT 
  'INC-2024-' || LPAD((10 + rn)::text, 6, '0') AS incident_number,
  'police' AS emergency_type,
  CASE WHEN rn = 1 THEN 2 WHEN rn = 2 THEN 3 ELSE 4 END AS priority_level,
  'reported' AS status,
  now() - (rn || ' minutes')::interval AS reported_at,
  'Incident reported near address ' || uac AS encrypted_message,
  '+240666' || LPAD((100000 + rn)::text, 6, '0') AS encrypted_contact_info,
  street || ', ' || city || ', ' || region || ', ' || country AS encrypted_address,
  latitude::text AS encrypted_latitude,
  longitude::text AS encrypted_longitude,
  10.0 * rn AS location_accuracy,
  'es' AS language_code,
  'Auto-created from address' AS dispatcher_notes,
  ARRAY['POLICE-0' || rn::text] AS assigned_units
FROM numbered;