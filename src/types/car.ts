// Basic types for Citizen Address Repository (CAR) module

export type AddressKind = 'PRIMARY' | 'SECONDARY' | 'OTHER';
export type AddressScope = 'BUILDING' | 'UNIT';
export type OccupantType = 'OWNER' | 'TENANT' | 'FAMILY' | 'OTHER';
export type AddressStatus = 'SELF_DECLARED' | 'CONFIRMED' | 'REJECTED';

export interface Person {
  id: string;
  auth_user_id: string | null;
  national_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CitizenAddress {
  id: string;
  person_id: string;
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
  street?: string;
  city?: string;
  region?: string;
}

export interface AddressInput {
  scope: AddressScope;
  uac: string;
  unit_uac?: string;
  effective_from?: string;
}