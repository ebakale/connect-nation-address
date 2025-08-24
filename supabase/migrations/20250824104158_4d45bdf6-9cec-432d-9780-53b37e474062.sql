-- Add test officers to emergency units
-- First, let's add some test officers if they don't exist
INSERT INTO public.profiles (user_id, full_name, email) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Officer John Smith', 'john.smith@police.gov'),
  ('22222222-2222-2222-2222-222222222222', 'Officer Maria Garcia', 'maria.garcia@police.gov'),
  ('33333333-3333-3333-3333-333333333333', 'Sergeant Carlos Rodriguez', 'carlos.rodriguez@police.gov'),
  ('44444444-4444-4444-4444-444444444444', 'Officer Lisa Johnson', 'lisa.johnson@police.gov'),
  ('55555555-5555-5555-5555-555555555555', 'Detective Mike Brown', 'mike.brown@police.gov'),
  ('66666666-6666-6666-6666-666666666666', 'Officer Sarah Davis', 'sarah.davis@police.gov'),
  ('77777777-7777-7777-7777-777777777777', 'Captain James Wilson', 'james.wilson@police.gov'),
  ('88888888-8888-8888-8888-888888888888', 'Officer Ana Martinez', 'ana.martinez@police.gov')
ON CONFLICT (user_id) DO NOTHING;

-- Add roles for test officers
INSERT INTO public.user_roles (user_id, role) 
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'police_operator'),
  ('22222222-2222-2222-2222-222222222222', 'police_operator'),
  ('33333333-3333-3333-3333-333333333333', 'police_supervisor'),
  ('44444444-4444-4444-4444-444444444444', 'police_operator'),
  ('55555555-5555-5555-5555-555555555555', 'police_operator'),
  ('66666666-6666-6666-6666-666666666666', 'police_operator'),
  ('77777777-7777-7777-7777-777777777777', 'police_supervisor'),
  ('88888888-8888-8888-8888-888888888888', 'police_operator')
ON CONFLICT (user_id, role) DO NOTHING;

-- Assign officers to emergency units
INSERT INTO public.emergency_unit_members (unit_id, officer_id, role, is_lead) 
SELECT 
  eu.id,
  CASE 
    WHEN eu.unit_code = 'UNIT-001' THEN '11111111-1111-1111-1111-111111111111'
    WHEN eu.unit_code = 'UNIT-002' THEN '22222222-2222-2222-2222-222222222222'
    WHEN eu.unit_code = 'UNIT-003' THEN '55555555-5555-5555-5555-555555555555'
    WHEN eu.unit_code = 'UNIT-004' THEN '44444444-4444-4444-4444-444444444444'
    WHEN eu.unit_code = 'UNIT-005' THEN '66666666-6666-6666-6666-666666666666'
    WHEN eu.unit_code = 'UNIT-006' THEN '77777777-7777-7777-7777-777777777777'
    WHEN eu.unit_code = 'UNIT-007' THEN '88888888-8888-8888-8888-888888888888'
    WHEN eu.unit_code = 'UNIT-008' THEN '33333333-3333-3333-3333-333333333333'
  END as officer_id,
  CASE 
    WHEN eu.unit_code IN ('UNIT-006', 'UNIT-008') THEN 'lead'
    ELSE 'officer'
  END as role,
  CASE 
    WHEN eu.unit_code IN ('UNIT-006', 'UNIT-008') THEN true
    ELSE false
  END as is_lead
FROM public.emergency_units eu
WHERE eu.unit_code IN ('UNIT-001', 'UNIT-002', 'UNIT-003', 'UNIT-004', 'UNIT-005', 'UNIT-006', 'UNIT-007', 'UNIT-008');

-- Add additional members to some units
INSERT INTO public.emergency_unit_members (unit_id, officer_id, role, is_lead) 
SELECT 
  eu.id,
  '11111111-1111-1111-1111-111111111111',
  'officer',
  false
FROM public.emergency_units eu
WHERE eu.unit_code = 'UNIT-002'
ON CONFLICT (unit_id, officer_id) DO NOTHING;

INSERT INTO public.emergency_unit_members (unit_id, officer_id, role, is_lead) 
SELECT 
  eu.id,
  '44444444-4444-4444-4444-444444444444',
  'officer',
  false
FROM public.emergency_units eu
WHERE eu.unit_code = 'UNIT-001'
ON CONFLICT (unit_id, officer_id) DO NOTHING;