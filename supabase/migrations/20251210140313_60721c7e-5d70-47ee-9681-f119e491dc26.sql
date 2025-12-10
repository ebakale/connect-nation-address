-- Add verification_domain metadata for existing verifier user (larocheservice@gmail.com)
INSERT INTO user_role_metadata (user_role_id, scope_type, scope_value)
VALUES ('b8af8700-2fdc-4384-8ad5-2a8959e7a204', 'verification_domain', 'both')
ON CONFLICT DO NOTHING;