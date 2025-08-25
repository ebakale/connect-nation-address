-- Unassign supervisor Marcos Angue from any emergency unit memberships
-- Using known user_id from profiles lookup to target precisely
DELETE FROM public.emergency_unit_members
WHERE officer_id = '7d6d03b0-665c-44ad-ba59-1d3703d9a50c';