-- Fix verifier access to verification requests and ensure documents are viewable
-- The issue is that verifiers can't see verification requests, so they can't access documents

-- First, let's check if the current user roles are working properly by testing the view
-- and ensuring the authorized_verifiers table is properly populated

-- Add a policy to allow verifiers to see verification requests through authorized_verifiers table
DROP POLICY IF EXISTS "Authorized verifiers can view assigned verifications" ON public.residency_ownership_verifications;

CREATE POLICY "Authorized verifiers can view all verifications" 
ON public.residency_ownership_verifications 
FOR SELECT 
USING (
  -- Admin roles can see all
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'verifier'::app_role) OR 
  has_role(auth.uid(), 'registrar'::app_role) OR
  -- Authorized verifiers can see all (not just assigned ones)
  EXISTS (
    SELECT 1 FROM authorized_verifiers av 
    WHERE av.user_id = auth.uid() 
    AND av.is_active = true
    AND (av.expires_at IS NULL OR av.expires_at > now())
  )
);