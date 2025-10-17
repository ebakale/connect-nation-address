-- =========================================
-- PHASE 1 & 2: Guardian-Dependent + Household Groups
-- =========================================

-- Create enums
CREATE TYPE dependent_relationship AS ENUM (
  'CHILD',
  'ADOPTED_CHILD',
  'STEPCHILD',
  'WARD',
  'GRANDCHILD',
  'NIECE_NEPHEW',
  'OTHER_RELATIVE'
);

CREATE TYPE household_member_role AS ENUM (
  'HEAD',
  'SPOUSE',
  'CHILD',
  'PARENT',
  'GRANDPARENT',
  'GRANDCHILD',
  'SIBLING',
  'OTHER_RELATIVE',
  'NON_RELATIVE'
);

-- =========================================
-- HOUSEHOLD DEPENDENTS TABLE
-- =========================================
CREATE TABLE public.household_dependents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Guardian relationship
  guardian_person_id UUID NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
  guardian_user_id UUID NOT NULL,
  
  -- Dependent information
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  relationship_to_guardian dependent_relationship NOT NULL,
  
  -- Optional documents
  birth_certificate_number TEXT,
  health_card_number TEXT,
  school_id_number TEXT,
  
  -- Status tracking
  is_active BOOLEAN NOT NULL DEFAULT true,
  reached_majority_age BOOLEAN NOT NULL DEFAULT false,
  notified_at_18 TIMESTAMP WITH TIME ZONE,
  claimed_own_account BOOLEAN NOT NULL DEFAULT false,
  claimed_account_user_id UUID,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_dob CHECK (date_of_birth < CURRENT_DATE),
  CONSTRAINT valid_age CHECK (
    EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) < 18 
    OR reached_majority_age = true
  )
);

CREATE INDEX idx_household_dependents_guardian ON household_dependents(guardian_person_id);
CREATE INDEX idx_household_dependents_active ON household_dependents(is_active) WHERE is_active = true;
CREATE INDEX idx_household_dependents_dob ON household_dependents(date_of_birth);

ALTER TABLE public.household_dependents ENABLE ROW LEVEL SECURITY;

-- =========================================
-- HOUSEHOLD GROUPS TABLE
-- =========================================
CREATE TABLE public.household_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  household_name TEXT NOT NULL,
  primary_uac TEXT NOT NULL,
  primary_unit_uac TEXT,
  
  -- Household head
  household_head_person_id UUID NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
  household_head_user_id UUID NOT NULL,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  verified_by_car BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  
  -- Metadata
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

CREATE INDEX idx_household_groups_head ON household_groups(household_head_person_id);
CREATE INDEX idx_household_groups_uac ON household_groups(primary_uac);
CREATE INDEX idx_household_groups_active ON household_groups(is_active) WHERE is_active = true;

ALTER TABLE public.household_groups ENABLE ROW LEVEL SECURITY;

-- =========================================
-- HOUSEHOLD MEMBERS TABLE
-- =========================================
CREATE TABLE public.household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  household_group_id UUID NOT NULL REFERENCES public.household_groups(id) ON DELETE CASCADE,
  
  -- Member can be person or dependent
  person_id UUID REFERENCES public.person(id) ON DELETE CASCADE,
  dependent_id UUID REFERENCES public.household_dependents(id) ON DELETE CASCADE,
  
  -- Relationship
  relationship_to_head household_member_role NOT NULL,
  
  -- Status
  is_primary_resident BOOLEAN NOT NULL DEFAULT false,
  moved_in_date DATE,
  moved_out_date DATE,
  
  -- Metadata
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID NOT NULL,
  
  -- Constraints
  CONSTRAINT check_person_or_dependent CHECK (
    (person_id IS NOT NULL AND dependent_id IS NULL) OR
    (person_id IS NULL AND dependent_id IS NOT NULL)
  ),
  CONSTRAINT unique_household_person UNIQUE(household_group_id, person_id),
  CONSTRAINT unique_household_dependent UNIQUE(household_group_id, dependent_id)
);

CREATE INDEX idx_household_members_group ON household_members(household_group_id);
CREATE INDEX idx_household_members_person ON household_members(person_id) WHERE person_id IS NOT NULL;
CREATE INDEX idx_household_members_dependent ON household_members(dependent_id) WHERE dependent_id IS NOT NULL;

ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;

-- =========================================
-- EXTEND CITIZEN_ADDRESS TABLE
-- =========================================
ALTER TABLE public.citizen_address 
ADD COLUMN dependent_id UUID REFERENCES public.household_dependents(id) ON DELETE CASCADE,
ADD COLUMN declared_by_guardian BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN guardian_person_id UUID REFERENCES public.person(id),
ADD COLUMN household_group_id UUID REFERENCES public.household_groups(id) ON DELETE SET NULL;

CREATE INDEX idx_citizen_address_dependent ON citizen_address(dependent_id) WHERE dependent_id IS NOT NULL;
CREATE INDEX idx_citizen_address_guardian ON citizen_address(guardian_person_id) WHERE guardian_person_id IS NOT NULL;
CREATE INDEX idx_citizen_address_household ON citizen_address(household_group_id) WHERE household_group_id IS NOT NULL;

ALTER TABLE public.citizen_address 
ADD CONSTRAINT check_person_or_dependent 
CHECK (
  (person_id IS NOT NULL AND dependent_id IS NULL) OR
  (person_id IS NULL AND dependent_id IS NOT NULL)
);

-- =========================================
-- AUDIT TABLES
-- =========================================
CREATE TABLE public.dependent_authorization_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dependent_id UUID NOT NULL REFERENCES public.household_dependents(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_dependent_audit_dependent ON dependent_authorization_audit(dependent_id);
CREATE INDEX idx_dependent_audit_timestamp ON dependent_authorization_audit(timestamp DESC);

ALTER TABLE public.dependent_authorization_audit ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.household_activity_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_group_id UUID NOT NULL REFERENCES public.household_groups(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_household_audit_group ON household_activity_audit(household_group_id);
CREATE INDEX idx_household_audit_timestamp ON household_activity_audit(timestamp DESC);

ALTER TABLE public.household_activity_audit ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES - HOUSEHOLD DEPENDENTS
-- =========================================
CREATE POLICY "Guardians can view their dependents"
ON public.household_dependents FOR SELECT
TO authenticated
USING (guardian_user_id = auth.uid());

CREATE POLICY "Guardians can create dependents"
ON public.household_dependents FOR INSERT
TO authenticated
WITH CHECK (guardian_user_id = auth.uid() AND created_by = auth.uid());

CREATE POLICY "Guardians can update unclaimed dependents"
ON public.household_dependents FOR UPDATE
TO authenticated
USING (guardian_user_id = auth.uid() AND claimed_own_account = false);

CREATE POLICY "Verifiers can view all dependents"
ON public.household_dependents FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'verifier'::app_role) OR
  has_role(auth.uid(), 'car_verifier'::app_role) OR
  has_role(auth.uid(), 'registrar'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- =========================================
-- RLS POLICIES - HOUSEHOLD GROUPS
-- =========================================
CREATE POLICY "Household heads can view their groups"
ON public.household_groups FOR SELECT
TO authenticated
USING (household_head_user_id = auth.uid());

CREATE POLICY "Household members can view their groups"
ON public.household_groups FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT household_group_id FROM household_members hm
    JOIN person p ON hm.person_id = p.id
    WHERE p.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Household heads can create groups"
ON public.household_groups FOR INSERT
TO authenticated
WITH CHECK (household_head_user_id = auth.uid() AND created_by = auth.uid());

CREATE POLICY "Household heads can update their groups"
ON public.household_groups FOR UPDATE
TO authenticated
USING (household_head_user_id = auth.uid());

CREATE POLICY "Verifiers can view all household groups"
ON public.household_groups FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'verifier'::app_role) OR
  has_role(auth.uid(), 'car_verifier'::app_role) OR
  has_role(auth.uid(), 'registrar'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- =========================================
-- RLS POLICIES - HOUSEHOLD MEMBERS
-- =========================================
CREATE POLICY "Household heads can manage members"
ON public.household_members FOR ALL
TO authenticated
USING (
  household_group_id IN (
    SELECT id FROM household_groups WHERE household_head_user_id = auth.uid()
  )
);

CREATE POLICY "Members can view their household"
ON public.household_members FOR SELECT
TO authenticated
USING (
  person_id IN (SELECT id FROM person WHERE auth_user_id = auth.uid())
  OR household_group_id IN (
    SELECT household_group_id FROM household_members hm
    JOIN person p ON hm.person_id = p.id
    WHERE p.auth_user_id = auth.uid()
  )
);

CREATE POLICY "Verifiers can view all members"
ON public.household_members FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'verifier'::app_role) OR
  has_role(auth.uid(), 'car_verifier'::app_role) OR
  has_role(auth.uid(), 'registrar'::app_role) OR
  has_role(auth.uid(), 'admin'::app_role)
);

-- =========================================
-- RLS POLICIES - EXTENDED CITIZEN_ADDRESS
-- =========================================
CREATE POLICY "Guardians can view dependent addresses"
ON public.citizen_address FOR SELECT
TO authenticated
USING (
  guardian_person_id IN (
    SELECT id FROM person WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Guardians can create dependent addresses"
ON public.citizen_address FOR INSERT
TO authenticated
WITH CHECK (
  dependent_id IN (
    SELECT id FROM household_dependents 
    WHERE guardian_user_id = auth.uid() 
    AND is_active = true
    AND claimed_own_account = false
  )
  AND declared_by_guardian = true
  AND guardian_person_id IN (
    SELECT id FROM person WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Guardians can update dependent addresses"
ON public.citizen_address FOR UPDATE
TO authenticated
USING (
  guardian_person_id IN (
    SELECT id FROM person WHERE auth_user_id = auth.uid()
  )
  AND dependent_id IN (
    SELECT id FROM household_dependents 
    WHERE guardian_user_id = auth.uid()
    AND claimed_own_account = false
  )
);

CREATE POLICY "Household members can view group addresses"
ON public.citizen_address FOR SELECT
TO authenticated
USING (
  household_group_id IN (
    SELECT household_group_id FROM household_members hm
    JOIN person p ON hm.person_id = p.id
    WHERE p.auth_user_id = auth.uid()
  )
);

-- =========================================
-- RLS POLICIES - AUDIT TABLES
-- =========================================
CREATE POLICY "Guardians can view dependent audit logs"
ON public.dependent_authorization_audit FOR SELECT
TO authenticated
USING (
  dependent_id IN (
    SELECT id FROM household_dependents WHERE guardian_user_id = auth.uid()
  )
);

CREATE POLICY "System can create dependent audit logs"
ON public.dependent_authorization_audit FOR INSERT
TO authenticated
WITH CHECK (performed_by = auth.uid());

CREATE POLICY "Household members can view household audit"
ON public.household_activity_audit FOR SELECT
TO authenticated
USING (
  household_group_id IN (
    SELECT household_group_id FROM household_members hm
    JOIN person p ON hm.person_id = p.id
    WHERE p.auth_user_id = auth.uid()
  )
);

CREATE POLICY "System can create household audit logs"
ON public.household_activity_audit FOR INSERT
TO authenticated
WITH CHECK (performed_by = auth.uid());

CREATE POLICY "Admins can view all audits"
ON public.dependent_authorization_audit FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all household audits"
ON public.household_activity_audit FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));