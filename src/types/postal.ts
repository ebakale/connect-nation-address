// Government Postal Delivery Module Types

export type DeliveryStatus = 
  | 'pending_intake'
  | 'ready_for_assignment'
  | 'assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'address_not_found'
  | 'returned_to_sender'
  | 'cancelled';

export type PackageType = 
  | 'letter'
  | 'small_parcel'
  | 'medium_parcel'
  | 'large_parcel'
  | 'document'
  | 'registered_mail'
  | 'express'
  | 'government_document';

export interface DeliveryOrder {
  id: string;
  order_number: string;
  
  // Sender info
  sender_name: string;
  sender_address_uac: string | null;
  sender_branch: string | null;
  sender_phone: string | null;
  
  // Recipient info
  recipient_name: string;
  recipient_address_uac: string;
  recipient_phone: string | null;
  recipient_email: string | null;
  
  // Package info
  package_type: PackageType;
  weight_grams: number | null;
  dimensions_cm: string | null;
  declared_value: number | null;
  notes: string | null;
  special_instructions: string | null;
  requires_signature: boolean;
  requires_id_verification: boolean;
  
  // Status
  status: DeliveryStatus;
  priority_level: number;
  
  // Tracking
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Delivery window
  scheduled_date: string | null;
  delivery_deadline: string | null;
  
  // Completion info
  completed_at: string | null;
  completed_by: string | null;
  
  // Joined data
  recipient_address?: {
    street: string;
    city: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  assignment?: DeliveryAssignment;
  creator?: {
    full_name: string;
    email: string;
  };
}

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  agent_id: string;
  assigned_by: string;
  assigned_at: string;
  route_sequence: number | null;
  estimated_delivery_time: string | null;
  acknowledged_at: string | null;
  started_at: string | null;
  notes: string | null;
  
  // Joined data
  agent?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  assigner?: {
    full_name: string;
  };
}

export interface DeliveryStatusLog {
  id: string;
  order_id: string;
  previous_status: DeliveryStatus | null;
  new_status: DeliveryStatus;
  changed_by: string;
  changed_at: string;
  reason: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  location_accuracy: number | null;
  
  // Joined data
  changer?: {
    full_name: string;
  };
}

export interface DeliveryProof {
  id: string;
  order_id: string;
  proof_type: 'signature' | 'photo' | 'id_verification' | 'recipient_absent_note';
  signature_data: string | null;
  photo_url: string | null;
  recipient_id_type: string | null;
  recipient_id_last_digits: string | null;
  received_by_name: string | null;
  relationship_to_recipient: string | null;
  latitude: number | null;
  longitude: number | null;
  captured_by: string;
  captured_at: string;
  notes: string | null;
}

export interface PostalAgent {
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  active_deliveries: number;
  completed_today: number;
}

export interface DeliveryStats {
  total_orders: number;
  pending_intake: number;
  ready_for_assignment: number;
  assigned: number;
  out_for_delivery: number;
  delivered: number;
  failed: number;
  returned: number;
  today_deliveries: number;
  today_completed: number;
}

// Form input types
export interface CreateDeliveryOrderInput {
  sender_name: string;
  sender_address_uac?: string;
  sender_branch?: string;
  sender_phone?: string;
  recipient_name: string;
  recipient_address_uac: string;
  recipient_phone?: string;
  recipient_email?: string;
  package_type: PackageType;
  weight_grams?: number;
  dimensions_cm?: string;
  declared_value?: number;
  notes?: string;
  special_instructions?: string;
  requires_signature?: boolean;
  requires_id_verification?: boolean;
  priority_level?: number;
  scheduled_date?: string;
  delivery_deadline?: string;
}

export interface UpdateDeliveryStatusInput {
  order_id: string;
  new_status: DeliveryStatus;
  reason?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export interface AssignDeliveryInput {
  order_id: string;
  agent_id: string;
  route_sequence?: number;
  estimated_delivery_time?: string;
  notes?: string;
}
