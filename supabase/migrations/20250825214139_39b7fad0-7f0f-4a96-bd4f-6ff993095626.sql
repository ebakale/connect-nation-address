-- Add foreign key constraint properly
ALTER TABLE user_role_metadata 
ADD CONSTRAINT fk_user_role_metadata_user_role
FOREIGN KEY (user_role_id) REFERENCES user_roles(id) ON DELETE CASCADE;