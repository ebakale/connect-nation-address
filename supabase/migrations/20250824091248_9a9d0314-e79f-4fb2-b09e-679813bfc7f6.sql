-- Insert additional sample incidents with valid status values and create more police units
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
) VALUES 
(
  'INC-2024-000015',
  'medical',
  1,
  'dispatched',
  now() - interval '45 minutes',
  'Medical emergency - chest pain',
  '+240666888999',
  'Hospital Nacional, Malabo',
  '3.7520',
  '8.7730',
  5.0,
  'es',
  'Ambulance dispatched, ETA 10 minutes',
  ARRAY['AMBULANCE-01', 'MEDICAL-01']
),
(
  'INC-2024-000016',
  'fire',
  2,
  'responding',
  now() - interval '20 minutes',
  'Structure fire reported at market',
  '+240666222444',
  'Mercado Central, Malabo',
  '3.7555',
  '8.7765',
  8.0,
  'fr',
  'Fire units responding, evacuating area',
  ARRAY['FIRE-01', 'FIRE-02', 'POLICE-03']
),
(
  'INC-2024-000017',
  'traffic',
  3,
  'reported',
  now() - interval '10 minutes',
  'Vehicle breakdown blocking lane',
  '+240666555777',
  'Avenida de la Independencia',
  '3.7545',
  '8.7755',
  12.0,
  'es',
  'Traffic unit requested for scene control',
  ARRAY['TRAFFIC-02', 'TOW-01']
),
(
  'INC-2024-000018',
  'police',
  2,
  'on_scene',
  now() - interval '30 minutes',
  'Domestic disturbance call',
  '+240666333555',
  'Barrio Ela Nguema',
  '3.7530',
  '8.7740',
  6.0,
  'es',
  'Units on scene, situation under control',
  ARRAY['POLICE-04', 'POLICE-05']
);

-- Update existing incidents to have better unit assignments
UPDATE public.emergency_incidents 
SET assigned_units = CASE 
  WHEN emergency_type = 'police' AND assigned_units IS NOT NULL THEN 
    CASE 
      WHEN incident_number LIKE '%004' THEN ARRAY['POLICE-01', 'POLICE-02']
      WHEN incident_number LIKE '%009' THEN ARRAY['POLICE-03', 'PATROL-01'] 
      WHEN incident_number LIKE '%006' THEN ARRAY['POLICE-04']
      ELSE ARRAY['POLICE-01']
    END
  WHEN emergency_type = 'traffic' THEN ARRAY['TRAFFIC-01', 'TRAFFIC-02']
  WHEN emergency_type = 'general' THEN ARRAY['PATROL-01', 'PATROL-02']
  ELSE assigned_units
END
WHERE assigned_units IS NOT NULL;