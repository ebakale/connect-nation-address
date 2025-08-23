-- Update provinces table to be ISO 3166-2:GQ compliant
-- Clear existing data and insert correct provinces

TRUNCATE TABLE public.provinces;

-- Insert the 8 official provinces of Equatorial Guinea according to ISO 3166-2:GQ
INSERT INTO public.provinces (name, code, region, population, area) VALUES
('Annobón', 'AN', 'Annobón', 5232, 17),
('Bioko Norte', 'BN', 'Bioko Norte', 334463, 776),
('Bioko Sur', 'BS', 'Bioko Sur', 40198, 1241),
('Centro Sur', 'CS', 'Centro Sur', 144262, 9931),
('Djibloho', 'DJ', 'Djibloho', 3000, 300),
('Kié-Ntem', 'KN', 'Kié-Ntem', 183331, 3943),
('Litoral', 'LI', 'Litoral', 367348, 6665),
('Wele-Nzas', 'WN', 'Wele-Nzas', 192017, 5478);

-- Update any existing addresses that might have incorrect region names
-- Map any variations to the correct ISO names

UPDATE public.addresses 
SET region = 'Kié-Ntem'
WHERE region IN ('Kie-Ntem', 'Kié-Ntem');

-- Regenerate UACs for any addresses that might have been affected by region name changes
UPDATE public.addresses 
SET uac = generate_unified_uac_unique(country, region, city, id)
WHERE region IN ('Annobón', 'Bioko Norte', 'Bioko Sur', 'Centro Sur', 'Djibloho', 'Kié-Ntem', 'Litoral', 'Wele-Nzas');

-- Update address requests as well
UPDATE public.address_requests 
SET region = 'Kié-Ntem'
WHERE region IN ('Kie-Ntem', 'Kié-Ntem');