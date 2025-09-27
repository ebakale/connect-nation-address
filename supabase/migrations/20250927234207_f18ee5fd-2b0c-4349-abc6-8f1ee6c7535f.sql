-- Fix address_requests RLS policies to ensure registrars can see all requests including orphaned ones

-- Drop and recreate the admin view policy to be more explicit
DROP POLICY IF EXISTS "Admins can view all requests" ON public.address_requests;

-- Create a more robust policy that explicitly handles registrars and orphaned requests
CREATE POLICY "Registrars and admins can view all requests" ON public.address_requests
FOR SELECT USING (
  -- Allow registrars, verifiers, and admins to see all requests
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role) OR 
  has_role(auth.uid(), 'verifier'::app_role) OR
  -- Allow users to see their own requests
  auth.uid() = requester_id
);

-- Also update the update policy to match
DROP POLICY IF EXISTS "Admins can update all requests" ON public.address_requests;

CREATE POLICY "Registrars and admins can update all requests" ON public.address_requests
FOR UPDATE USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role) OR 
  has_role(auth.uid(), 'verifier'::app_role)
);

-- Optional: Fix orphaned requests by assigning them to a system user
-- This creates a system placeholder for orphaned requests
DO $$
DECLARE
  system_user_id uuid;
BEGIN
  -- Try to find an existing admin user to assign orphaned requests to
  SELECT user_id INTO system_user_id 
  FROM public.user_roles 
  WHERE role = 'admin'::app_role 
  LIMIT 1;
  
  -- If we found an admin user, assign orphaned requests to them
  IF system_user_id IS NOT NULL THEN
    UPDATE public.address_requests 
    SET requester_id = system_user_id,
        justification = COALESCE(justification, '') || ' [System: Migrated orphaned request]'
    WHERE requester_id IS NULL;
  END IF;
END $$;