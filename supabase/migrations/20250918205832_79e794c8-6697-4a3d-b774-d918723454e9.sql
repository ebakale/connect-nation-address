-- Create a view that joins citizen addresses with NAR address details
CREATE OR REPLACE VIEW public.citizen_address_with_details AS
SELECT 
    ca.id,
    ca.person_id,
    ca.address_kind,
    ca.scope,
    ca.uac,
    ca.unit_uac,
    ca.occupant,
    ca.status,
    ca.effective_from,
    ca.effective_to,
    ca.source,
    ca.notes,
    ca.created_at,
    ca.updated_at,
    ca.created_by,
    -- NAR address details
    a.street,
    a.city,
    a.region,
    a.country,
    a.building,
    a.address_type,
    a.description as address_description,
    a.latitude,
    a.longitude,
    a.verified as nar_verified,
    a.public as nar_public
FROM public.citizen_address ca
LEFT JOIN public.addresses a ON ca.uac = a.uac
WHERE ca.effective_to IS NULL; -- Only current addresses

-- Grant select permissions on the view
GRANT SELECT ON public.citizen_address_with_details TO authenticated;

-- Add RLS policy for the view
CREATE POLICY "Citizens can view their own address details" ON public.citizen_address_with_details
    FOR SELECT USING (
        person_id IN (
            SELECT id FROM public.person WHERE auth_user_id = auth.uid()
        )
    );

-- Create function to validate UAC exists in NAR before allowing address assignment
CREATE OR REPLACE FUNCTION public.validate_uac_exists(p_uac text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
    SELECT EXISTS (
        SELECT 1 FROM public.addresses 
        WHERE uac = p_uac AND verified = true
    );
$function$;