-- Create Citizen Address Repository (CAR) module
-- Step 1: Enums and base tables (fixed)

-- Create enums for CAR module
CREATE TYPE address_kind AS ENUM ('PRIMARY', 'SECONDARY', 'OTHER');
CREATE TYPE address_scope AS ENUM ('BUILDING', 'UNIT');
CREATE TYPE occupant_type AS ENUM ('OWNER', 'TENANT', 'FAMILY', 'OTHER');
CREATE TYPE address_status AS ENUM ('SELF_DECLARED', 'CONFIRMED', 'REJECTED');

-- Person table - core identity management
CREATE TABLE public.person (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    national_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Citizen address table - links people to NAR addresses
CREATE TABLE public.citizen_address (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
    address_kind address_kind NOT NULL DEFAULT 'OTHER',
    scope address_scope NOT NULL,
    uac TEXT NOT NULL,
    unit_uac TEXT,
    occupant occupant_type DEFAULT 'OTHER',
    status address_status DEFAULT 'SELF_DECLARED',
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    source TEXT DEFAULT 'SELF_SERVICE',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraint: unit_uac required if scope is UNIT
    CONSTRAINT chk_scope CHECK (
        (scope = 'UNIT' AND unit_uac IS NOT NULL) OR
        (scope = 'BUILDING' AND unit_uac IS NULL)
    )
);

-- Audit table for all address-related events
CREATE TABLE public.citizen_address_event (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES public.person(id) ON DELETE CASCADE,
    citizen_address_id UUID REFERENCES public.citizen_address(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'ADD','MOVE','VERIFY','REJECT','RETIRE'
    at TIMESTAMPTZ DEFAULT now(),
    actor_id UUID REFERENCES auth.users(id),
    payload JSONB DEFAULT '{}'::jsonb
);

-- Webhook delivery tracking
CREATE TABLE public.webhook_delivery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    url TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING','SUCCESS','FAILED','RETRYING'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    next_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ
);

-- Indexes for performance (fixed GIN index)
CREATE INDEX idx_citizen_address_person_kind ON public.citizen_address(person_id, address_kind);
CREATE INDEX idx_citizen_address_uac ON public.citizen_address(uac);
CREATE INDEX idx_citizen_address_unit_uac ON public.citizen_address(unit_uac) WHERE unit_uac IS NOT NULL;
CREATE INDEX idx_citizen_address_current ON public.citizen_address(person_id) WHERE effective_to IS NULL;
CREATE INDEX idx_citizen_address_event_person ON public.citizen_address_event(person_id, at DESC);
CREATE INDEX idx_webhook_delivery_retry ON public.webhook_delivery(next_retry_at) WHERE status = 'PENDING' AND next_retry_at IS NOT NULL;

-- Unique constraint: only one active primary address per person
CREATE UNIQUE INDEX idx_one_active_primary 
ON public.citizen_address(person_id) 
WHERE address_kind = 'PRIMARY' AND effective_to IS NULL;

-- Enable RLS on all tables
ALTER TABLE public.person ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_address_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_delivery ENABLE ROW LEVEL SECURITY;

-- Create views for easier access
CREATE VIEW public.my_person AS
SELECT * FROM public.person WHERE auth_user_id = auth.uid();

CREATE VIEW public.current_citizen_addresses AS
SELECT * FROM public.citizen_address WHERE effective_to IS NULL;

-- Triggers for updated_at
CREATE TRIGGER update_person_updated_at
    BEFORE UPDATE ON public.person
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_citizen_address_updated_at
    BEFORE UPDATE ON public.citizen_address
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();