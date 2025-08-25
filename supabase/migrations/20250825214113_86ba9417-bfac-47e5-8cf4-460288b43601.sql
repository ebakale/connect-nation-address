-- Ensure relationship for nested metadata selection
ALTER TABLE user_role_metadata 
ADD CONSTRAINT IF NOT EXISTS fk_user_role_metadata_user_role
FOREIGN KEY (user_role_id) REFERENCES user_roles(id) ON DELETE CASCADE;

-- Create an index to speed up lookups
CREATE INDEX IF NOT EXISTS idx_user_role_metadata_user_role_id ON user_role_metadata(user_role_id);