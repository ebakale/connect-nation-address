-- Add constraint to prevent supervisors and dispatchers from being assigned to units
-- Only police operators should be assigned to emergency units

-- Create a function to check if a user has only police_operator role for unit assignment
CREATE OR REPLACE FUNCTION check_unit_assignment_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the officer being assigned has a police_operator role
  IF NOT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = NEW.officer_id 
    AND role = 'police_operator'::app_role
  ) THEN
    RAISE EXCEPTION 'Only police operators can be assigned to emergency units. Supervisors and dispatchers have system-wide access.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce this constraint
CREATE TRIGGER enforce_unit_assignment_role
  BEFORE INSERT OR UPDATE ON emergency_unit_members
  FOR EACH ROW
  EXECUTE FUNCTION check_unit_assignment_role();

-- Add a comment to document this business rule
COMMENT ON TRIGGER enforce_unit_assignment_role ON emergency_unit_members IS 
'Ensures only police operators can be assigned to emergency units. Supervisors and dispatchers have system-wide oversight and are not assigned to specific units.';