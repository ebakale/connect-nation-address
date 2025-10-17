-- Fix infinite recursion in household_groups RLS policies
DROP POLICY IF EXISTS "Household members can view their groups" ON public.household_groups;
DROP POLICY IF EXISTS "Household heads can view their groups" ON public.household_groups;

-- Recreate policies without recursion
CREATE POLICY "Household heads can view their groups"
ON public.household_groups
FOR SELECT
TO authenticated
USING (household_head_user_id = auth.uid());

CREATE POLICY "Household members can view their groups"
ON public.household_groups
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT hm.household_group_id
    FROM public.household_members hm
    WHERE hm.person_id IN (
      SELECT p.id 
      FROM public.person p 
      WHERE p.auth_user_id = auth.uid()
    )
  )
);

-- Fix person table RLS to allow citizens to create their own records
DROP POLICY IF EXISTS "Citizens can insert their own person record" ON public.person;

CREATE POLICY "Citizens can insert their own person record"
ON public.person
FOR INSERT
TO authenticated
WITH CHECK (auth_user_id = auth.uid() OR auth_user_id IS NULL);