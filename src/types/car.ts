// Types for Citizen Address Repository (CAR) module

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
}

export interface CitizenAddressEvent {
  id: string;
  person_id: string;
  citizen_address_id: string | null;
  event_type: string;
  at: string;
  actor_id: string | null;
  payload: Record<string, any>;
}

export interface AddressInput {
  scope: AddressScope;
  uac: string;
  unit_uac?: string | null;
  occupant?: OccupantType;
  effective_from?: string;
}

export interface ResidentInfo {
  person_id: string;
  address_id: string;
  address_kind: AddressKind;
  scope: AddressScope;
  unit_uac: string | null;
  occupant: OccupantType;
  status: AddressStatus;
  effective_from: string;
  effective_to: string | null;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// Address selection types
export interface AddressOption {
  uac: string;
  unit_uac?: string;
  display_name: string;
  full_address: string;
  scope: AddressScope;
  has_units?: boolean;
  units?: UnitOption[];
}

export interface UnitOption {
  unit_uac: string;
  unit_label: string;
  display_name: string;
}

// Form types
export interface SetPrimaryAddressForm {
  scope: AddressScope;
  uac: string;
  unit_uac?: string;
  occupant: OccupantType;
  effective_from: string;
}

export interface AddSecondaryAddressForm {
  scope: AddressScope;
  uac: string;
  unit_uac?: string;
  occupant: OccupantType;
}