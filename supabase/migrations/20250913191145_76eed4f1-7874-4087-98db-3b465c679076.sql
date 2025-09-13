-- Temporarily drop the constraint
ALTER TABLE emergency_operator_sessions 
DROP CONSTRAINT IF EXISTS emergency_operator_sessions_status_check;

-- Add the correct constraint that allows the status values used in the app
ALTER TABLE emergency_operator_sessions 
ADD CONSTRAINT emergency_operator_sessions_status_check 
CHECK (status IN ('active', 'break', 'offline', 'ended', 'inactive'));