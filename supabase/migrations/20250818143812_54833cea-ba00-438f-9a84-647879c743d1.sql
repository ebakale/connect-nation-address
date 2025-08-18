-- Create sample user roles without profiles (since we can't directly manage auth.users)
-- In a real system, profiles would be created automatically when users sign up

-- Create sample address requests to show pending approvals
INSERT INTO public.address_requests (id, user_id, country, region, city, street, building, address_type, description, justification, status, latitude, longitude) VALUES
  ('req001', '11111111-1111-1111-1111-111111111111', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 'Calle de la Independencia', '45A', 'commercial', 'New business registration', 'Opening new store location', 'pending', 3.7558, 8.7821),
  ('req002', '22222222-2222-2222-2222-222222222222', 'Equatorial Guinea', 'Litoral', 'Bata', 'Avenida de la Libertad', '123', 'residential', 'Family home address', 'New family residence', 'pending', 1.8506, 9.7570),
  ('req003', '33333333-3333-3333-3333-333333333333', 'Equatorial Guinea', 'Bioko Norte', 'Malabo', 'Calle Mongo Ndong', '67', 'residential', 'Apartment building address', 'Multi-unit housing registration', 'pending', 3.7520, 8.7850),
  ('req004', '44444444-4444-4444-4444-444444444444', 'Equatorial Guinea', 'Kie-Ntem', 'Ebebiyin', 'Carretera Nacional', '89', 'commercial', 'Border commerce center', 'Cross-border business location', 'pending', 2.1520, 11.3350),
  ('req005', '55555555-5555-5555-5555-555555555555', 'Equatorial Guinea', 'Wele-Nzas', 'Mongomo', 'Plaza Central', '12', 'institutional', 'Government office', 'Regional administration office', 'pending', 1.6280, 10.0310),
  ('req006', '66666666-6666-6666-6666-666666666666', 'Equatorial Guinea', 'Centro Sur', 'Evinayong', 'Avenida Principal', '34', 'residential', 'Traditional home', 'Family compound registration', 'pending', 1.4370, 10.5510),
  ('req007', '77777777-7777-7777-7777-777777777777', 'Equatorial Guinea', 'Kié-Ntem', 'Mikomeseng', 'Calle del Mercado', '56', 'commercial', 'Market stall complex', 'Commercial market registration', 'pending', 2.1330, 10.6130),
  ('req008', '88888888-8888-8888-8888-888888888888', 'Equatorial Guinea', 'Litoral', 'Mbini', 'Puerto Pesquero', '78', 'industrial', 'Fishing port facility', 'Port infrastructure registration', 'pending', 1.5830, 9.6130);