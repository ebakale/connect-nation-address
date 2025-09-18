-- Fix security definer view issues
-- Step 3: Fix views to not use security definer

-- Drop the existing views
DROP VIEW IF EXISTS public.my_person;
DROP VIEW IF EXISTS public.current_citizen_addresses;

-- Recreate views without security definer (they'll use invoker's privileges)
CREATE VIEW public.my_person AS
SELECT * FROM public.person WHERE auth_user_id = auth.uid();

CREATE VIEW public.current_citizen_addresses AS
SELECT * FROM public.citizen_address WHERE effective_to IS NULL;