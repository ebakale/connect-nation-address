-- Migration: Consolidate residency_verifier into unified verifier role with verification_domain scope

-- Step 1: Add verification_domain scope to existing verifiers (default to NAR)
INSERT INTO user_role_metadata (user_role_id, scope_type, scope_value)
SELECT ur.id, 'verification_domain', 'nar'
FROM user_roles ur
WHERE ur.role = 'verifier'
  AND NOT EXISTS (
    SELECT 1 FROM user_role_metadata urm 
    WHERE urm.user_role_id = ur.id 
    AND urm.scope_type = 'verification_domain'
  )
ON CONFLICT DO NOTHING;

-- Step 2: Add verification_domain: 'car' scope to residency_verifier users before migration
INSERT INTO user_role_metadata (user_role_id, scope_type, scope_value)
SELECT ur.id, 'verification_domain', 'car'
FROM user_roles ur
WHERE ur.role = 'residency_verifier'
  AND NOT EXISTS (
    SELECT 1 FROM user_role_metadata urm 
    WHERE urm.user_role_id = ur.id 
    AND urm.scope_type = 'verification_domain'
  )
ON CONFLICT DO NOTHING;

-- Step 3: Migrate residency_verifier users to verifier role
UPDATE user_roles 
SET role = 'verifier'
WHERE role = 'residency_verifier';

-- Note: The residency_verifier enum value is kept in the database for backwards compatibility
-- It can be removed in a future migration once all code references are cleaned up