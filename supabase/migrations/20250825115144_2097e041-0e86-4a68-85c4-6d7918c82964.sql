-- Remove the old trigger that auto-assigns all police roles to units
-- This is no longer appropriate since supervisors and dispatchers should not be assigned to units

DROP TRIGGER IF EXISTS auto_assign_police_to_unit ON user_roles;
DROP FUNCTION IF EXISTS assign_police_user_to_unit();