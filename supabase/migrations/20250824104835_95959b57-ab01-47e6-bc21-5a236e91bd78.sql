-- Add proper foreign key constraints
ALTER TABLE public.emergency_incident_logs 
ADD CONSTRAINT emergency_incident_logs_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.emergency_operator_sessions 
ADD CONSTRAINT emergency_operator_sessions_operator_id_fkey 
FOREIGN KEY (operator_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;