-- SECURITY FIX: Remove the policy that exposes private verified addresses to all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view regional verified addresses" ON public.addresses;

-- Keep only these secure policies:
-- 1. "Anyone can view public addresses" - for public=true addresses only
-- 2. "Users can view their own addresses" - users can see their own addresses
-- 3. "Admins can view all addresses" - admins have full access
-- 4. "Admins can manage all addresses" - admins can manage everything

-- The search_addresses_safely function already provides controlled access to verified addresses
-- with coordinate approximation for non-public addresses

-- Verify our remaining policies are secure
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'addresses' 
ORDER BY policyname;