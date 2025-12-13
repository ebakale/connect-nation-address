-- Assign admin role to manuelnguema81@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('8f75072a-fa4e-4c78-8de2-cc5860596a26', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;