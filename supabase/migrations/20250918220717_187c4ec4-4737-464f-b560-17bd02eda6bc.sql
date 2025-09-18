-- Fix the person table RLS policies and trigger to allow profile initialization

-- First, let's update the ensure_person_exists trigger function to be more robust
CREATE OR REPLACE FUNCTION public.ensure_person_exists()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert the person record, bypassing RLS since this is a system function
  INSERT INTO public.person (auth_user_id)
  VALUES (NEW.id)
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create person records
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_person_exists();

-- Add a policy to allow the system/trigger to create person records
DROP POLICY IF EXISTS "System can create person records" ON public.person;
CREATE POLICY "System can create person records" 
ON public.person 
FOR INSERT
WITH CHECK (true);

-- Also add a policy to allow users to create their own person record if needed
DROP POLICY IF EXISTS "Citizens can insert their own person record" ON public.person;
CREATE POLICY "Citizens can insert their own person record" 
ON public.person 
FOR INSERT
WITH CHECK (auth.uid() = auth_user_id);

-- Ensure any existing users who don't have person records get them created
INSERT INTO public.person (auth_user_id)
SELECT id 
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.person p WHERE p.auth_user_id = au.id
)
ON CONFLICT (auth_user_id) DO NOTHING;