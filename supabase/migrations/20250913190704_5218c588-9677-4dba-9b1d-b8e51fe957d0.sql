-- First update existing 'inactive' status to 'offline' to match our app logic
UPDATE emergency_operator_sessions 
SET status = 'offline' 
WHERE status = 'inactive';

-- Now update the check constraint to allow the correct status values
ALTER TABLE emergency_operator_sessions 
DROP CONSTRAINT emergency_operator_sessions_status_check;

ALTER TABLE emergency_operator_sessions 
ADD CONSTRAINT emergency_operator_sessions_status_check 
CHECK (status IN ('active', 'break', 'offline'));