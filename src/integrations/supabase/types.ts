export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      address_requests: {
        Row: {
          address_type: string
          auto_verification_analysis: Json | null
          auto_verification_score: number | null
          auto_verified_at: string | null
          building: string | null
          city: string
          claimant_type: string
          country: string
          created_at: string
          description: string | null
          flag_reason: string | null
          flagged: boolean
          flagged_at: string | null
          flagged_by: string | null
          id: string
          justification: string
          latitude: number | null
          longitude: number | null
          photo_url: string | null
          proof_of_ownership_url: string | null
          region: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_notes: string | null
          rejection_reason: string | null
          requires_manual_review: boolean | null
          resubmission_count: number | null
          resubmission_of: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          street: string
          updated_at: string
          user_id: string
          verification_analysis: Json | null
          verification_recommendations: string[] | null
        }
        Insert: {
          address_type?: string
          auto_verification_analysis?: Json | null
          auto_verification_score?: number | null
          auto_verified_at?: string | null
          building?: string | null
          city: string
          claimant_type?: string
          country: string
          created_at?: string
          description?: string | null
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          justification: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          proof_of_ownership_url?: string | null
          region: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_notes?: string | null
          rejection_reason?: string | null
          requires_manual_review?: boolean | null
          resubmission_count?: number | null
          resubmission_of?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          street: string
          updated_at?: string
          user_id: string
          verification_analysis?: Json | null
          verification_recommendations?: string[] | null
        }
        Update: {
          address_type?: string
          auto_verification_analysis?: Json | null
          auto_verification_score?: number | null
          auto_verified_at?: string | null
          building?: string | null
          city?: string
          claimant_type?: string
          country?: string
          created_at?: string
          description?: string | null
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          justification?: string
          latitude?: number | null
          longitude?: number | null
          photo_url?: string | null
          proof_of_ownership_url?: string | null
          region?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_notes?: string | null
          rejection_reason?: string | null
          requires_manual_review?: boolean | null
          resubmission_count?: number | null
          resubmission_of?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          street?: string
          updated_at?: string
          user_id?: string
          verification_analysis?: Json | null
          verification_recommendations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "address_requests_resubmission_of_fkey"
            columns: ["resubmission_of"]
            isOneToOne: false
            referencedRelation: "address_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      addresses: {
        Row: {
          address_type: string
          building: string | null
          city: string
          country: string
          created_at: string
          description: string | null
          flag_reason: string | null
          flagged: boolean
          flagged_at: string | null
          flagged_by: string | null
          id: string
          latitude: number
          longitude: number
          photo_url: string | null
          public: boolean
          region: string
          rejected_at: string | null
          rejected_by: string | null
          rejection_notes: string | null
          rejection_reason: string | null
          street: string
          uac: string
          updated_at: string
          user_id: string
          verification_analysis: Json | null
          verification_recommendations: string[] | null
          verified: boolean
        }
        Insert: {
          address_type?: string
          building?: string | null
          city: string
          country: string
          created_at?: string
          description?: string | null
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          latitude: number
          longitude: number
          photo_url?: string | null
          public?: boolean
          region: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_notes?: string | null
          rejection_reason?: string | null
          street: string
          uac: string
          updated_at?: string
          user_id: string
          verification_analysis?: Json | null
          verification_recommendations?: string[] | null
          verified?: boolean
        }
        Update: {
          address_type?: string
          building?: string | null
          city?: string
          country?: string
          created_at?: string
          description?: string | null
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          latitude?: number
          longitude?: number
          photo_url?: string | null
          public?: boolean
          region?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_notes?: string | null
          rejection_reason?: string | null
          street?: string
          uac?: string
          updated_at?: string
          user_id?: string
          verification_analysis?: Json | null
          verification_recommendations?: string[] | null
          verified?: boolean
        }
        Relationships: []
      }
      emergency_incident_logs: {
        Row: {
          action: string
          details: Json | null
          id: string
          incident_id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          details?: Json | null
          id?: string
          incident_id: string
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          details?: Json | null
          id?: string
          incident_id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_incident_logs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "emergency_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_incidents: {
        Row: {
          assigned_operator_id: string | null
          assigned_units: string[] | null
          backup_requested: boolean | null
          backup_requested_at: string | null
          backup_requesting_unit: string | null
          city: string | null
          closed_at: string | null
          country: string | null
          created_at: string
          dispatch_system_id: string | null
          dispatched_at: string | null
          dispatcher_notes: string | null
          emergency_type: string
          encrypted_address: string | null
          encrypted_contact_info: string | null
          encrypted_latitude: string | null
          encrypted_longitude: string | null
          encrypted_message: string
          external_case_id: string | null
          id: string
          incident_message: string | null
          incident_number: string
          incident_uac: string | null
          language_code: string | null
          location_accuracy: number | null
          location_address: string | null
          location_latitude: number | null
          location_longitude: number | null
          priority_level: number
          region: string | null
          reported_at: string
          reporter_contact_info: string | null
          reporter_id: string | null
          resolved_at: string | null
          responded_at: string | null
          status: string
          street: string | null
          updated_at: string
        }
        Insert: {
          assigned_operator_id?: string | null
          assigned_units?: string[] | null
          backup_requested?: boolean | null
          backup_requested_at?: string | null
          backup_requesting_unit?: string | null
          city?: string | null
          closed_at?: string | null
          country?: string | null
          created_at?: string
          dispatch_system_id?: string | null
          dispatched_at?: string | null
          dispatcher_notes?: string | null
          emergency_type: string
          encrypted_address?: string | null
          encrypted_contact_info?: string | null
          encrypted_latitude?: string | null
          encrypted_longitude?: string | null
          encrypted_message: string
          external_case_id?: string | null
          id?: string
          incident_message?: string | null
          incident_number: string
          incident_uac?: string | null
          language_code?: string | null
          location_accuracy?: number | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          priority_level?: number
          region?: string | null
          reported_at?: string
          reporter_contact_info?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          status?: string
          street?: string | null
          updated_at?: string
        }
        Update: {
          assigned_operator_id?: string | null
          assigned_units?: string[] | null
          backup_requested?: boolean | null
          backup_requested_at?: string | null
          backup_requesting_unit?: string | null
          city?: string | null
          closed_at?: string | null
          country?: string | null
          created_at?: string
          dispatch_system_id?: string | null
          dispatched_at?: string | null
          dispatcher_notes?: string | null
          emergency_type?: string
          encrypted_address?: string | null
          encrypted_contact_info?: string | null
          encrypted_latitude?: string | null
          encrypted_longitude?: string | null
          encrypted_message?: string
          external_case_id?: string | null
          id?: string
          incident_message?: string | null
          incident_number?: string
          incident_uac?: string | null
          language_code?: string | null
          location_accuracy?: number | null
          location_address?: string | null
          location_latitude?: number | null
          location_longitude?: number | null
          priority_level?: number
          region?: string | null
          reported_at?: string
          reporter_contact_info?: string | null
          reporter_id?: string | null
          resolved_at?: string | null
          responded_at?: string | null
          status?: string
          street?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      emergency_notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          incident_id: string | null
          message: string
          metadata: Json | null
          priority_level: number
          read: boolean
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          incident_id?: string | null
          message: string
          metadata?: Json | null
          priority_level?: number
          read?: boolean
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          incident_id?: string | null
          message?: string
          metadata?: Json | null
          priority_level?: number
          read?: boolean
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_operator_sessions: {
        Row: {
          active_incidents: string[] | null
          created_at: string
          id: string
          operator_id: string
          session_end: string | null
          session_start: string
          status: string
          updated_at: string
        }
        Insert: {
          active_incidents?: string[] | null
          created_at?: string
          id?: string
          operator_id: string
          session_end?: string | null
          session_start?: string
          status?: string
          updated_at?: string
        }
        Update: {
          active_incidents?: string[] | null
          created_at?: string
          id?: string
          operator_id?: string
          session_end?: string | null
          session_start?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      emergency_unit_members: {
        Row: {
          id: string
          is_lead: boolean
          joined_at: string
          officer_id: string
          role: string
          unit_id: string
        }
        Insert: {
          id?: string
          is_lead?: boolean
          joined_at?: string
          officer_id: string
          role?: string
          unit_id: string
        }
        Update: {
          id?: string
          is_lead?: boolean
          joined_at?: string
          officer_id?: string
          role?: string
          unit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emergency_unit_members_officer_id_fkey"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "emergency_unit_members_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "emergency_units"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_units: {
        Row: {
          coverage_city: string | null
          coverage_region: string | null
          created_at: string
          current_location: string | null
          heading: number | null
          id: string
          location_accuracy: number | null
          location_latitude: number | null
          location_longitude: number | null
          location_updated_at: string | null
          radio_frequency: string | null
          status: string
          unit_code: string
          unit_name: string
          unit_type: string
          updated_at: string
          vehicle_id: string | null
        }
        Insert: {
          coverage_city?: string | null
          coverage_region?: string | null
          created_at?: string
          current_location?: string | null
          heading?: number | null
          id?: string
          location_accuracy?: number | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_updated_at?: string | null
          radio_frequency?: string | null
          status?: string
          unit_code: string
          unit_name: string
          unit_type?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Update: {
          coverage_city?: string | null
          coverage_region?: string | null
          created_at?: string
          current_location?: string | null
          heading?: number | null
          id?: string
          location_accuracy?: number | null
          location_latitude?: number | null
          location_longitude?: number | null
          location_updated_at?: string | null
          radio_frequency?: string | null
          status?: string
          unit_code?: string
          unit_name?: string
          unit_type?: string
          updated_at?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          organization: string | null
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          organization?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provinces: {
        Row: {
          area: number | null
          code: string
          created_at: string
          id: string
          name: string
          population: number | null
          region: string
          updated_at: string
        }
        Insert: {
          area?: number | null
          code: string
          created_at?: string
          id?: string
          name: string
          population?: number | null
          region: string
          updated_at?: string
        }
        Update: {
          area?: number | null
          code?: string
          created_at?: string
          id?: string
          name?: string
          population?: number | null
          region?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_fallback_queue: {
        Row: {
          attempts: number | null
          created_at: string
          id: string
          location_data: string | null
          max_attempts: number | null
          message_content: string
          phone_number: string
          priority: number
          processed_at: string | null
          provider_response: Json | null
          status: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string
          id?: string
          location_data?: string | null
          max_attempts?: number | null
          message_content: string
          phone_number: string
          priority?: number
          processed_at?: string | null
          provider_response?: Json | null
          status?: string
        }
        Update: {
          attempts?: number | null
          created_at?: string
          id?: string
          location_data?: string | null
          max_attempts?: number | null
          message_content?: string
          phone_number?: string
          priority?: number
          processed_at?: string | null
          provider_response?: Json | null
          status?: string
        }
        Relationships: []
      }
      user_role_metadata: {
        Row: {
          created_at: string | null
          id: string
          scope_type: string
          scope_value: string
          updated_at: string | null
          user_role_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          scope_type: string
          scope_value: string
          updated_at?: string | null
          user_role_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          scope_type?: string
          scope_value?: string
          updated_at?: string | null
          user_role_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_role_metadata_user_role_id_fkey"
            columns: ["user_role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_address_request: {
        Args: { p_approved_by?: string; p_request_id: string }
        Returns: string
      }
      flag_address_for_review: {
        Args:
          | {
              p_address_id: string
              p_analysis?: Json
              p_flagged_by?: string
              p_reason: string
              p_recommendations?: string[]
            }
          | { p_address_id: string; p_flagged_by?: string; p_reason: string }
        Returns: boolean
      }
      flag_address_request_for_review: {
        Args: { p_flagged_by?: string; p_reason: string; p_request_id: string }
        Returns: boolean
      }
      generate_incident_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_unified_uac_unique: {
        Args: {
          p_address_id: string
          p_city: string
          p_country: string
          p_region: string
        }
        Returns: string
      }
      get_available_officers: {
        Args: Record<PropertyKey, never>
        Returns: {
          assignment_status: string
          current_unit: string
          full_name: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }[]
      }
      get_flagged_addresses_queue: {
        Args: Record<PropertyKey, never>
        Returns: {
          address_type: string
          building: string
          city: string
          country: string
          created_at: string
          description: string
          flag_reason: string
          flagged: boolean
          flagged_at: string
          flagged_by: string
          id: string
          justification: string
          latitude: number
          longitude: number
          photo_url: string
          public: boolean
          region: string
          source_type: string
          status: string
          street: string
          uac: string
          updated_at: string
          user_id: string
          verification_analysis: Json
          verification_recommendations: string[]
          verified: boolean
        }[]
      }
      get_review_queue: {
        Args: Record<PropertyKey, never>
        Returns: {
          address_type: string
          building: string
          city: string
          country: string
          created_at: string
          description: string
          flag_reason: string
          flagged: boolean
          flagged_at: string
          flagged_by: string
          id: string
          justification: string
          latitude: number
          longitude: number
          photo_url: string
          public: boolean
          region: string
          source_type: string
          status: string
          street: string
          uac: string
          updated_at: string
          user_id: string
          verification_analysis: Json
          verification_recommendations: string[]
          verified: boolean
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role_with_scope: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _scope_type?: string
          _scope_value?: string
          _user_id: string
        }
        Returns: boolean
      }
      reject_address_request_with_feedback: {
        Args: {
          p_rejected_by?: string
          p_rejection_notes?: string
          p_rejection_reason: string
          p_request_id: string
        }
        Returns: boolean
      }
      reject_flagged_address_with_feedback: {
        Args: {
          p_address_id: string
          p_rejected_by?: string
          p_rejection_notes?: string
          p_rejection_reason: string
        }
        Returns: boolean
      }
      resubmit_address_request: {
        Args: {
          p_address_type?: string
          p_building?: string
          p_city: string
          p_country: string
          p_description?: string
          p_justification?: string
          p_latitude: number
          p_longitude: number
          p_original_request_id: string
          p_photo_url?: string
          p_region: string
          p_street: string
          p_user_id: string
        }
        Returns: string
      }
      search_addresses_safely: {
        Args: { search_query: string }
        Returns: {
          address_type: string
          building: string
          city: string
          country: string
          created_at: string
          description: string
          latitude: number
          longitude: number
          public: boolean
          region: string
          street: string
          uac: string
          verified: boolean
        }[]
      }
      unflag_address: {
        Args: { p_address_id: string; p_unflagged_by?: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "citizen"
        | "property_claimant"
        | "field_agent"
        | "verifier"
        | "registrar"
        | "ndaa_admin"
        | "partner"
        | "auditor"
        | "data_steward"
        | "support"
        | "police_operator"
        | "police_supervisor"
        | "police_dispatcher"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "moderator",
        "user",
        "citizen",
        "property_claimant",
        "field_agent",
        "verifier",
        "registrar",
        "ndaa_admin",
        "partner",
        "auditor",
        "data_steward",
        "support",
        "police_operator",
        "police_supervisor",
        "police_dispatcher",
      ],
    },
  },
} as const
