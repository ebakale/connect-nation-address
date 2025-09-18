-- Unit tests for address management functions
BEGIN;

SELECT plan(12);

-- Setup test data
INSERT INTO user_roles (id, user_id, role) VALUES 
    ('role1'::uuid, 'user1'::uuid, 'admin'::app_role),
    ('role2'::uuid, 'user2'::uuid, 'verifier'::app_role);

-- Test approve_address_request function
INSERT INTO address_requests (
    id, user_id, latitude, longitude, street, city, region, country,
    address_type, justification, status
) VALUES (
    'req1'::uuid, 'user1'::uuid, 3.7167, 8.7833, 'Test Street', 'Malabo', 'Bioko Norte',
    'Equatorial Guinea', 'residential', 'Test justification', 'pending'
);

-- Test successful approval
SELECT ok(
    approve_address_request('req1'::uuid, 'user1'::uuid) IS NOT NULL,
    'Should approve valid address request'
);

-- Verify address was created
SELECT ok(
    EXISTS(SELECT 1 FROM addresses WHERE street = 'Test Street' AND verified = true),
    'Approved request should create verified address'
);

-- Verify request status updated
SELECT is(
    (SELECT status FROM address_requests WHERE id = 'req1'::uuid),
    'approved',
    'Request status should be updated to approved'
);

-- Test reject_address_request_with_feedback function
INSERT INTO address_requests (
    id, user_id, latitude, longitude, street, city, region, country,
    address_type, justification, status
) VALUES (
    'req2'::uuid, 'user1'::uuid, 3.7167, 8.7833, 'Test Street 2', 'Malabo', 'Bioko Norte',
    'Equatorial Guinea', 'residential', 'Test justification 2', 'pending'
);

SELECT ok(
    reject_address_request_with_feedback('req2'::uuid, 'Invalid coordinates', 'Coordinates out of bounds', 'user2'::uuid),
    'Should reject address request with feedback'
);

-- Verify rejection details
SELECT is(
    (SELECT status FROM address_requests WHERE id = 'req2'::uuid),
    'rejected',
    'Request status should be updated to rejected'
);

SELECT is(
    (SELECT rejection_reason FROM address_requests WHERE id = 'req2'::uuid),
    'Invalid coordinates',
    'Rejection reason should be stored'
);

-- Test flag_address_for_review function
INSERT INTO addresses (
    id, user_id, latitude, longitude, street, city, region, country, 
    uac, verified, public
) VALUES (
    'addr1'::uuid, 'user1'::uuid, 3.7167, 8.7833, 'Flag Test Street', 'Malabo', 
    'Bioko Norte', 'Equatorial Guinea', 'GQ-BN-MAL-FLAG1-AB', true, true
);

SELECT ok(
    flag_address_for_review('addr1'::uuid, 'Quality concerns', 'user2'::uuid),
    'Should flag address for review'
);

-- Verify flagging effects
SELECT is(
    (SELECT flagged FROM addresses WHERE id = 'addr1'::uuid),
    true,
    'Address should be flagged'
);

SELECT is(
    (SELECT verified FROM addresses WHERE id = 'addr1'::uuid),
    false,
    'Flagged address should become unverified'
);

SELECT is(
    (SELECT public FROM addresses WHERE id = 'addr1'::uuid),
    false,
    'Flagged address should become private'
);

-- Test citizen address functions
INSERT INTO person (id, auth_user_id) VALUES 
    ('person1'::uuid, 'user1'::uuid);

-- Test set_primary_address function
SELECT ok(
    set_primary_address('person1'::uuid, 'BUILDING'::address_scope, 'GQ-BN-MAL-PRIMARY-AB') IS NOT NULL,
    'Should set primary address for person'
);

-- Verify primary address was set
SELECT is(
    (SELECT address_kind FROM citizen_address WHERE person_id = 'person1'::uuid AND effective_to IS NULL),
    'PRIMARY'::address_kind,
    'Should create primary address record'
);

-- Test add_secondary_address function
SELECT ok(
    add_secondary_address('person1'::uuid, 'UNIT'::address_scope, 'GQ-BN-MAL-SECOND-AB', 'UNIT001') IS NOT NULL,
    'Should add secondary address for person'
);

-- Cleanup
DELETE FROM citizen_address WHERE person_id = 'person1'::uuid;
DELETE FROM person WHERE id = 'person1'::uuid;
DELETE FROM addresses WHERE user_id IN ('user1'::uuid, 'user2'::uuid);
DELETE FROM address_requests WHERE user_id IN ('user1'::uuid, 'user2'::uuid);
DELETE FROM user_roles WHERE user_id IN ('user1'::uuid, 'user2'::uuid);

SELECT * FROM finish();
ROLLBACK;