-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS national_id_type text CHECK (national_id_type IN ('id_card', 'passport')),
ADD COLUMN IF NOT EXISTS national_id text,
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS nationality text DEFAULT 'Equatorial Guinea',
ADD COLUMN IF NOT EXISTS preferred_language text DEFAULT 'es';

-- Add unique constraint on national_id (only when not null)
CREATE UNIQUE INDEX IF NOT EXISTS unique_national_id 
ON public.profiles (national_id) 
WHERE national_id IS NOT NULL;

-- Update handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
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
  );
  RETURN NEW;
END;
$$;