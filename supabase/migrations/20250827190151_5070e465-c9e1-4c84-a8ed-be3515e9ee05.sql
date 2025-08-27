-- Remove police system roles from eucario_bakale@yahoo.com
DELETE FROM user_roles 
WHERE user_id = (SELECT user_id FROM profiles WHERE email = 'eucario_bakale@yahoo.com')
AND role IN ('police_admin', 'police_operator', 'police_supervisor', 'police_dispatcher');