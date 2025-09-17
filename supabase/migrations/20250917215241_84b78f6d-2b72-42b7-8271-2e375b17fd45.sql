-- Fix RLS policy for address_requests table to ensure citizens can create requests
-- Only use valid enum values for app_role

-- Drop the existing INSERT policy that might be problematic
DROP POLICY IF EXISTS "Users can create their own requests" ON public.address_requests;

-- Recreate the INSERT policy with simpler logic that just checks the user owns the record
CREATE POLICY "Users can create their own requests" 
ON public.address_requests 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Also ensure the SELECT policy works correctly
DROP POLICY IF EXISTS "Users can view their own requests" ON public.address_requests;

CREATE POLICY "Users can view their own requests" 
ON public.address_requests 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);