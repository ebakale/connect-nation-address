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

-- Update the set_primary_address function to validate UAC exists
CREATE OR REPLACE FUNCTION public.set_primary_address(
    p_person_id uuid, 
    p_scope address_scope, 
    p_uac text, 
    p_unit_uac text DEFAULT NULL::text, 
    p_effective_from date DEFAULT CURRENT_DATE, 
    p_source text DEFAULT 'SELF_SERVICE'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    new_address_id UUID;
    person_auth_id UUID;
BEGIN
    -- Security check: ensure user can only modify their own addresses
    SELECT auth_user_id INTO person_auth_id 
    FROM public.person 
    WHERE id = p_person_id;
    
    IF person_auth_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
        RAISE EXCEPTION 'Unauthorized: Cannot modify addresses for other users';
    END IF;
    
    -- Validate UAC exists in NAR and is verified
    IF NOT EXISTS (
        SELECT 1 FROM public.addresses 
        WHERE uac = p_uac AND verified = true
    ) THEN
        RAISE EXCEPTION 'Invalid UAC: Address % does not exist or is not verified in the National Address Registry', p_uac;
    END IF;
    
    -- Validate scope/unit_uac consistency
    IF p_scope = 'UNIT' AND (p_unit_uac IS NULL OR LENGTH(TRIM(p_unit_uac)) = 0) THEN
        RAISE EXCEPTION 'Unit UAC is required when scope is UNIT';
    END IF;
    
    IF p_scope = 'BUILDING' AND p_unit_uac IS NOT NULL THEN
        RAISE EXCEPTION 'Unit UAC must be NULL when scope is BUILDING';
    END IF;
    
    -- Close existing primary address
    PERFORM public.close_current_primary(p_person_id, p_effective_from - INTERVAL '1 day');
    
    -- Create new primary address
    INSERT INTO public.citizen_address (
        person_id, address_kind, scope, uac, unit_uac, 
        effective_from, source, created_by
    ) VALUES (
        p_person_id, 'PRIMARY', p_scope, p_uac, p_unit_uac,
        p_effective_from, p_source, auth.uid()
    ) RETURNING id INTO new_address_id;
    
    -- Log the move event
    INSERT INTO public.citizen_address_event (
        person_id, citizen_address_id, event_type, actor_id, payload
    ) VALUES (
        p_person_id, new_address_id, 'MOVE', auth.uid(),
        jsonb_build_object(
            'scope', p_scope,
            'uac', p_uac,
            'unit_uac', p_unit_uac,
            'effective_from', p_effective_from,
            'source', p_source
        )
    );
    
    RETURN new_address_id;
END;
$function$;