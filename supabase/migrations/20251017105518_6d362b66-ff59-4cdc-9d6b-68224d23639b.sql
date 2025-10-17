-- Create security definer function to check household membership without recursion
CREATE OR REPLACE FUNCTION public.is_household_member(_user_id uuid, _household_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.household_members hm
    JOIN public.person p ON hm.person_id = p.id
    WHERE p.auth_user_id = _user_id
      AND hm.household_group_id = _household_id
  )
$$;

-- Drop and recreate the problematic policy using the security definer function
DROP POLICY IF EXISTS "Household members can view their groups" ON public.household_groups;

CREATE POLICY "Household members can view their groups"
ON public.household_groups
FOR SELECT
TO authenticated
USING (public.is_household_member(auth.uid(), id));