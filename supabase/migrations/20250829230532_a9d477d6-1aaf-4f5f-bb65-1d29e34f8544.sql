-- Fix the emergency_operator_sessions status constraint
-- First, check what values are allowed in the constraint
-- We need to update the constraint to allow 'active' status

-- Drop the existing constraint
ALTER TABLE public.emergency_operator_sessions DROP CONSTRAINT IF EXISTS emergency_operator_sessions_status_check;

-- Add the updated constraint with proper status values
ALTER TABLE public.emergency_operator_sessions 
ADD CONSTRAINT emergency_operator_sessions_status_check 
CHECK (status IN ('active', 'inactive', 'break', 'unavailable', 'offline'));