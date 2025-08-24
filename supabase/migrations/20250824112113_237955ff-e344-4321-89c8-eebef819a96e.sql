-- Allow police roles to read profiles for incident reporting context
-- Enable Row Level Security is already enabled on profiles; we add a SELECT policy for police roles

CREATE POLICY "Police staff can view profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'police_operator'::app_role)
  OR has_role(auth.uid(), 'police_supervisor'::app_role)
  OR has_role(auth.uid(), 'police_dispatcher'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);
