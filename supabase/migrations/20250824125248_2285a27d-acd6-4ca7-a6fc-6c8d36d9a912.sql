-- Fix security issues in functions

-- Fix assign_police_user_to_unit function
CREATE OR REPLACE FUNCTION assign_police_user_to_unit()
RETURNS TRIGGER AS $$
DECLARE
    target_unit_id uuid;
    unit_member_count integer;
    min_member_count integer;
    user_role_name text;
BEGIN
    -- Only process police roles
    IF NEW.role NOT IN ('police_operator', 'police_dispatcher', 'police_supervisor') THEN
        RETURN NEW;
    END IF;
    
    -- Find the unit with the least members
    SELECT eu.id, COUNT(eum.officer_id)
    INTO target_unit_id, min_member_count
    FROM emergency_units eu
    LEFT JOIN emergency_unit_members eum ON eu.id = eum.unit_id
    GROUP BY eu.id
    ORDER BY COUNT(eum.officer_id), eu.created_at
    LIMIT 1;
    
    -- Determine role based on user role
    user_role_name := CASE 
        WHEN NEW.role = 'police_supervisor' THEN 'sergeant'
        WHEN NEW.role = 'police_dispatcher' THEN 'dispatcher'
        ELSE 'officer'
    END;
    
    -- Insert the user into the unit
    INSERT INTO emergency_unit_members (
        unit_id,
        officer_id,
        role,
        is_lead,
        joined_at
    ) VALUES (
        target_unit_id,
        NEW.user_id,
        user_role_name,
        -- Make supervisors leads, or first member in unit
        CASE 
            WHEN NEW.role = 'police_supervisor' THEN true
            WHEN min_member_count = 0 THEN true
            ELSE false
        END,
        now()
    ) ON CONFLICT (unit_id, officer_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;