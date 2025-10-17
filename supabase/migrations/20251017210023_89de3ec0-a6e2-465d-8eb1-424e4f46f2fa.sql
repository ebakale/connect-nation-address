-- Fix city names and add missing cities

-- Update Annobón city name
UPDATE public.cities 
SET name = 'San Antonio de Palé'
WHERE name = 'Palé' 
AND province_id = (SELECT id FROM public.provinces WHERE code = 'AN');

-- Add missing Niefang to Centro Sur
INSERT INTO public.cities (name, province_id)
SELECT 'Niefang', id FROM public.provinces WHERE code = 'CS'
ON CONFLICT (name, province_id) DO NOTHING;

-- Update Djibloho city name from Oyala to Ciudad de la Paz
UPDATE public.cities 
SET name = 'Ciudad de la Paz'
WHERE name = 'Oyala' 
AND province_id = (SELECT id FROM public.provinces WHERE code = 'DJ');

-- Update Kié-Ntem city name from Nsork to Nsork Nsomo
UPDATE public.cities 
SET name = 'Nsork Nsomo'
WHERE name = 'Nsork' 
AND province_id = (SELECT id FROM public.provinces WHERE code = 'KN');

-- Update Wele-Nzas: change Añisoc to Añisork
UPDATE public.cities 
SET name = 'Añisork'
WHERE name = 'Añisoc' 
AND province_id = (SELECT id FROM public.provinces WHERE code = 'WN');

-- Add Nsork to Wele-Nzas
INSERT INTO public.cities (name, province_id)
SELECT 'Nsork', id FROM public.provinces WHERE code = 'WN'
ON CONFLICT (name, province_id) DO NOTHING;