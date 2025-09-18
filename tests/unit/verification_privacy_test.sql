-- Unit tests for verification and privacy functions
BEGIN;

SELECT plan(10);

-- Setup test data
INSERT INTO user_roles (user_id, role) VALUES 
    ('verifier1'::uuid, 'verifier'::app_role),
    ('admin1'::uuid, 'admin'::app_role);

INSERT INTO address_requests (
    id, user_id, latitude, longitude, street, city, region, country,
    address_type, justification, status
) VALUES (
    'req_verify1'::uuid, 'user_verify1'::uuid, 3.7167, 8.7833, 'Verify Street', 'Malabo', 
    'Bioko Norte', 'Equatorial Guinea', 'residential', 'Verification test', 'pending'
);

-- Test initiate_residency_verification function
SELECT ok(
    initiate_residency_verification(
        'user_verify1'::uuid,
        'req_verify1'::uuid,
        'residency',
        'owner',
        'title_deed'::legal_document_type,
        'property_ownership',
        'address_registration'
    ) IS NOT NULL,
    'Should create residency verification request'
);

-- Verify verification was created
SELECT ok(
    EXISTS(
        SELECT 1 FROM residency_ownership_verifications 
        WHERE user_id = 'user_verify1'::uuid 
        AND verification_type = 'residency'
        AND status = 'pending'::verification_status
    ),
    'Verification request should be created with pending status'
);

-- Test record_privacy_consent function
SELECT ok(
    record_privacy_consent(
        'user_verify1'::uuid,
        (SELECT id FROM residency_ownership_verifications WHERE user_id = 'user_verify1'::uuid LIMIT 1),
        'data_processing',
        true,
        '{"consent_details": "full_consent"}'::jsonb,
        'user_consent'
    ) IS NOT NULL,
    'Should record privacy consent'
);

-- Verify consent was recorded
SELECT ok(
    EXISTS(
        SELECT 1 FROM privacy_consent_log 
        WHERE user_id = 'user_verify1'::uuid 
        AND consent_type = 'data_processing'
        AND consent_given = true
    ),
    'Privacy consent should be logged'
);

-- Test get_pending_verifications_count for verifier
SELECT ok(
    get_pending_verifications_count() >= 0,
    'Should return non-negative count of pending verifications'
);

-- Test has_role_with_scope function
INSERT INTO user_role_metadata (user_role_id, scope_type, scope_value) VALUES (
    (SELECT id FROM user_roles WHERE user_id = 'verifier1'::uuid LIMIT 1),
    'geographic',
    'Malabo'
);

SELECT is(
    has_role_with_scope('verifier1'::uuid, 'verifier'::app_role, 'geographic', 'Malabo'),
    true,
    'Should confirm scoped role access'
);

SELECT is(
    has_role_with_scope('verifier1'::uuid, 'verifier'::app_role, 'geographic', 'Bata'),
    false,
    'Should deny access to different scope'
);

-- Test authorized verifiers
INSERT INTO authorized_verifiers (
    user_id, authority_name, authority_type, verification_scope, is_active
) VALUES (
    'auth_verifier1'::uuid, 'Municipal Authority', 'government', 
    ARRAY['residency_verification'], true
);

SELECT ok(
    EXISTS(
        SELECT 1 FROM authorized_verifiers 
        WHERE user_id = 'auth_verifier1'::uuid 
        AND is_active = true
        AND 'residency_verification' = ANY(verification_scope)
    ),
    'Authorized verifier should be created'
);

-- Test debug_verification_access function
SELECT ok(
    (debug_verification_access())->>'user_id' IS NOT NULL,
    'Debug function should return user information'
);

-- Test coverage analytics calculation
SELECT ok(
    (SELECT calculate_coverage_analytics()) IS NULL,
    'Coverage analytics calculation should complete without error'
);

-- Cleanup
DELETE FROM authorized_verifiers WHERE user_id = 'auth_verifier1'::uuid;
DELETE FROM user_role_metadata WHERE user_role_id IN (
    SELECT id FROM user_roles WHERE user_id IN ('verifier1'::uuid, 'admin1'::uuid)
);
DELETE FROM privacy_consent_log WHERE user_id = 'user_verify1'::uuid;
DELETE FROM residency_ownership_verifications WHERE user_id = 'user_verify1'::uuid;
DELETE FROM address_requests WHERE user_id = 'user_verify1'::uuid;
DELETE FROM user_roles WHERE user_id IN ('verifier1'::uuid, 'admin1'::uuid);

SELECT * FROM finish();
ROLLBACK;