-- Fix incorrect UAC codes for incidents in Bata that show Malabo UACs
-- Update incidents that are in Bata, Litoral but have incorrect UAC codes

-- Fix INC-2024-000012 and similar incidents with wrong UAC
UPDATE public.emergency_incidents 
SET incident_uac = generate_unified_uac_unique(country, region, city, id)
WHERE (city = 'Bata' AND region = 'Litoral') 
  AND (incident_uac LIKE '%BN-MAL%' OR incident_uac LIKE '%MAL%')
  AND incident_uac NOT LIKE '%LI-BAT%';

-- Also fix any other geographical inconsistencies in incident UACs
UPDATE public.emergency_incidents 
SET incident_uac = generate_unified_uac_unique(country, region, city, id)
WHERE 
  -- Fix incidents where UAC doesn't match the actual city/region
  (city = 'Malabo' AND region = 'Bioko Norte' AND incident_uac NOT LIKE '%BN-MAL%') OR
  (city = 'Bata' AND region = 'Litoral' AND incident_uac NOT LIKE '%LI-BAT%') OR
  -- Fix any NULL or empty UACs
  (incident_uac IS NULL OR incident_uac = '');