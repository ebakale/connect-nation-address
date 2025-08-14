-- Add additional role metadata table for geographic scopes and organizations
CREATE TABLE IF NOT EXISTS public.user_role_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role_id uuid REFERENCES public.user_roles(id) ON DELETE CASCADE,
  scope_type text NOT NULL CHECK (scope_type IN ('geographic', 'organization', 'partner_type')),
  scope_value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_role_id, scope_type, scope_value)
);

-- Enable RLS on the new table
ALTER TABLE public.user_role_metadata ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for role metadata
CREATE POLICY "Users can view their own role metadata"
ON public.user_role_metadata
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.id = user_role_id 
    AND ur.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all role metadata"
ON public.user_role_metadata
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ndaa_admin'::app_role));

CREATE POLICY "Admins can manage role metadata"
ON public.user_role_metadata
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ndaa_admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_user_role_metadata_updated_at
BEFORE UPDATE ON public.user_role_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check role with scope
CREATE OR REPLACE FUNCTION public.has_role_with_scope(
  _user_id uuid, 
  _role app_role, 
  _scope_type text DEFAULT NULL,
  _scope_value text DEFAULT NULL
)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    LEFT JOIN public.user_role_metadata urm ON ur.id = urm.user_role_id
    WHERE ur.user_id = _user_id
      AND ur.role = _role
      AND (
        _scope_type IS NULL 
        OR (urm.scope_type = _scope_type AND urm.scope_value = _scope_value)
      )
  )
$$;

-- Update default user role to 'citizen' instead of 'user'
UPDATE public.user_roles SET role = 'citizen'::app_role WHERE role = 'user'::app_role;