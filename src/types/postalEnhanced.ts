// Enhanced Postal Module Types

// New Enums
export type NotificationType = 
  | 'order_created'
  | 'dispatched'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed_delivery'
  | 'pickup_reminder'
  | 'return_initiated'
  | 'cod_reminder';

export type NotificationChannel = 'email' | 'sms' | 'push';

export type TimeWindow = 'morning' | 'afternoon' | 'evening' | 'any';

export type PickupStatus = 
  | 'pending'
  | 'scheduled'
  | 'assigned'
  | 'en_route'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type ReturnReason = 
  | 'wrong_item'
  | 'damaged'
  | 'refused'
  | 'undeliverable'
  | 'customer_return'
  | 'address_incorrect'
  | 'other';

export type ReturnStatus = 
  | 'initiated'
  | 'label_generated'
  | 'pickup_scheduled'
  | 'in_transit'
  | 'received'
  | 'processed'
  | 'cancelled';

export type LabelType = 'standard' | 'express' | 'registered' | 'return';

export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

export type CODStatus = 'pending' | 'collected' | 'remitted' | 'failed' | 'waived';

// Interfaces
export interface PostalNotification {
  id: string;
  order_id: string | null;
  notification_type: NotificationType;
  channel: NotificationChannel;
  recipient_phone: string | null;
  recipient_email: string | null;
  message_subject: string | null;
  message_content: string;
  sent_at: string | null;
  delivered_at: string | null;
  status: string;
  error_message: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DeliveryPreferences {
  id: string;
  user_id: string;
  address_uac: string;
  preferred_time_window: TimeWindow;
  safe_drop_location: string | null;
  safe_drop_authorized: boolean;
  alternate_recipient_name: string | null;
  alternate_recipient_phone: string | null;
  alternate_recipient_authorized: boolean;
  hold_at_post_office: boolean;
  allow_neighbor_delivery: boolean;
  notification_email: boolean;
  notification_sms: boolean;
  notification_push: boolean;
  special_instructions: string | null;
  created_at: string;
  updated_at: string;
}

export interface PickupRequest {
  id: string;
  request_number: string;
  requester_id: string;
  pickup_address_uac: string;
  contact_name: string;
  contact_phone: string | null;
  contact_email: string | null;
  package_description: string | null;
  package_count: number;
  estimated_weight_grams: number | null;
  preferred_date: string;
  preferred_time_window: TimeWindow;
  status: PickupStatus;
  assigned_agent_id: string | null;
  assigned_by: string | null;
  assigned_at: string | null;
  completed_at: string | null;
  pickup_notes: string | null;
  proof_photo_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  address?: {
    street: string;
    city: string;
    region: string;
  };
  agent?: {
    full_name: string;
    phone: string | null;
  };
}

export interface ReturnOrder {
  id: string;
  return_number: string;
  original_order_id: string | null;
  return_reason: ReturnReason;
  return_reason_details: string | null;
  return_tracking_number: string | null;
  return_label_url: string | null;
  status: ReturnStatus;
  pickup_requested: boolean;
  pickup_request_id: string | null;
  initiated_by: string;
  processed_by: string | null;
  processed_at: string | null;
  received_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  original_order?: {
    order_number: string;
    recipient_name: string;
    recipient_address_uac: string;
  };
}

export interface PostalLabel {
  id: string;
  order_id: string | null;
  return_order_id: string | null;
  label_type: LabelType;
  s10_tracking_number: string | null;
  barcode_data: string;
  qr_code_data: string | null;
  label_pdf_url: string | null;
  generated_by: string;
  generated_at: string;
  printed_at: string | null;
  printed_by: string | null;
  voided_at: string | null;
  voided_by: string | null;
  metadata: Record<string, unknown>;
}

export interface BulkImportJob {
  id: string;
  job_number: string;
  uploaded_by: string;
  file_name: string;
  file_url: string | null;
  total_rows: number;
  processed_rows: number;
  success_count: number;
  error_count: number;
  status: ImportStatus;
  error_summary: Array<{ row: number; error: string }>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface BulkImportOrder {
  id: string;
  import_job_id: string;
  row_number: number;
  raw_data: Record<string, string>;
  order_id: string | null;
  status: string;
  error_message: string | null;
  processed_at: string | null;
}

export interface CODTransaction {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  collection_status: CODStatus;
  payment_method: string | null;
  collected_by: string | null;
  collected_at: string | null;
  receipt_number: string | null;
  remitted_to: string | null;
  remittance_date: string | null;
  remittance_reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Form Input Types
export interface CreatePickupRequestInput {
  pickup_address_uac: string;
  contact_name: string;
  contact_phone?: string;
  contact_email?: string;
  package_description?: string;
  package_count?: number;
  estimated_weight_grams?: number;
  preferred_date: string;
  preferred_time_window?: TimeWindow;
  pickup_notes?: string;
}

export interface CreateReturnOrderInput {
  original_order_id: string;
  return_reason: ReturnReason;
  return_reason_details?: string;
  pickup_requested?: boolean;
  notes?: string;
}

export interface UpdateDeliveryPreferencesInput {
  address_uac: string;
  preferred_time_window?: TimeWindow;
  safe_drop_location?: string;
  safe_drop_authorized?: boolean;
  alternate_recipient_name?: string;
  alternate_recipient_phone?: string;
  alternate_recipient_authorized?: boolean;
  hold_at_post_office?: boolean;
  allow_neighbor_delivery?: boolean;
  notification_email?: boolean;
  notification_sms?: boolean;
  notification_push?: boolean;
  special_instructions?: string;
}

export interface BulkImportRowData {
  sender_name: string;
  sender_phone?: string;
  recipient_name: string;
  recipient_address_uac: string;
  recipient_phone?: string;
  recipient_email?: string;
  package_type: string;
  weight_grams?: string;
  declared_value?: string;
  priority_level?: string;
  notes?: string;
  cod_amount?: string;
}

export interface CODCollectionInput {
  order_id: string;
  payment_method: string;
  notes?: string;
}
