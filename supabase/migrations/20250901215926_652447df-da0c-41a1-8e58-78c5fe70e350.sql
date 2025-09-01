-- Fix coordinate mismatch for incident INC-2024-000009
-- This incident has Bata UAC but Malabo coordinates, should be Bata coordinates
UPDATE emergency_incidents 
SET 
  location_latitude = 1.86, 
  location_longitude = 9.76,
  location_address = 'Bata Government Building Area'
WHERE incident_number = 'INC-2024-000009' 
  AND id = '191b1332-94f6-4359-9424-16735388f776';