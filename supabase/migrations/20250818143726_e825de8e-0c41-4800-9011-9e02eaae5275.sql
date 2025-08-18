-- Create sample users with profiles and roles
-- Note: In a real system, these would be created through auth signup
-- Here we're creating profiles that would exist after user registration

-- Insert sample user profiles
INSERT INTO public.profiles (id, user_id, email, full_name, organization) VALUES 
  -- Admin users
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'admin@ndaa.gq', 'Carlos Nsue Mokuy', 'National Directorate of Address Assignment'),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'admin2@ndaa.gq', 'María Nsue Angue', 'National Directorate of Address Assignment'),
  
  -- NDAA Admin
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'ndaa.admin@ndaa.gq', 'José Ela Oyana', 'National Directorate of Address Assignment'),
  
  -- Registrars
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'registrar.malabo@ndaa.gq', 'Isabel Bolekia Boneke', 'Bioko Norte Province Office'),
  ('45454545-4545-4545-4545-454545454545', '45454545-4545-4545-4545-454545454545', 'registrar.bata@ndaa.gq', 'Francisco Nguema Mba', 'Litoral Province Office'),
  ('46464646-4646-4646-4646-464646464646', '46464646-4646-4646-4646-464646464646', 'registrar.ebebiyin@ndaa.gq', 'Carmen Ayecaba Ondo', 'Kie-Ntem Province Office'),
  
  -- Verifiers  
  ('55555555-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'verifier.malabo@ndaa.gq', 'Miguel Esono Mba', 'Bioko Norte Verification Team'),
  ('56565656-5656-5656-5656-565656565656', '56565656-5656-5656-5656-565656565656', 'verifier.bata@ndaa.gq', 'Teresa Obiang Nguema', 'Litoral Verification Team'),
  ('57575757-5757-5757-5757-575757575757', '57575757-5757-5757-5757-575757575757', 'verifier.mongomo@ndaa.gq', 'Pedro Nchama Obiang', 'Wele-Nzas Verification Team'),
  ('58585858-5858-5858-5858-585858585858', '58585858-5858-5858-5858-585858585858', 'verifier.ebebiyin@ndaa.gq', 'Ana Ndong Mba', 'Kie-Ntem Verification Team'),
  
  -- Field Agents
  ('66666666-6666-6666-6666-666666666666', '66666666-6666-6666-6666-666666666666', 'agent.malabo1@ndaa.gq', 'Antonio Ondo Bile', 'Malabo Field Team Alpha'),
  ('67676767-6767-6767-6767-676767676767', '67676767-6767-6767-6767-676767676767', 'agent.malabo2@ndaa.gq', 'Esperanza Nsue Mba', 'Malabo Field Team Beta'),
  ('68686868-6868-6868-6868-686868686868', '68686868-6868-6868-6868-686868686868', 'agent.bata1@ndaa.gq', 'Santiago Obiang Ondo', 'Bata Field Team Alpha'),
  ('69696969-6969-6969-6969-696969696969', '69696969-6969-6969-6969-696969696969', 'agent.bata2@ndaa.gq', 'Felicia Ela Nsue', 'Bata Field Team Beta'),
  ('70707070-7070-7070-7070-707070707070', '70707070-7070-7070-7070-707070707070', 'agent.ebebiyin@ndaa.gq', 'Rafael Nguema Obiang', 'Ebebiyin Field Team'),
  
  -- Property Claimants
  ('77777777-7777-7777-7777-777777777777', '77777777-7777-7777-7777-777777777777', 'claimant1@email.gq', 'Victoria Nsue Ondo', 'Private Citizen'),
  ('78787878-7878-7878-7878-787878787878', '78787878-7878-7878-7878-787878787878', 'claimant2@email.gq', 'Domingo Mba Ela', 'Business Owner'),
  ('79797979-7979-7979-7979-797979797979', '79797979-7979-7979-7979-797979797979', 'claimant3@email.gq', 'Lucía Obiang Nsue', 'Property Developer'),
  
  -- Citizens
  ('88888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 'citizen1@email.gq', 'Gabriel Ondo Mba', 'Private Citizen'),
  ('89898989-8989-8989-8989-898989898989', '89898989-8989-8989-8989-898989898989', 'citizen2@email.gq', 'Rosa Nguema Ondo', 'Private Citizen'),
  ('90909090-9090-9090-9090-909090909090', '90909090-9090-9090-9090-909090909090', 'citizen3@email.gq', 'Emilio Nsue Obiang', 'Private Citizen'),
  ('91919191-9191-9191-9191-919191919191', '91919191-9191-9191-9191-919191919191', 'citizen4@email.gq', 'Patricia Ela Mba', 'Private Citizen'),
  ('92929292-9292-9292-9292-929292929292', '92929292-9292-9292-9292-929292929292', 'citizen5@email.gq', 'Alberto Obiang Ela', 'Private Citizen'),
  
  -- Auditors
  ('95959595-9595-9595-9595-959595959595', '95959595-9595-9595-9595-959595959595', 'auditor1@audit.gq', 'Claudia Nchama Ondo', 'External Audit Firm'),
  ('96969696-9696-9696-9696-969696969696', '96969696-9696-9696-9696-969696969696', 'auditor2@audit.gq', 'Fernando Ondo Nsue', 'Internal Audit Department'),
  
  -- Data Stewards
  ('97979797-9797-9797-9797-979797979797', '97979797-9797-9797-9797-979797979797', 'data.steward@ndaa.gq', 'Elena Mba Nguema', 'Data Quality Team'),
  
  -- Support Staff
  ('98989898-9898-9898-9898-989898989898', '98989898-9898-9898-9898-989898989898', 'support@ndaa.gq', 'Manuel Ela Obiang', 'Technical Support Team')
ON CONFLICT (id) DO NOTHING;

-- Assign roles to users
INSERT INTO public.user_roles (user_id, role) VALUES
  -- Admins
  ('11111111-1111-1111-1111-111111111111', 'admin'),
  ('22222222-2222-2222-2222-222222222222', 'admin'),
  
  -- NDAA Admin
  ('33333333-3333-3333-3333-333333333333', 'ndaa_admin'),
  
  -- Registrars
  ('44444444-4444-4444-4444-444444444444', 'registrar'),
  ('45454545-4545-4545-4545-454545454545', 'registrar'),
  ('46464646-4646-4646-4646-464646464646', 'registrar'),
  
  -- Verifiers
  ('55555555-5555-5555-5555-555555555555', 'verifier'),
  ('56565656-5656-5656-5656-565656565656', 'verifier'),
  ('57575757-5757-5757-5757-575757575757', 'verifier'),
  ('58585858-5858-5858-5858-585858585858', 'verifier'),
  
  -- Field Agents
  ('66666666-6666-6666-6666-666666666666', 'field_agent'),
  ('67676767-6767-6767-6767-676767676767', 'field_agent'),
  ('68686868-6868-6868-6868-686868686868', 'field_agent'),
  ('69696969-6969-6969-6969-696969696969', 'field_agent'),
  ('70707070-7070-7070-7070-707070707070', 'field_agent'),
  
  -- Property Claimants
  ('77777777-7777-7777-7777-777777777777', 'property_claimant'),
  ('78787878-7878-7878-7878-787878787878', 'property_claimant'),
  ('79797979-7979-7979-7979-797979797979', 'property_claimant'),
  
  -- Citizens
  ('88888888-8888-8888-8888-888888888888', 'citizen'),
  ('89898989-8989-8989-8989-898989898989', 'citizen'),
  ('90909090-9090-9090-9090-909090909090', 'citizen'),
  ('91919191-9191-9191-9191-919191919191', 'citizen'),
  ('92929292-9292-9292-9292-929292929292', 'citizen'),
  
  -- Auditors
  ('95959595-9595-9595-9595-959595959595', 'auditor'),
  ('96969696-9696-9696-9696-969696969696', 'auditor'),
  
  -- Data Steward
  ('97979797-9797-9797-9797-979797979797', 'data_steward'),
  
  -- Support
  ('98989898-9898-9898-9898-989898989898', 'support')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add geographic scope metadata for provincial roles
INSERT INTO public.user_role_metadata (user_role_id, scope_type, scope_value) 
SELECT ur.id, 'geographic', 'Bioko Norte'
FROM public.user_roles ur 
WHERE ur.user_id IN ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555');

INSERT INTO public.user_role_metadata (user_role_id, scope_type, scope_value) 
SELECT ur.id, 'geographic', 'Litoral'
FROM public.user_roles ur 
WHERE ur.user_id IN ('45454545-4545-4545-4545-454545454545', '56565656-5656-5656-5656-565656565656');

INSERT INTO public.user_role_metadata (user_role_id, scope_type, scope_value) 
SELECT ur.id, 'geographic', 'Kie-Ntem'
FROM public.user_roles ur 
WHERE ur.user_id IN ('46464646-4646-4646-4646-464646464646', '58585858-5858-5858-5858-585858585858');

INSERT INTO public.user_role_metadata (user_role_id, scope_type, scope_value) 
SELECT ur.id, 'geographic', 'Wele-Nzas'
FROM public.user_roles ur 
WHERE ur.user_id = '57575757-5757-5757-5757-575757575757';