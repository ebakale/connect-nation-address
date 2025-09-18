-- Test and fix verifier access to verification requests
-- Create a simple test function to verify the current user's access level

-- Test function to check current user's verification access
CREATE OR REPLACE FUNCTION public.debug_verification_access()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_id uuid;
  user_roles_data jsonb;
  authorized_verifier_data jsonb;
  verification_count integer;
  result jsonb;
BEGIN
  current_user_id := auth.uid();
  
  -- Get user roles
  SELECT jsonb_agg(role) INTO user_roles_data
  FROM user_roles 
  WHERE user_id = current_user_id;
  
  -- Get authorized verifier status
  SELECT jsonb_build_object(
    'is_active', av.is_active,
    'expires_at', av.expires_at,
    'verification_scope', av.verification_scope
  ) INTO authorized_verifier_data
  FROM authorized_verifiers av 
  WHERE av.user_id = current_user_id
  AND av.is_active = true
  LIMIT 1;
  
  -- Count verification requests the user can see
  SELECT COUNT(*) INTO verification_count
  FROM residency_ownership_verifications;
  
  result := jsonb_build_object(
    'user_id', current_user_id,
    'user_roles', COALESCE(user_roles_data, '[]'::jsonb),
    'authorized_verifier', COALESCE(authorized_verifier_data, 'null'::jsonb),
    'verification_count', verification_count,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$;