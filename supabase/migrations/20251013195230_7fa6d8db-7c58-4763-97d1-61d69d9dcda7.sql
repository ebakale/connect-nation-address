-- Add registrar role to Antonio Engonga (NAR Authority)
INSERT INTO user_roles (user_id, role)
VALUES ('e0e36700-8226-40c0-94b7-eac3f0857ec5', 'registrar')
ON CONFLICT (user_id, role) DO NOTHING;

-- Create a function to automatically assign registrar role when a NAR authority is created
CREATE OR REPLACE FUNCTION public.handle_nar_authority_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert registrar role for the user when they become a NAR authority
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'registrar')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign role when NAR authority is created
DROP TRIGGER IF EXISTS on_nar_authority_created ON public.nar_authorities;
CREATE TRIGGER on_nar_authority_created
  AFTER INSERT ON public.nar_authorities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_nar_authority_role();

-- Also assign registrar role to any existing NAR authorities who don't have it
INSERT INTO user_roles (user_id, role)
SELECT DISTINCT user_id, 'registrar'::app_role
FROM nar_authorities
WHERE is_active = true
ON CONFLICT (user_id, role) DO NOTHING;