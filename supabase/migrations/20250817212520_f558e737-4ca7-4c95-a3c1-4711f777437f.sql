-- Assign admin and ndaa_admin roles to eucario_bakale@yahoo.com
-- First, find the user_id for this email from auth.users
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- Get the user_id for the specified email
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'eucario_bakale@yahoo.com'
    LIMIT 1;
    
    -- If user exists, assign both admin and ndaa_admin roles
    IF target_user_id IS NOT NULL THEN
        -- Insert admin role if it doesn't exist
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Insert ndaa_admin role if it doesn't exist
        INSERT INTO public.user_roles (user_id, role)
        VALUES (target_user_id, 'ndaa_admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Assigned admin and ndaa_admin roles to user: %', target_user_id;
    ELSE
        RAISE NOTICE 'User with email eucario_bakale@yahoo.com not found in auth.users';
    END IF;
END $$;