-- Create RPC functions for CAR module
-- Step 4: Core business logic functions

-- Function to close current primary address
CREATE OR REPLACE FUNCTION public.close_current_primary(
    p_person_id UUID,
    p_until DATE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.citizen_address
    SET effective_to = p_until
    WHERE person_id = p_person_id 
      AND address_kind = 'PRIMARY'
      AND effective_to IS NULL;
END;
$$;

-- Function to set primary address (closes old, creates new)
CREATE OR REPLACE FUNCTION public.set_primary_address(
    p_person_id UUID,
    p_scope address_scope,
    p_uac TEXT,
    p_unit_uac TEXT DEFAULT NULL,
    p_effective_from DATE DEFAULT CURRENT_DATE,
    p_source TEXT DEFAULT 'SELF_SERVICE'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    
    -- Validate UAC exists in NAR (TODO: add actual NAR lookup when available)
    -- For now, just check format
    IF p_uac IS NULL OR LENGTH(TRIM(p_uac)) = 0 THEN
        RAISE EXCEPTION 'UAC is required';
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
$$;

-- Function to add secondary address
CREATE OR REPLACE FUNCTION public.add_secondary_address(
    p_person_id UUID,
    p_scope address_scope,
    p_uac TEXT,
    p_unit_uac TEXT DEFAULT NULL,
    p_source TEXT DEFAULT 'SELF_SERVICE'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_address_id UUID;
    person_auth_id UUID;
BEGIN
    -- Security check
    SELECT auth_user_id INTO person_auth_id 
    FROM public.person 
    WHERE id = p_person_id;
    
    IF person_auth_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
        RAISE EXCEPTION 'Unauthorized: Cannot modify addresses for other users';
    END IF;
    
    -- Validate inputs
    IF p_uac IS NULL OR LENGTH(TRIM(p_uac)) = 0 THEN
        RAISE EXCEPTION 'UAC is required';
    END IF;
    
    IF p_scope = 'UNIT' AND (p_unit_uac IS NULL OR LENGTH(TRIM(p_unit_uac)) = 0) THEN
        RAISE EXCEPTION 'Unit UAC is required when scope is UNIT';
    END IF;
    
    IF p_scope = 'BUILDING' AND p_unit_uac IS NOT NULL THEN
        RAISE EXCEPTION 'Unit UAC must be NULL when scope is BUILDING';
    END IF;
    
    -- Create secondary address
    INSERT INTO public.citizen_address (
        person_id, address_kind, scope, uac, unit_uac, 
        source, created_by
    ) VALUES (
        p_person_id, 'SECONDARY', p_scope, p_uac, p_unit_uac,
        p_source, auth.uid()
    ) RETURNING id INTO new_address_id;
    
    -- Log the add event
    INSERT INTO public.citizen_address_event (
        person_id, citizen_address_id, event_type, actor_id, payload
    ) VALUES (
        p_person_id, new_address_id, 'ADD', auth.uid(),
        jsonb_build_object(
            'scope', p_scope,
            'uac', p_uac,
            'unit_uac', p_unit_uac,
            'source', p_source
        )
    );
    
    RETURN new_address_id;
END;
$$;

-- Function to set citizen address status (for verifiers)
CREATE OR REPLACE FUNCTION public.set_citizen_address_status(
    p_address_id UUID,
    p_status address_status,
    p_actor_id UUID DEFAULT auth.uid()
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    address_person_id UUID;
    old_status address_status;
BEGIN
    -- Security check: only verifiers/admins can change status
    IF NOT (has_role(auth.uid(), 'verifier'::app_role) OR 
            has_role(auth.uid(), 'registrar'::app_role) OR 
            has_role(auth.uid(), 'admin'::app_role)) THEN
        RAISE EXCEPTION 'Unauthorized: Only verifiers can change address status';
    END IF;
    
    -- Get current status and person_id
    SELECT person_id, status INTO address_person_id, old_status
    FROM public.citizen_address
    WHERE id = p_address_id;
    
    IF address_person_id IS NULL THEN
        RAISE EXCEPTION 'Address not found';
    END IF;
    
    -- Update status
    UPDATE public.citizen_address
    SET status = p_status
    WHERE id = p_address_id;
    
    -- Log the event
    INSERT INTO public.citizen_address_event (
        person_id, citizen_address_id, 
        event_type, actor_id, payload
    ) VALUES (
        address_person_id, p_address_id,
        CASE 
            WHEN p_status = 'CONFIRMED' THEN 'VERIFY'
            WHEN p_status = 'REJECTED' THEN 'REJECT'
            ELSE 'STATUS_CHANGE'
        END,
        p_actor_id,
        jsonb_build_object(
            'old_status', old_status,
            'new_status', p_status
        )
    );
END;
$$;

-- Function to retire address
CREATE OR REPLACE FUNCTION public.retire_address(
    p_address_id UUID,
    p_when DATE DEFAULT CURRENT_DATE,
    p_reason TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    address_person_id UUID;
    person_auth_id UUID;
BEGIN
    -- Get address info
    SELECT ca.person_id, p.auth_user_id 
    INTO address_person_id, person_auth_id
    FROM public.citizen_address ca
    JOIN public.person p ON ca.person_id = p.id
    WHERE ca.id = p_address_id;
    
    IF address_person_id IS NULL THEN
        RAISE EXCEPTION 'Address not found';
    END IF;
    
    -- Security check: user can retire their own or admin can retire any
    IF person_auth_id != auth.uid() AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
        RAISE EXCEPTION 'Unauthorized: Cannot retire addresses for other users';
    END IF;
    
    -- Retire the address
    UPDATE public.citizen_address
    SET effective_to = p_when
    WHERE id = p_address_id;
    
    -- Log the event
    INSERT INTO public.citizen_address_event (
        person_id, citizen_address_id, event_type, actor_id, payload
    ) VALUES (
        address_person_id, p_address_id, 'RETIRE', auth.uid(),
        jsonb_build_object(
            'retired_on', p_when,
            'reason', p_reason
        )
    );
END;
$$;

-- Function to get current residents by UAC (for admin)
CREATE OR REPLACE FUNCTION public.get_residents_by_uac(
    p_uac TEXT,
    p_current_only BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    person_id UUID,
    address_id UUID,
    address_kind address_kind,
    scope address_scope,
    unit_uac TEXT,
    occupant occupant_type,
    status address_status,
    effective_from DATE,
    effective_to DATE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Security check: only verifiers/admins can view resident data
    IF NOT (has_role(auth.uid(), 'verifier'::app_role) OR 
            has_role(auth.uid(), 'registrar'::app_role) OR 
            has_role(auth.uid(), 'admin'::app_role)) THEN
        RAISE EXCEPTION 'Unauthorized: Only verifiers can view resident information';
    END IF;
    
    RETURN QUERY
    SELECT 
        ca.person_id,
        ca.id as address_id,
        ca.address_kind,
        ca.scope,
        ca.unit_uac,
        ca.occupant,
        ca.status,
        ca.effective_from,
        ca.effective_to
    FROM public.citizen_address ca
    WHERE ca.uac = p_uac
      AND (NOT p_current_only OR ca.effective_to IS NULL)
    ORDER BY ca.effective_from DESC;
END;
$$;