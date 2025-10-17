// Basic types for Citizen Address Repository (CAR) module

export type AddressKind = 'PRIMARY' | 'SECONDARY' | 'OTHER';
export type AddressScope = 'BUILDING' | 'UNIT';
export type OccupantType = 'OWNER' | 'TENANT' | 'FAMILY' | 'OTHER';
export type AddressStatus = 'SELF_DECLARED' | 'CONFIRMED' | 'REJECTED';

// New household and dependent system types
export type DependentType = 'MINOR' | 'ADULT_STUDENT' | 'ADULT_DISABLED' | 'ELDERLY_PARENT' | 'OTHER_ADULT';
export type CustodyType = 'FULL' | 'SHARED' | 'PARTIAL' | 'TEMPORARY';
export type HouseholdStatus = 'ACTIVE' | 'TRANSFERRED' | 'DISSOLVED' | 'MERGED';
export type MembershipStatus = 'ACTIVE' | 'MOVED_OUT' | 'TEMPORARY' | 'VISITING';
export type HouseholdRole = 'HEAD' | 'CO_HEAD' | 'MEMBER' | 'DEPENDENT' | 'TEMPORARY_RESIDENT';

export interface Person {
  id: string;
  auth_user_id: string | null;
  national_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HouseholdDependent {
  id: string;
  guardian_person_id: string;
  guardian_user_id: string;
  full_name: string;
  date_of_birth: string;
  relationship_to_guardian: string;
  gender?: string;
  birth_certificate_number?: string;
  health_card_number?: string;
  school_id_number?: string;
  dependent_type: DependentType;
  dependency_reason?: string;
  expected_dependency_end_date?: string;
  disability_certificate_number?: string;
  student_enrollment_number?: string;
  university_name?: string;
  is_active: boolean;
  reached_majority_age: boolean;
  notified_at_18?: string;
  claimed_own_account: boolean;
  claimed_account_user_id?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  notes?: string;
}

export interface HouseholdMember {
  id: string;
  household_group_id: string;
  person_id?: string;
  dependent_id?: string;
  relationship_to_head: string;
  is_primary_household: boolean;
  residence_percentage?: number;
  custody_type?: CustodyType;
  custody_schedule?: any;
  membership_status: MembershipStatus;
  household_role: HouseholdRole;
  moved_in_date?: string;
  moved_out_date?: string;
  added_at: string;
  added_by: string;
  notes?: string;
}

export interface HouseholdGroup {
  id: string;
  household_head_person_id: string;
  household_head_user_id: string;
  household_name: string;
  primary_uac: string;
  primary_unit_uac?: string;
  description?: string;
  is_active: boolean;
  verified_by_car: boolean;
  verified_at?: string;
  verified_by?: string;
  household_status: HouseholdStatus;
  previous_household_id?: string;
  household_succession_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CitizenAddress {
  id: string;
  person_id?: string;
  dependent_id?: string;
  declared_by_guardian?: boolean;
  guardian_person_id?: string;
  household_group_id?: string;
  address_kind: AddressKind;
  scope: AddressScope;
  uac: string;
  unit_uac: string | null;
  occupant: OccupantType;
  status: AddressStatus;
  effective_from: string;
  effective_to: string | null;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Additional fields for admin review
  flagged?: boolean;
  flag_reason?: string | null;
  flagged_at?: string | null;
  flagged_by?: string | null;
  // NAR integration fields (from citizen_address_with_details view)
  street?: string;
  city?: string;
  region?: string;
  country?: string;
  building?: string;
  address_type?: string;
  address_description?: string;
  latitude?: number;
  longitude?: number;
  nar_verified?: boolean;
  nar_public?: boolean;
  // Manual review queue fields
  verification_status?: 'UAC_NOT_FOUND' | 'UAC_UNVERIFIED' | 'UAC_VERIFIED';
}

export interface AddressInput {
  scope: AddressScope;
  uac: string;
  unit_uac?: string;
  effective_from?: string;
}
