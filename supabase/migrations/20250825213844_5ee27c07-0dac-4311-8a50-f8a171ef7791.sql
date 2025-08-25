-- Add foreign key relationship between emergency_unit_members and profiles
-- This will allow proper joins in the query

-- First, let's ensure the profiles table has the proper structure
-- Add foreign key constraint from emergency_unit_members.officer_id to profiles.user_id
ALTER TABLE emergency_unit_members 
ADD CONSTRAINT fk_emergency_unit_members_officer_id 
FOREIGN KEY (officer_id) REFERENCES profiles(user_id) ON DELETE CASCADE;

-- Also add foreign key constraint from user_roles.user_id to profiles.user_id  
ALTER TABLE user_roles 
ADD CONSTRAINT fk_user_roles_user_id 
FOREIGN KEY (user_id) REFERENCES profiles(user_id) ON DELETE CASCADE;