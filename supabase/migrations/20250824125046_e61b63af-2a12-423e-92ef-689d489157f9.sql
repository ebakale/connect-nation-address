-- Assign police officers to emergency units

-- First, let's get all police users and assign them to units
DO $$
DECLARE
    police_user RECORD;
    unit_record RECORD;
    unit_count INTEGER := 0;
    total_units INTEGER;
BEGIN
    -- Get total number of units
    SELECT COUNT(*) INTO total_units FROM emergency_units;
    
    -- Loop through all police users and assign them to units
    FOR police_user IN 
        SELECT DISTINCT ur.user_id, ur.role
        FROM user_roles ur 
        WHERE ur.role IN ('police_operator', 'police_dispatcher', 'police_supervisor')
    LOOP
        -- Get the next unit in rotation
        SELECT * INTO unit_record 
        FROM emergency_units 
        ORDER BY unit_code 
        LIMIT 1 OFFSET (unit_count % total_units);
        
        -- Insert the officer into the unit
        INSERT INTO emergency_unit_members (
            unit_id,
            officer_id,
            role,
            is_lead,
            joined_at
        ) VALUES (
            unit_record.id,
            police_user.user_id,
            CASE 
                WHEN police_user.role = 'police_supervisor' THEN 'sergeant'
                WHEN police_user.role = 'police_dispatcher' THEN 'dispatcher'
                ELSE 'officer'
            END,
            -- Make supervisors leads, and first officer in each unit a lead if no supervisor
            CASE 
                WHEN police_user.role = 'police_supervisor' THEN true
                WHEN NOT EXISTS (
                    SELECT 1 FROM emergency_unit_members 
                    WHERE unit_id = unit_record.id AND is_lead = true
                ) THEN true
                ELSE false
            END,
            now()
        ) ON CONFLICT (unit_id, officer_id) DO NOTHING;
        
        -- Move to next unit
        unit_count := unit_count + 1;
    END LOOP;
    
    RAISE NOTICE 'Successfully assigned police officers to units';
END $$;

-- Update unit status based on member availability
UPDATE emergency_units 
SET status = 'available', updated_at = now()
WHERE id IN (
    SELECT DISTINCT unit_id 
    FROM emergency_unit_members
);

-- Create a function to auto-assign new police users to units
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign new police users
CREATE TRIGGER auto_assign_police_to_unit
    AFTER INSERT ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION assign_police_user_to_unit();