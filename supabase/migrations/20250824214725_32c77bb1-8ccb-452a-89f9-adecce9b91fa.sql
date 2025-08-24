-- Fix incident unit assignments by reassigning invalid units to valid ones
WITH valid_units AS (
  SELECT unit_code FROM emergency_units
),
incidents_to_fix AS (
  SELECT 
    id, 
    incident_number,
    assigned_units,
    (
      SELECT ARRAY_AGG(
        CASE 
          WHEN unit_name = ANY(SELECT unit_code FROM valid_units) THEN unit_name
          ELSE 'UNIT-001'  -- Default to Alpha Patrol Unit
        END
      )
      FROM UNNEST(assigned_units) AS unit_name
    ) AS new_units
  FROM emergency_incidents 
  WHERE assigned_units IS NOT NULL 
    AND assigned_units != '{}'
    AND EXISTS (
      SELECT 1 FROM UNNEST(assigned_units) AS unit_name 
      WHERE unit_name NOT IN (SELECT unit_code FROM valid_units)
    )
)
UPDATE emergency_incidents 
SET 
  assigned_units = incidents_to_fix.new_units,
  updated_at = now()
FROM incidents_to_fix
WHERE emergency_incidents.id = incidents_to_fix.id;

-- Log the changes made
INSERT INTO emergency_incident_logs (incident_id, user_id, action, details)
SELECT 
  ei.id,
  'system',
  'unit_reassigned',
  jsonb_build_object(
    'old_units', ei.assigned_units,
    'new_units', ARRAY['UNIT-001'],
    'reason', 'Invalid unit codes replaced with default unit',
    'incident_number', ei.incident_number
  )
FROM emergency_incidents ei
WHERE ei.assigned_units IS NOT NULL 
  AND ei.assigned_units != '{}'
  AND EXISTS (
    SELECT 1 FROM UNNEST(ei.assigned_units) AS unit_name 
    WHERE unit_name NOT IN (SELECT unit_code FROM emergency_units)
  );