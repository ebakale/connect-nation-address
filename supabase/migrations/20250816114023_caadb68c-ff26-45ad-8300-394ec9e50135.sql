-- Update the app_role enum to include all system roles
DROP TYPE IF EXISTS public.app_role CASCADE;

CREATE TYPE public.app_role AS ENUM (
  'admin',
  'moderator', 
  'user',
  'citizen',
  'property_claimant',
  'field_agent',
  'verifier',
  'registrar',
  'ndaa_admin',
  'partner',
  'auditor',
  'data_steward',
  'support'
);

-- Recreate user_roles table with updated enum
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.user_role_metadata CASCADE;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create user role metadata table for scopes
CREATE TABLE public.user_role_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_role_id uuid REFERENCES public.user_roles(id) ON DELETE CASCADE,
  scope_type text NOT NULL,
  scope_value text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_role_with_scope(_user_id uuid, _role app_role, _scope_type text DEFAULT NULL, _scope_value text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_metadata ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own role"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own role"
ON public.user_roles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for user_role_metadata
CREATE POLICY "Users can view their own role metadata"
ON public.user_role_metadata FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.id = user_role_metadata.user_role_id 
  AND ur.user_id = auth.uid()
));

CREATE POLICY "Admins can view all role metadata"
ON public.user_role_metadata FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ndaa_admin'::app_role));

CREATE POLICY "Admins can manage role metadata"
ON public.user_role_metadata FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'ndaa_admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_user_role_metadata_updated_at
  BEFORE UPDATE ON public.user_role_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();