-- Create helper function to avoid recursion in policies
CREATE OR REPLACE FUNCTION public.get_user_household_group_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hm.household_group_id
  FROM public.household_members hm
  JOIN public.person p ON hm.person_id = p.id
  WHERE p.auth_user_id = _user_id
$$;

GRANT EXECUTE ON FUNCTION public.get_user_household_group_ids(uuid) TO PUBLIC;

-- Fix recursive policy on household_members
DROP POLICY IF EXISTS "Members can view their household" ON public.household_members;

CREATE POLICY "Members can view their household"
ON public.household_members
FOR SELECT
USING (
  (person_id IN (
    SELECT id FROM public.person WHERE auth_user_id = auth.uid()
  ))
  OR (
    household_group_id IN (
      SELECT public.get_user_household_group_ids(auth.uid())
    )
  )
);

-- Update citizen_address policy to use the helper function (prevents nested RLS chains)
DROP POLICY IF EXISTS "Household members can view group addresses" ON public.citizen_address;

CREATE POLICY "Household members can view group addresses"
ON public.citizen_address
FOR SELECT
USING (
  household_group_id IN (
    SELECT public.get_user_household_group_ids(auth.uid())
  )
);