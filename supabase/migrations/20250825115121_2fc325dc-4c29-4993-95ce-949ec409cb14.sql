-- Fix security issue: Add proper search_path to the function
CREATE OR REPLACE FUNCTION check_unit_assignment_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
$$;