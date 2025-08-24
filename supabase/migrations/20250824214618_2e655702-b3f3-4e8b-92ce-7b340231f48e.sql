-- Create function to reassign invalid unit assignments to valid units
CREATE OR REPLACE FUNCTION reassign_invalid_units()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  incident_record RECORD;
  valid_units TEXT[];
  new_assignment TEXT[];
  unit_code TEXT;
BEGIN
  -- Get all valid unit codes
  SELECT ARRAY_AGG(unit_code) INTO valid_units
  FROM emergency_units;
  
  -- Process each incident with assigned units
  FOR incident_record IN 
    SELECT id, assigned_units, incident_number
    FROM emergency_incidents 
    WHERE assigned_units IS NOT NULL AND assigned_units != '{}'
  LOOP
    new_assignment := '{}';
    
    -- Check each assigned unit
    FOREACH unit_code IN ARRAY incident_record.assigned_units
    LOOP
      -- If unit code exists in valid units, keep it
      IF unit_code = ANY(valid_units) THEN
        new_assignment := array_append(new_assignment, unit_code);
      ELSE
        -- If invalid unit, replace with UNIT-001 (Alpha Patrol Unit) as default
        new_assignment := array_append(new_assignment, 'UNIT-001');
        
        -- Log the reassignment
        INSERT INTO emergency_incident_logs (
          incident_id,
          user_id,
          action,
          details
        ) VALUES (
          incident_record.id,
          'system',
          'unit_reassigned',
          jsonb_build_object(
            'old_unit', unit_code,
            'new_unit', 'UNIT-001',
            'reason', 'Invalid unit code - reassigned to default unit',
            'incident_number', incident_record.incident_number
          )
        );
      END IF;
    END LOOP;
    
    -- Update the incident with valid assignments
    UPDATE emergency_incidents 
    SET assigned_units = new_assignment,
        updated_at = now()
    WHERE id = incident_record.id;
  END LOOP;
END;
$$;

-- Execute the reassignment function
SELECT reassign_invalid_units();

-- Drop the function after use
DROP FUNCTION reassign_invalid_units();