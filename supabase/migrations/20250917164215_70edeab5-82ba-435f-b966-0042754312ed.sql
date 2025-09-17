-- Remove the policy that allows regular users to create addresses directly
-- This forces regular users to go through the address request workflow
-- while still allowing staff to create pre-verified addresses

DROP POLICY "Users can create their own addresses" ON public.addresses;

-- Also remove the policy that allows users to update their own addresses
-- since they shouldn't be creating them directly anymore
DROP POLICY "Users can update their own addresses" ON public.addresses;

-- Keep the staff policies for address management:
-- - "Staff can create addresses for users" (admin, verifier, registrar)
-- - "Staff can update addresses" (admin, verifier, registrar)
-- - "Staff can view all addresses" (admin, verifier, registrar)

-- Users can still view their own addresses and delete them if needed
-- The delete policy remains: "Users can delete their own addresses"