-- Drop the problematic check constraint that's causing the error
ALTER TABLE public.emergency_operator_sessions DROP CONSTRAINT IF EXISTS emergency_operator_sessions_status_check;

-- Add a proper check constraint for the status field
ALTER TABLE public.emergency_operator_sessions 
ADD CONSTRAINT emergency_operator_sessions_status_check 
CHECK (status IN ('active', 'inactive', 'ended'));