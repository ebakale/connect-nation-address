-- Fix RLS policy for address_requests table to ensure citizens can create requests

-- Drop the existing INSERT policy that might be problematic
DROP POLICY IF EXISTS "Users can create their own requests" ON public.address_requests;

-- Recreate the INSERT policy with explicit role checking
CREATE POLICY "Users can create their own requests" 
ON public.address_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = user_id 
  AND (
    has_role(auth.uid(), 'citizen'::app_role) OR
    has_role(auth.uid(), 'resident'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'verifier'::app_role) OR
    has_role(auth.uid(), 'registrar'::app_role)
  )
);

-- Also ensure the SELECT policy allows users to view their own requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.address_requests;

CREATE POLICY "Users can view their own requests" 
ON public.address_requests 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() = user_id 
  AND (
    has_role(auth.uid(), 'citizen'::app_role) OR
    has_role(auth.uid(), 'resident'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'verifier'::app_role) OR
    has_role(auth.uid(), 'registrar'::app_role)
  )
);