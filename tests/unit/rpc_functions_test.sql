-- Unit tests for RPC functions using pgTAP
-- Run with: SELECT * FROM runtests();

BEGIN;

-- Test calculate_completeness_score function
SELECT plan(8);

-- Test with all fields provided
SELECT is(
    calculate_completeness_score(
        'Main Street 123',
        'Malabo',
        'Bioko Norte',
        'Equatorial Guinea',
        'Building A',
        'Residential apartment',
        'https://example.com/photo.jpg',
        3.7167,
        8.7833
    ),
    100::numeric,
    'Complete address should score 100'
);

-- Test with minimal required fields only
SELECT is(
    calculate_completeness_score(
        'Main Street 123',
        'Malabo',
        'Bioko Norte',
        'Equatorial Guinea',
        NULL,
        NULL,
        NULL,
        3.7167,
        8.7833
    ),
    80::numeric,
    'Address with required fields and coordinates should score 80'
);

-- Test without coordinates
SELECT is(
    calculate_completeness_score(
        'Main Street 123',
        'Malabo',
        'Bioko Norte',
        'Equatorial Guinea',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL
    ),
    60::numeric,
    'Address without coordinates should score 60'
);

-- Test with empty street
SELECT is(
    calculate_completeness_score(
        '',
        'Malabo',
        'Bioko Norte',
        'Equatorial Guinea',
        NULL,
        NULL,
        NULL,
        3.7167,
        8.7833
    ),
    65::numeric,
    'Address with empty street should lose 15 points'
);

-- Test generate_unified_uac_unique function
SELECT like(
    generate_unified_uac_unique(
        'Equatorial Guinea',
        'Bioko Norte',
        'Malabo',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
    ),
    'GQ-BN-MAL-______-__',
    'UAC should follow correct format pattern'
);

-- Test has_role function
INSERT INTO user_roles (user_id, role) VALUES 
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'admin'::app_role);

SELECT is(
    has_role('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'admin'::app_role),
    true,
    'User should have admin role'
);

SELECT is(
    has_role('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'verifier'::app_role),
    false,
    'User should not have verifier role'
);

-- Test check_address_duplicates function
INSERT INTO addresses (
    id, user_id, latitude, longitude, street, city, region, country, uac, verified
) VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    3.7167,
    8.7833,
    'Test Street 123',
    'Malabo',
    'Bioko Norte',
    'Equatorial Guinea',
    'GQ-BN-MAL-123456-AB',
    true
);

SELECT ok(
    (check_address_duplicates(3.7167, 8.7833, 'Test Street 123', 'Malabo', 'Bioko Norte', 'Equatorial Guinea'))->>'has_duplicates' = 'true',
    'Should detect duplicate address'
);

-- Cleanup
DELETE FROM addresses WHERE id = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12'::uuid;
DELETE FROM user_roles WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;

SELECT * FROM finish();
ROLLBACK;