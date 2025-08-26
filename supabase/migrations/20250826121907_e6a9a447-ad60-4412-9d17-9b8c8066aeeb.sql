-- Update incidents INC-2025-000022 and INC-2025-000023 to correct location (Bata) and regenerate UACs
UPDATE emergency_incidents 
SET 
  city = 'Bata',
  region = 'Litoral',
  incident_uac = 'GQ-LI-BAT-FB296E-KM'
WHERE incident_number = 'INC-2025-000022';

UPDATE emergency_incidents 
SET 
  city = 'Bata',
  region = 'Litoral', 
  incident_uac = 'GQ-LI-BAT-2F77C7-QS'
WHERE incident_number = 'INC-2025-000023';