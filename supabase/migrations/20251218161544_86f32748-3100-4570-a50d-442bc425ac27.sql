-- Step 1: Drop existing duplicate triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_person ON auth.users;

-- Step 2: Update handle_new_user function to create profile, person, and assign citizen role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Create profile record
  INSERT INTO public.profiles (
    user_id, 
    email, 
    full_name, 
    phone,
    national_id_type,
    national_id,
    date_of_birth,
    nationality,
    preferred_language
  )
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name',
      CONCAT(
        COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
        ' ',
        COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
      ),
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'national_id_type',
    NEW.raw_user_meta_data ->> 'national_id',
    (NEW.raw_user_meta_data ->> 'date_of_birth')::date,
    COALESCE(NEW.raw_user_meta_data ->> 'nationality', 'Equatorial Guinea'),
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'es')
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create person record for CAR
  INSERT INTO public.person (auth_user_id)
  VALUES (NEW.id)
  ON CONFLICT (auth_user_id) DO NOTHING;

  -- Assign default citizen role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'citizen')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Step 3: Create single trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Backfill orphan users - create missing profiles
INSERT INTO public.profiles (user_id, email, full_name)
SELECT 
  u.id,
  u.email,
  COALESCE(
    u.raw_user_meta_data ->> 'full_name',
    split_part(u.email, '@', 1)
  )
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Step 5: Backfill orphan users - create missing person records
INSERT INTO public.person (auth_user_id)
SELECT u.id
FROM auth.users u
LEFT JOIN public.person p ON p.auth_user_id = u.id
WHERE p.auth_user_id IS NULL;

-- Step 6: Backfill orphan users - assign citizen role to users without any role
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'citizen'::app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE ur.user_id IS NULL;