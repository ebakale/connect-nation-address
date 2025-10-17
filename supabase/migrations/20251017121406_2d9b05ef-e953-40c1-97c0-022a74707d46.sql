-- IDP-safe migration (idempotent)
-- 0) Allow citizen_address to store dependent-only rows
ALTER TABLE citizen_address ALTER COLUMN person_id DROP NOT NULL;
DO $$ BEGIN
  ALTER TABLE citizen_address DROP CONSTRAINT IF EXISTS citizen_address_person_or_dependent;
EXCEPTION WHEN undefined_object THEN NULL; END $$;
ALTER TABLE citizen_address ADD CONSTRAINT citizen_address_person_or_dependent CHECK ((person_id IS NOT NULL) OR (dependent_id IS NOT NULL));

-- 1) Enum types (create if not exists)
DO $$ BEGIN
  CREATE TYPE dependent_type_enum AS ENUM ('MINOR', 'ADULT_STUDENT', 'ADULT_DISABLED', 'ELDERLY_PARENT', 'OTHER_ADULT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE custody_type_enum AS ENUM ('FULL', 'SHARED', 'PARTIAL', 'TEMPORARY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE household_status_enum AS ENUM ('ACTIVE', 'TRANSFERRED', 'DISSOLVED', 'MERGED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE membership_status_enum AS ENUM ('ACTIVE', 'MOVED_OUT', 'TEMPORARY', 'VISITING');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE household_role_enum AS ENUM ('HEAD', 'CO_HEAD', 'MEMBER', 'DEPENDENT', 'TEMPORARY_RESIDENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Table alterations (safe adds)
ALTER TABLE household_dependents
  ADD COLUMN IF NOT EXISTS dependent_type dependent_type_enum DEFAULT 'MINOR' NOT NULL,
  ADD COLUMN IF NOT EXISTS dependency_reason TEXT,
  ADD COLUMN IF NOT EXISTS expected_dependency_end_date DATE,
  ADD COLUMN IF NOT EXISTS disability_certificate_number TEXT,
  ADD COLUMN IF NOT EXISTS student_enrollment_number TEXT,
  ADD COLUMN IF NOT EXISTS university_name TEXT;

-- Age constraint removal if present
DO $$ BEGIN
  ALTER TABLE household_dependents DROP CONSTRAINT IF EXISTS valid_age;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

ALTER TABLE household_groups
  ADD COLUMN IF NOT EXISTS household_status household_status_enum DEFAULT 'ACTIVE' NOT NULL,
  ADD COLUMN IF NOT EXISTS previous_household_id UUID REFERENCES household_groups(id),
  ADD COLUMN IF NOT EXISTS household_succession_date DATE;

-- Unique index for active households at same UAC (unit-aware)
CREATE UNIQUE INDEX IF NOT EXISTS unique_household_uac_active 
  ON household_groups(primary_uac, COALESCE(primary_unit_uac, ''))
  WHERE is_active = true;

ALTER TABLE household_members
  ADD COLUMN IF NOT EXISTS is_primary_household BOOLEAN DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS residence_percentage NUMERIC CHECK (residence_percentage >= 0 AND residence_percentage <= 100),
  ADD COLUMN IF NOT EXISTS custody_type custody_type_enum,
  ADD COLUMN IF NOT EXISTS custody_schedule JSONB,
  ADD COLUMN IF NOT EXISTS membership_status membership_status_enum DEFAULT 'ACTIVE' NOT NULL,
  ADD COLUMN IF NOT EXISTS household_role household_role_enum DEFAULT 'MEMBER' NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_primary_household_per_dependent 
  ON household_members(dependent_id) 
  WHERE is_primary_household = true AND dependent_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS unique_primary_household_per_person 
  ON household_members(person_id) 
  WHERE is_primary_household = true AND person_id IS NOT NULL;

-- 3) Functions and triggers
CREATE OR REPLACE FUNCTION validate_dependent_type()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXTRACT(year FROM age(CURRENT_DATE, NEW.date_of_birth)) < 18 THEN
    IF NEW.dependent_type != 'MINOR' THEN
      RAISE EXCEPTION 'Dependents under 18 must have type MINOR';
    END IF;
  ELSE
    IF NEW.dependent_type = 'MINOR' THEN
      RAISE EXCEPTION 'Dependents 18 or older cannot have type MINOR';
    END IF;
    IF NEW.dependency_reason IS NULL OR TRIM(NEW.dependency_reason) = '' THEN
      RAISE EXCEPTION 'Adult dependents must have a dependency reason';
    END IF;
  END IF;
  IF NEW.dependent_type = 'ADULT_STUDENT' AND NEW.expected_dependency_end_date IS NULL THEN
    RAISE EXCEPTION 'Student dependents must have an expected end date';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_dependent_type_trigger ON household_dependents;
CREATE TRIGGER validate_dependent_type_trigger
BEFORE INSERT OR UPDATE ON household_dependents
FOR EACH ROW
EXECUTE FUNCTION validate_dependent_type();

CREATE OR REPLACE FUNCTION sync_household_member_addresses()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
BEGIN
  IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND (NEW.primary_uac IS DISTINCT FROM OLD.primary_uac OR NEW.primary_unit_uac IS DISTINCT FROM OLD.primary_unit_uac)) THEN
    FOR member_record IN 
      SELECT hm.person_id, hm.dependent_id, hm.is_primary_household
      FROM household_members hm
      WHERE hm.household_group_id = NEW.id
        AND hm.is_primary_household = true
        AND hm.membership_status = 'ACTIVE'
    LOOP
      IF member_record.is_primary_household THEN
        UPDATE citizen_address
        SET effective_to = CURRENT_DATE
        WHERE (
          (person_id IS NOT NULL AND person_id = member_record.person_id) OR
          (dependent_id IS NOT NULL AND dependent_id = member_record.dependent_id)
        )
          AND address_kind = 'PRIMARY'
          AND effective_to IS NULL
          AND uac != NEW.primary_uac;
        
        IF member_record.person_id IS NOT NULL THEN
          INSERT INTO citizen_address (
            person_id, address_kind, scope, uac, unit_uac, household_group_id, source, created_by
          )
          SELECT 
            member_record.person_id,
            'PRIMARY'::address_kind,
            (CASE WHEN NEW.primary_unit_uac IS NOT NULL THEN 'UNIT' ELSE 'BUILDING' END)::address_scope,
            NEW.primary_uac,
            NEW.primary_unit_uac,
            NEW.id,
            'HOUSEHOLD_SYNC',
            NEW.created_by
          WHERE NOT EXISTS (
            SELECT 1 FROM citizen_address 
            WHERE person_id = member_record.person_id 
              AND address_kind = 'PRIMARY'
              AND uac = NEW.primary_uac
              AND effective_to IS NULL
          );
        ELSIF member_record.dependent_id IS NOT NULL THEN
          INSERT INTO citizen_address (
            dependent_id, address_kind, scope, uac, unit_uac, household_group_id, source, declared_by_guardian, guardian_person_id
          )
          SELECT 
            member_record.dependent_id,
            'PRIMARY'::address_kind,
            (CASE WHEN NEW.primary_unit_uac IS NOT NULL THEN 'UNIT' ELSE 'BUILDING' END)::address_scope,
            NEW.primary_uac,
            NEW.primary_unit_uac,
            NEW.id,
            'HOUSEHOLD_SYNC',
            true,
            NEW.household_head_person_id
          WHERE NOT EXISTS (
            SELECT 1 FROM citizen_address 
            WHERE dependent_id = member_record.dependent_id 
              AND address_kind = 'PRIMARY'
              AND uac = NEW.primary_uac
              AND effective_to IS NULL
          );
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_household_addresses_trigger ON household_groups;
CREATE TRIGGER sync_household_addresses_trigger
AFTER INSERT OR UPDATE ON household_groups
FOR EACH ROW
EXECUTE FUNCTION sync_household_member_addresses();

CREATE OR REPLACE FUNCTION sync_member_address_on_add()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  household_uac TEXT;
  household_unit_uac TEXT;
  household_head_person UUID;
BEGIN
  IF NEW.is_primary_household AND NEW.membership_status = 'ACTIVE' THEN
    SELECT primary_uac, primary_unit_uac, household_head_person_id
      INTO household_uac, household_unit_uac, household_head_person
    FROM household_groups WHERE id = NEW.household_group_id;

    IF NEW.person_id IS NOT NULL THEN
      UPDATE citizen_address
      SET effective_to = CURRENT_DATE
      WHERE person_id = NEW.person_id
        AND address_kind = 'PRIMARY'
        AND effective_to IS NULL
        AND uac != household_uac;
      INSERT INTO citizen_address (
        person_id, address_kind, scope, uac, unit_uac, household_group_id, source, created_by
      )
      SELECT 
        NEW.person_id,
        'PRIMARY'::address_kind,
        (CASE WHEN household_unit_uac IS NOT NULL THEN 'UNIT' ELSE 'BUILDING' END)::address_scope,
        household_uac,
        household_unit_uac,
        NEW.household_group_id,
        'HOUSEHOLD_SYNC',
        NEW.added_by
      WHERE NOT EXISTS (
        SELECT 1 FROM citizen_address
        WHERE person_id = NEW.person_id
          AND address_kind = 'PRIMARY'
          AND uac = household_uac
          AND effective_to IS NULL
      );
    ELSIF NEW.dependent_id IS NOT NULL THEN
      UPDATE citizen_address
      SET effective_to = CURRENT_DATE
      WHERE dependent_id = NEW.dependent_id
        AND address_kind = 'PRIMARY'
        AND effective_to IS NULL
        AND uac != household_uac;
      INSERT INTO citizen_address (
        dependent_id, address_kind, scope, uac, unit_uac, household_group_id, source, declared_by_guardian, guardian_person_id
      )
      SELECT 
        NEW.dependent_id,
        'PRIMARY'::address_kind,
        (CASE WHEN household_unit_uac IS NOT NULL THEN 'UNIT' ELSE 'BUILDING' END)::address_scope,
        household_uac,
        household_unit_uac,
        NEW.household_group_id,
        'HOUSEHOLD_SYNC',
        true,
        household_head_person
      WHERE NOT EXISTS (
        SELECT 1 FROM citizen_address
        WHERE dependent_id = NEW.dependent_id
          AND address_kind = 'PRIMARY'
          AND uac = household_uac
          AND effective_to IS NULL
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_member_address_trigger ON household_members;
CREATE TRIGGER sync_member_address_trigger
AFTER INSERT OR UPDATE ON household_members
FOR EACH ROW
EXECUTE FUNCTION sync_member_address_on_add();

CREATE OR REPLACE FUNCTION validate_residence_percentage()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE total_percentage NUMERIC; BEGIN
  IF NEW.person_id IS NOT NULL THEN
    SELECT COALESCE(SUM(residence_percentage), 0)
      INTO total_percentage
    FROM household_members
    WHERE person_id = NEW.person_id
      AND membership_status = 'ACTIVE'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  ELSIF NEW.dependent_id IS NOT NULL THEN
    SELECT COALESCE(SUM(residence_percentage), 0)
      INTO total_percentage
    FROM household_members
    WHERE dependent_id = NEW.dependent_id
      AND membership_status = 'ACTIVE'
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  ELSE
    total_percentage := 0;
  END IF;
  total_percentage := total_percentage + COALESCE(NEW.residence_percentage, 0);
  IF total_percentage > 100 THEN
    RAISE EXCEPTION 'Total residence percentage cannot exceed 100 (current: %)', total_percentage;
  END IF;
  RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_residence_percentage_trigger ON household_members;
CREATE TRIGGER validate_residence_percentage_trigger
BEFORE INSERT OR UPDATE ON household_members
FOR EACH ROW
EXECUTE FUNCTION validate_residence_percentage();

CREATE OR REPLACE FUNCTION prevent_head_removal()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.household_role = 'HEAD' AND OLD.membership_status = 'ACTIVE' THEN
      RAISE EXCEPTION 'Cannot remove household head. Transfer headship first.';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.household_role = 'HEAD' AND OLD.membership_status = 'ACTIVE' AND NEW.membership_status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'Cannot deactivate household head. Transfer headship first.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_head_removal_trigger ON household_members;
CREATE TRIGGER prevent_head_removal_trigger
BEFORE UPDATE OR DELETE ON household_members
FOR EACH ROW
EXECUTE FUNCTION prevent_head_removal();

-- 4) Safe backfill: mark one primary per person (most recent)
WITH ranked AS (
  SELECT id, person_id, ROW_NUMBER() OVER (PARTITION BY person_id ORDER BY added_at DESC NULLS LAST, id) rn
  FROM household_members WHERE person_id IS NOT NULL
)
UPDATE household_members hm
SET is_primary_household = (ranked.rn = 1)
FROM ranked
WHERE hm.id = ranked.id;

UPDATE household_members SET residence_percentage = 100
WHERE is_primary_household = true AND residence_percentage IS NULL;