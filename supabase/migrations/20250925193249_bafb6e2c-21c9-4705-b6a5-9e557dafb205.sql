-- Remove ndaa_admin role from Manuel Nguema, keeping only car_verifier
DELETE FROM user_roles 
WHERE user_id = '8f75072a-fa4e-4c78-8de2-cc5860596a26' 
AND role = 'ndaa_admin';