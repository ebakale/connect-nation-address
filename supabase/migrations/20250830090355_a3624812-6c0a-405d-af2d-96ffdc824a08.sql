-- First, update any 'offline' status to 'inactive' to match our constraint
UPDATE public.emergency_operator_sessions 
SET status = 'inactive' 
WHERE status = 'offline';

-- Drop the problematic check constraint
ALTER TABLE public.emergency_operator_sessions DROP CONSTRAINT IF EXISTS emergency_operator_sessions_status_check;

-- Add the proper check constraint with the correct values
ALTER TABLE public.emergency_operator_sessions 
ADD CONSTRAINT emergency_operator_sessions_status_check 
CHECK (status IN ('active', 'inactive', 'ended'));