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
      address_audit_log: {
        Row: {
          action: string
          address_id: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          timestamp: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          address_id?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          address_id?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "address_audit_log_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
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
          intended_occupant_id: string | null
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
          request_type: string | null
          requester_id: string
          requires_manual_review: boolean | null
          resubmission_count: number | null
          resubmission_of: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          street: string
          updated_at: string
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
          intended_occupant_id?: string | null
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
          request_type?: string | null
          requester_id: string
          requires_manual_review?: boolean | null
          resubmission_count?: number | null
          resubmission_of?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          street: string
          updated_at?: string
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
          intended_occupant_id?: string | null
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
          request_type?: string | null
          requester_id?: string
          requires_manual_review?: boolean | null
          resubmission_count?: number | null
          resubmission_of?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          street?: string
          updated_at?: string
          verification_analysis?: Json | null
          verification_recommendations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "address_requests_intended_occupant_id_fkey"
            columns: ["intended_occupant_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_requests_intended_occupant_id_fkey"
            columns: ["intended_occupant_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "address_requests_resubmission_of_fkey"
            columns: ["resubmission_of"]
            isOneToOne: false
            referencedRelation: "address_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      address_search_audit: {
        Row: {
          accessed_person_ids: string[] | null
          accessed_uacs: string[] | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          purpose_details: string | null
          results_count: number
          search_purpose: Database["public"]["Enums"]["search_purpose_type"]
          search_query: string
          searched_at: string
          searcher_user_id: string
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          accessed_person_ids?: string[] | null
          accessed_uacs?: string[] | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          purpose_details?: string | null
          results_count?: number
          search_purpose: Database["public"]["Enums"]["search_purpose_type"]
          search_query: string
          searched_at?: string
          searcher_user_id: string
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          accessed_person_ids?: string[] | null
          accessed_uacs?: string[] | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          purpose_details?: string | null
          results_count?: number
          search_purpose?: Database["public"]["Enums"]["search_purpose_type"]
          search_query?: string
          searched_at?: string
          searcher_user_id?: string
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      addresses: {
        Row: {
          address_type: string
          authority_type: string | null
          building: string | null
          business_address_type:
            | Database["public"]["Enums"]["business_address_type"]
            | null
          city: string
          completeness_score: number | null
          country: string
          created_at: string
          created_by_authority: string | null
          creation_source: string | null
          description: string | null
          flag_reason: string | null
          flagged: boolean
          flagged_at: string | null
          flagged_by: string | null
          format_validation: Json | null
          id: string
          iso_compliance_score: number | null
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
          verification_analysis: Json | null
          verification_recommendations: string[] | null
          verified: boolean
        }
        Insert: {
          address_type?: string
          authority_type?: string | null
          building?: string | null
          business_address_type?:
            | Database["public"]["Enums"]["business_address_type"]
            | null
          city: string
          completeness_score?: number | null
          country: string
          created_at?: string
          created_by_authority?: string | null
          creation_source?: string | null
          description?: string | null
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          format_validation?: Json | null
          id?: string
          iso_compliance_score?: number | null
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
          verification_analysis?: Json | null
          verification_recommendations?: string[] | null
          verified?: boolean
        }
        Update: {
          address_type?: string
          authority_type?: string | null
          building?: string | null
          business_address_type?:
            | Database["public"]["Enums"]["business_address_type"]
            | null
          city?: string
          completeness_score?: number | null
          country?: string
          created_at?: string
          created_by_authority?: string | null
          creation_source?: string | null
          description?: string | null
          flag_reason?: string | null
          flagged?: boolean
          flagged_at?: string | null
          flagged_by?: string | null
          format_validation?: Json | null
          id?: string
          iso_compliance_score?: number | null
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
          verification_analysis?: Json | null
          verification_recommendations?: string[] | null
          verified?: boolean
        }
        Relationships: []
      }
      authorized_verifiers: {
        Row: {
          authority_name: string
          authority_type: string
          authorization_document_url: string | null
          authorized_at: string | null
          authorized_by: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          jurisdiction: string
          license_number: string | null
          user_id: string
          verification_scope: string[]
        }
        Insert: {
          authority_name: string
          authority_type: string
          authorization_document_url?: string | null
          authorized_at?: string | null
          authorized_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          jurisdiction?: string
          license_number?: string | null
          user_id: string
          verification_scope?: string[]
        }
        Update: {
          authority_name?: string
          authority_type?: string
          authorization_document_url?: string | null
          authorized_at?: string | null
          authorized_by?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          jurisdiction?: string
          license_number?: string | null
          user_id?: string
          verification_scope?: string[]
        }
        Relationships: []
      }
      backup_metadata: {
        Row: {
          backup_id: string
          created_at: string | null
          format: string | null
          id: string
          record_counts: Json | null
          size_bytes: number | null
          status: string | null
          tables_included: string[]
          timestamp: string | null
        }
        Insert: {
          backup_id: string
          created_at?: string | null
          format?: string | null
          id?: string
          record_counts?: Json | null
          size_bytes?: number | null
          status?: string | null
          tables_included: string[]
          timestamp?: string | null
        }
        Update: {
          backup_id?: string
          created_at?: string | null
          format?: string | null
          id?: string
          record_counts?: Json | null
          size_bytes?: number | null
          status?: string | null
          tables_included?: string[]
          timestamp?: string | null
        }
        Relationships: []
      }
      car_permissions: {
        Row: {
          can_access_address_history: boolean | null
          can_manage_person_records: boolean | null
          can_merge_duplicate_persons: boolean | null
          can_review_citizen_addresses: boolean | null
          can_update_address_status: boolean | null
          can_verify_residency: boolean | null
          created_at: string | null
          created_by: string | null
          geographic_scope: string[] | null
          id: string
          jurisdiction_scope: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          can_access_address_history?: boolean | null
          can_manage_person_records?: boolean | null
          can_merge_duplicate_persons?: boolean | null
          can_review_citizen_addresses?: boolean | null
          can_update_address_status?: boolean | null
          can_verify_residency?: boolean | null
          created_at?: string | null
          created_by?: string | null
          geographic_scope?: string[] | null
          id?: string
          jurisdiction_scope?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          can_access_address_history?: boolean | null
          can_manage_person_records?: boolean | null
          can_merge_duplicate_persons?: boolean | null
          can_review_citizen_addresses?: boolean | null
          can_update_address_status?: boolean | null
          can_verify_residency?: boolean | null
          created_at?: string | null
          created_by?: string | null
          geographic_scope?: string[] | null
          id?: string
          jurisdiction_scope?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      car_quality_metrics: {
        Row: {
          address_coverage_by_region: Json | null
          average_verification_time_hours: number | null
          confirmed_addresses: number | null
          created_at: string | null
          date_measured: string | null
          duplicate_person_records: number | null
          id: string
          pending_verification_addresses: number | null
          quality_score_distribution: Json | null
          rejected_addresses: number | null
          total_citizen_addresses: number | null
        }
        Insert: {
          address_coverage_by_region?: Json | null
          average_verification_time_hours?: number | null
          confirmed_addresses?: number | null
          created_at?: string | null
          date_measured?: string | null
          duplicate_person_records?: number | null
          id?: string
          pending_verification_addresses?: number | null
          quality_score_distribution?: Json | null
          rejected_addresses?: number | null
          total_citizen_addresses?: number | null
        }
        Update: {
          address_coverage_by_region?: Json | null
          average_verification_time_hours?: number | null
          confirmed_addresses?: number | null
          created_at?: string | null
          date_measured?: string | null
          duplicate_person_records?: number | null
          id?: string
          pending_verification_addresses?: number | null
          quality_score_distribution?: Json | null
          rejected_addresses?: number | null
          total_citizen_addresses?: number | null
        }
        Relationships: []
      }
      citizen_address: {
        Row: {
          address_kind: Database["public"]["Enums"]["address_kind"]
          created_at: string | null
          created_by: string | null
          declared_by_guardian: boolean
          dependent_id: string | null
          effective_from: string
          effective_to: string | null
          guardian_person_id: string | null
          household_group_id: string | null
          id: string
          notes: string | null
          occupant: Database["public"]["Enums"]["occupant_type"] | null
          person_id: string | null
          privacy_level: Database["public"]["Enums"]["address_privacy_level"]
          privacy_updated_at: string | null
          privacy_updated_by: string | null
          scope: Database["public"]["Enums"]["address_scope"]
          searchable_by_public: boolean
          source: string | null
          status: Database["public"]["Enums"]["address_status"] | null
          uac: string
          unit_uac: string | null
          updated_at: string | null
        }
        Insert: {
          address_kind?: Database["public"]["Enums"]["address_kind"]
          created_at?: string | null
          created_by?: string | null
          declared_by_guardian?: boolean
          dependent_id?: string | null
          effective_from?: string
          effective_to?: string | null
          guardian_person_id?: string | null
          household_group_id?: string | null
          id?: string
          notes?: string | null
          occupant?: Database["public"]["Enums"]["occupant_type"] | null
          person_id?: string | null
          privacy_level?: Database["public"]["Enums"]["address_privacy_level"]
          privacy_updated_at?: string | null
          privacy_updated_by?: string | null
          scope: Database["public"]["Enums"]["address_scope"]
          searchable_by_public?: boolean
          source?: string | null
          status?: Database["public"]["Enums"]["address_status"] | null
          uac: string
          unit_uac?: string | null
          updated_at?: string | null
        }
        Update: {
          address_kind?: Database["public"]["Enums"]["address_kind"]
          created_at?: string | null
          created_by?: string | null
          declared_by_guardian?: boolean
          dependent_id?: string | null
          effective_from?: string
          effective_to?: string | null
          guardian_person_id?: string | null
          household_group_id?: string | null
          id?: string
          notes?: string | null
          occupant?: Database["public"]["Enums"]["occupant_type"] | null
          person_id?: string | null
          privacy_level?: Database["public"]["Enums"]["address_privacy_level"]
          privacy_updated_at?: string | null
          privacy_updated_by?: string | null
          scope?: Database["public"]["Enums"]["address_scope"]
          searchable_by_public?: boolean
          source?: string | null
          status?: Database["public"]["Enums"]["address_status"] | null
          uac?: string
          unit_uac?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_address_dependent_id_fkey"
            columns: ["dependent_id"]
            isOneToOne: false
            referencedRelation: "household_dependents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_guardian_person_id_fkey"
            columns: ["guardian_person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_guardian_person_id_fkey"
            columns: ["guardian_person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_household_group_id_fkey"
            columns: ["household_group_id"]
            isOneToOne: false
            referencedRelation: "household_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_address_event: {
        Row: {
          actor_id: string | null
          at: string | null
          citizen_address_id: string | null
          event_type: string
          id: string
          payload: Json | null
          person_id: string
        }
        Insert: {
          actor_id?: string | null
          at?: string | null
          citizen_address_id?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          person_id: string
        }
        Update: {
          actor_id?: string | null
          at?: string | null
          citizen_address_id?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "citizen_address_event_citizen_address_id_fkey"
            columns: ["citizen_address_id"]
            isOneToOne: false
            referencedRelation: "citizen_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_event_citizen_address_id_fkey"
            columns: ["citizen_address_id"]
            isOneToOne: false
            referencedRelation: "citizen_address_manual_review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_event_citizen_address_id_fkey"
            columns: ["citizen_address_id"]
            isOneToOne: false
            referencedRelation: "citizen_address_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_event_citizen_address_id_fkey"
            columns: ["citizen_address_id"]
            isOneToOne: false
            referencedRelation: "current_citizen_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_event_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_event_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      coverage_analytics: {
        Row: {
          addresses_published: number | null
          addresses_registered: number | null
          addresses_verified: number | null
          city: string
          coverage_percentage: number | null
          created_at: string | null
          id: string
          last_updated: string | null
          publication_rate: number | null
          region: string
          total_buildings_estimated: number | null
          updated_at: string | null
          verification_rate: number | null
        }
        Insert: {
          addresses_published?: number | null
          addresses_registered?: number | null
          addresses_verified?: number | null
          city: string
          coverage_percentage?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          publication_rate?: number | null
          region: string
          total_buildings_estimated?: number | null
          updated_at?: string | null
          verification_rate?: number | null
        }
        Update: {
          addresses_published?: number | null
          addresses_registered?: number | null
          addresses_verified?: number | null
          city?: string
          coverage_percentage?: number | null
          created_at?: string | null
          id?: string
          last_updated?: string | null
          publication_rate?: number | null
          region?: string
          total_buildings_estimated?: number | null
          updated_at?: string | null
          verification_rate?: number | null
        }
        Relationships: []
      }
      dependent_authorization_audit: {
        Row: {
          action: string
          dependent_id: string
          details: Json | null
          id: string
          ip_address: string | null
          performed_by: string
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          action: string
          dependent_id: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by: string
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          dependent_id?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          performed_by?: string
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dependent_authorization_audit_dependent_id_fkey"
            columns: ["dependent_id"]
            isOneToOne: false
            referencedRelation: "household_dependents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_verification_audit: {
        Row: {
          action: string
          document_hash: string
          id: string
          notes: string | null
          performed_by: string
          timestamp: string
          verification_details: Json | null
          verification_id: string | null
          verification_method: string | null
        }
        Insert: {
          action: string
          document_hash: string
          id?: string
          notes?: string | null
          performed_by: string
          timestamp?: string
          verification_details?: Json | null
          verification_id?: string | null
          verification_method?: string | null
        }
        Update: {
          action?: string
          document_hash?: string
          id?: string
          notes?: string | null
          performed_by?: string
          timestamp?: string
          verification_details?: Json | null
          verification_id?: string | null
          verification_method?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_verification_audit_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "residency_ownership_verifications"
            referencedColumns: ["id"]
          },
        ]
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
          field_notes: string | null
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
          field_notes?: string | null
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
          field_notes?: string | null
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
          {
            foreignKeyName: "fk_emergency_unit_members_officer_id"
            columns: ["officer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
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
      external_systems: {
        Row: {
          authentication: string
          configuration: Json | null
          created_at: string | null
          created_by: string | null
          enabled: boolean
          endpoint: string
          id: string
          last_sync: string | null
          name: string
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          authentication: string
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean
          endpoint: string
          id?: string
          last_sync?: string | null
          name: string
          status?: string
          type: string
          updated_at?: string | null
        }
        Update: {
          authentication?: string
          configuration?: Json | null
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean
          endpoint?: string
          id?: string
          last_sync?: string | null
          name?: string
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      household_activity_audit: {
        Row: {
          action: string
          details: Json | null
          household_group_id: string
          id: string
          performed_by: string
          timestamp: string
        }
        Insert: {
          action: string
          details?: Json | null
          household_group_id: string
          id?: string
          performed_by: string
          timestamp?: string
        }
        Update: {
          action?: string
          details?: Json | null
          household_group_id?: string
          id?: string
          performed_by?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_activity_audit_household_group_id_fkey"
            columns: ["household_group_id"]
            isOneToOne: false
            referencedRelation: "household_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      household_dependents: {
        Row: {
          birth_certificate_number: string | null
          claimed_account_user_id: string | null
          claimed_own_account: boolean
          created_at: string
          created_by: string
          date_of_birth: string
          dependency_reason: string | null
          dependent_type: Database["public"]["Enums"]["dependent_type_enum"]
          disability_certificate_number: string | null
          expected_dependency_end_date: string | null
          full_name: string
          gender: string | null
          guardian_person_id: string
          guardian_user_id: string
          health_card_number: string | null
          id: string
          is_active: boolean
          notes: string | null
          notified_at_18: string | null
          reached_majority_age: boolean
          relationship_to_guardian: Database["public"]["Enums"]["dependent_relationship"]
          school_id_number: string | null
          student_enrollment_number: string | null
          university_name: string | null
          updated_at: string
        }
        Insert: {
          birth_certificate_number?: string | null
          claimed_account_user_id?: string | null
          claimed_own_account?: boolean
          created_at?: string
          created_by: string
          date_of_birth: string
          dependency_reason?: string | null
          dependent_type?: Database["public"]["Enums"]["dependent_type_enum"]
          disability_certificate_number?: string | null
          expected_dependency_end_date?: string | null
          full_name: string
          gender?: string | null
          guardian_person_id: string
          guardian_user_id: string
          health_card_number?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          notified_at_18?: string | null
          reached_majority_age?: boolean
          relationship_to_guardian: Database["public"]["Enums"]["dependent_relationship"]
          school_id_number?: string | null
          student_enrollment_number?: string | null
          university_name?: string | null
          updated_at?: string
        }
        Update: {
          birth_certificate_number?: string | null
          claimed_account_user_id?: string | null
          claimed_own_account?: boolean
          created_at?: string
          created_by?: string
          date_of_birth?: string
          dependency_reason?: string | null
          dependent_type?: Database["public"]["Enums"]["dependent_type_enum"]
          disability_certificate_number?: string | null
          expected_dependency_end_date?: string | null
          full_name?: string
          gender?: string | null
          guardian_person_id?: string
          guardian_user_id?: string
          health_card_number?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          notified_at_18?: string | null
          reached_majority_age?: boolean
          relationship_to_guardian?: Database["public"]["Enums"]["dependent_relationship"]
          school_id_number?: string | null
          student_enrollment_number?: string | null
          university_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_dependents_guardian_person_id_fkey"
            columns: ["guardian_person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_dependents_guardian_person_id_fkey"
            columns: ["guardian_person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      household_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          household_head_person_id: string
          household_head_user_id: string
          household_name: string
          household_status: Database["public"]["Enums"]["household_status_enum"]
          household_succession_date: string | null
          id: string
          is_active: boolean
          previous_household_id: string | null
          primary_uac: string
          primary_unit_uac: string | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
          verified_by_car: boolean
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          household_head_person_id: string
          household_head_user_id: string
          household_name: string
          household_status?: Database["public"]["Enums"]["household_status_enum"]
          household_succession_date?: string | null
          id?: string
          is_active?: boolean
          previous_household_id?: string | null
          primary_uac: string
          primary_unit_uac?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          verified_by_car?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          household_head_person_id?: string
          household_head_user_id?: string
          household_name?: string
          household_status?: Database["public"]["Enums"]["household_status_enum"]
          household_succession_date?: string | null
          id?: string
          is_active?: boolean
          previous_household_id?: string | null
          primary_uac?: string
          primary_unit_uac?: string | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
          verified_by_car?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "household_groups_household_head_person_id_fkey"
            columns: ["household_head_person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_groups_household_head_person_id_fkey"
            columns: ["household_head_person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_groups_previous_household_id_fkey"
            columns: ["previous_household_id"]
            isOneToOne: false
            referencedRelation: "household_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          added_at: string
          added_by: string
          custody_schedule: Json | null
          custody_type: Database["public"]["Enums"]["custody_type_enum"] | null
          dependent_id: string | null
          household_group_id: string
          household_role: Database["public"]["Enums"]["household_role_enum"]
          id: string
          is_primary_household: boolean
          is_primary_resident: boolean
          membership_status: Database["public"]["Enums"]["membership_status_enum"]
          moved_in_date: string | null
          moved_out_date: string | null
          notes: string | null
          person_id: string | null
          relationship_to_head: Database["public"]["Enums"]["household_member_role"]
          residence_percentage: number | null
        }
        Insert: {
          added_at?: string
          added_by: string
          custody_schedule?: Json | null
          custody_type?: Database["public"]["Enums"]["custody_type_enum"] | null
          dependent_id?: string | null
          household_group_id: string
          household_role?: Database["public"]["Enums"]["household_role_enum"]
          id?: string
          is_primary_household?: boolean
          is_primary_resident?: boolean
          membership_status?: Database["public"]["Enums"]["membership_status_enum"]
          moved_in_date?: string | null
          moved_out_date?: string | null
          notes?: string | null
          person_id?: string | null
          relationship_to_head: Database["public"]["Enums"]["household_member_role"]
          residence_percentage?: number | null
        }
        Update: {
          added_at?: string
          added_by?: string
          custody_schedule?: Json | null
          custody_type?: Database["public"]["Enums"]["custody_type_enum"] | null
          dependent_id?: string | null
          household_group_id?: string
          household_role?: Database["public"]["Enums"]["household_role_enum"]
          id?: string
          is_primary_household?: boolean
          is_primary_resident?: boolean
          membership_status?: Database["public"]["Enums"]["membership_status_enum"]
          moved_in_date?: string | null
          moved_out_date?: string | null
          notes?: string | null
          person_id?: string | null
          relationship_to_head?: Database["public"]["Enums"]["household_member_role"]
          residence_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "household_members_dependent_id_fkey"
            columns: ["dependent_id"]
            isOneToOne: false
            referencedRelation: "household_dependents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_household_group_id_fkey"
            columns: ["household_group_id"]
            isOneToOne: false
            referencedRelation: "household_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "household_members_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_api_keys: {
        Row: {
          created_at: string | null
          created_by: string | null
          enabled: boolean
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used: string | null
          name: string
          permissions: Json | null
          rate_limit: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used?: string | null
          name: string
          permissions?: Json | null
          rate_limit?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          enabled?: boolean
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used?: string | null
          name?: string
          permissions?: Json | null
          rate_limit?: number | null
        }
        Relationships: []
      }
      integration_health_metrics: {
        Row: {
          avg_response_time_ms: number | null
          created_at: string | null
          endpoint: string
          id: string
          last_check: string | null
          metadata: Json | null
          requests_last_24h: number | null
          status: string
          uptime_percentage: number | null
        }
        Insert: {
          avg_response_time_ms?: number | null
          created_at?: string | null
          endpoint: string
          id?: string
          last_check?: string | null
          metadata?: Json | null
          requests_last_24h?: number | null
          status?: string
          uptime_percentage?: number | null
        }
        Update: {
          avg_response_time_ms?: number | null
          created_at?: string | null
          endpoint?: string
          id?: string
          last_check?: string | null
          metadata?: Json | null
          requests_last_24h?: number | null
          status?: string
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      legal_compliance_framework: {
        Row: {
          applicable_laws: string[]
          consent_requirements: string[]
          created_at: string
          cross_border_restrictions: Json | null
          data_retention_period: number
          effective_from: string
          effective_until: string | null
          id: string
          is_active: boolean
          jurisdiction: string
          notification_requirements: string[]
          privacy_regulations: string[]
          updated_at: string
        }
        Insert: {
          applicable_laws?: string[]
          consent_requirements?: string[]
          created_at?: string
          cross_border_restrictions?: Json | null
          data_retention_period?: number
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          jurisdiction?: string
          notification_requirements?: string[]
          privacy_regulations?: string[]
          updated_at?: string
        }
        Update: {
          applicable_laws?: string[]
          consent_requirements?: string[]
          created_at?: string
          cross_border_restrictions?: Json | null
          data_retention_period?: number
          effective_from?: string
          effective_until?: string | null
          id?: string
          is_active?: boolean
          jurisdiction?: string
          notification_requirements?: string[]
          privacy_regulations?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      nar_authorities: {
        Row: {
          authority_level: string
          authorized_at: string | null
          authorized_by: string | null
          can_create_addresses: boolean | null
          can_update_addresses: boolean | null
          can_verify_addresses: boolean | null
          created_at: string | null
          id: string
          is_active: boolean | null
          user_id: string
        }
        Insert: {
          authority_level: string
          authorized_at?: string | null
          authorized_by?: string | null
          can_create_addresses?: boolean | null
          can_update_addresses?: boolean | null
          can_verify_addresses?: boolean | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id: string
        }
        Update: {
          authority_level?: string
          authorized_at?: string | null
          authorized_by?: string | null
          can_create_addresses?: boolean | null
          can_update_addresses?: boolean | null
          can_verify_addresses?: boolean | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      nar_creation_log: {
        Row: {
          address_id: string
          approved_by: string | null
          created_at: string | null
          created_by: string
          creation_method: string
          id: string
          source_data: Json | null
          validation_results: Json | null
        }
        Insert: {
          address_id: string
          approved_by?: string | null
          created_at?: string | null
          created_by: string
          creation_method: string
          id?: string
          source_data?: Json | null
          validation_results?: Json | null
        }
        Update: {
          address_id?: string
          approved_by?: string | null
          created_at?: string | null
          created_by?: string
          creation_method?: string
          id?: string
          source_data?: Json | null
          validation_results?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "nar_creation_log_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_addresses: {
        Row: {
          address_id: string | null
          appointment_required: boolean | null
          authority_type: string | null
          business_category: Database["public"]["Enums"]["business_category"]
          business_registration_number: string | null
          business_status: string | null
          closure_date: string | null
          created_at: string | null
          created_by: string | null
          customer_capacity: number | null
          employee_count: number | null
          id: string
          is_public_service: boolean | null
          languages_spoken: string[] | null
          license_expiry_date: string | null
          operating_hours: Json | null
          organization_name: string
          parking_available: boolean | null
          parking_capacity: number | null
          primary_contact_email: string | null
          primary_contact_name: string | null
          primary_contact_phone: string | null
          public_transport_access: string[] | null
          publicly_visible: boolean | null
          relocation_address_id: string | null
          seasonal_hours: Json | null
          seasonal_operation: boolean | null
          secondary_contact_phone: string | null
          services_offered: string[] | null
          show_contact_info: boolean | null
          show_on_maps: boolean | null
          tax_identification_number: string | null
          updated_at: string | null
          verification_document_url: string | null
          verified_at: string | null
          verified_by_authority: string | null
          website_url: string | null
          wheelchair_accessible: boolean | null
        }
        Insert: {
          address_id?: string | null
          appointment_required?: boolean | null
          authority_type?: string | null
          business_category: Database["public"]["Enums"]["business_category"]
          business_registration_number?: string | null
          business_status?: string | null
          closure_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_capacity?: number | null
          employee_count?: number | null
          id?: string
          is_public_service?: boolean | null
          languages_spoken?: string[] | null
          license_expiry_date?: string | null
          operating_hours?: Json | null
          organization_name: string
          parking_available?: boolean | null
          parking_capacity?: number | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          public_transport_access?: string[] | null
          publicly_visible?: boolean | null
          relocation_address_id?: string | null
          seasonal_hours?: Json | null
          seasonal_operation?: boolean | null
          secondary_contact_phone?: string | null
          services_offered?: string[] | null
          show_contact_info?: boolean | null
          show_on_maps?: boolean | null
          tax_identification_number?: string | null
          updated_at?: string | null
          verification_document_url?: string | null
          verified_at?: string | null
          verified_by_authority?: string | null
          website_url?: string | null
          wheelchair_accessible?: boolean | null
        }
        Update: {
          address_id?: string | null
          appointment_required?: boolean | null
          authority_type?: string | null
          business_category?: Database["public"]["Enums"]["business_category"]
          business_registration_number?: string | null
          business_status?: string | null
          closure_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_capacity?: number | null
          employee_count?: number | null
          id?: string
          is_public_service?: boolean | null
          languages_spoken?: string[] | null
          license_expiry_date?: string | null
          operating_hours?: Json | null
          organization_name?: string
          parking_available?: boolean | null
          parking_capacity?: number | null
          primary_contact_email?: string | null
          primary_contact_name?: string | null
          primary_contact_phone?: string | null
          public_transport_access?: string[] | null
          publicly_visible?: boolean | null
          relocation_address_id?: string | null
          seasonal_hours?: Json | null
          seasonal_operation?: boolean | null
          secondary_contact_phone?: string | null
          services_offered?: string[] | null
          show_contact_info?: boolean | null
          show_on_maps?: boolean | null
          tax_identification_number?: string | null
          updated_at?: string | null
          verification_document_url?: string | null
          verified_at?: string | null
          verified_by_authority?: string | null
          website_url?: string | null
          wheelchair_accessible?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_addresses_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_addresses_relocation_address_id_fkey"
            columns: ["relocation_address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      person: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          id: string
          is_protected_class: boolean
          national_id: string | null
          protection_reason: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string
          is_protected_class?: boolean
          national_id?: string | null
          protection_reason?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string
          is_protected_class?: boolean
          national_id?: string | null
          protection_reason?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      privacy_consent_log: {
        Row: {
          consent_details: Json | null
          consent_given: boolean
          consent_timestamp: string
          consent_type: string
          consent_withdrawn_at: string | null
          id: string
          ip_address: string | null
          legal_basis: string
          user_agent: string | null
          user_id: string
          verification_id: string | null
        }
        Insert: {
          consent_details?: Json | null
          consent_given: boolean
          consent_timestamp?: string
          consent_type: string
          consent_withdrawn_at?: string | null
          id?: string
          ip_address?: string | null
          legal_basis: string
          user_agent?: string | null
          user_id: string
          verification_id?: string | null
        }
        Update: {
          consent_details?: Json | null
          consent_given?: boolean
          consent_timestamp?: string
          consent_type?: string
          consent_withdrawn_at?: string | null
          id?: string
          ip_address?: string | null
          legal_basis?: string
          user_agent?: string | null
          user_id?: string
          verification_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "privacy_consent_log_verification_id_fkey"
            columns: ["verification_id"]
            isOneToOne: false
            referencedRelation: "residency_ownership_verifications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string | null
          id: string
          national_id: string | null
          national_id_type: string | null
          nationality: string | null
          organization: string | null
          phone: string | null
          preferred_language: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          national_id?: string | null
          national_id_type?: string | null
          nationality?: string | null
          organization?: string | null
          phone?: string | null
          preferred_language?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          national_id?: string | null
          national_id_type?: string | null
          nationality?: string | null
          organization?: string | null
          phone?: string | null
          preferred_language?: string | null
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
      quality_metrics: {
        Row: {
          city: string | null
          created_at: string | null
          id: string
          measured_at: string | null
          metric_details: Json | null
          metric_type: string
          metric_value: number
          region: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: string
          measured_at?: string | null
          metric_details?: Json | null
          metric_type: string
          metric_value: number
          region?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: string
          measured_at?: string | null
          metric_details?: Json | null
          metric_type?: string
          metric_value?: number
          region?: string | null
        }
        Relationships: []
      }
      recent_searches: {
        Row: {
          id: string
          metadata: Json | null
          results_count: number | null
          search_query: string
          search_type: string
          searched_at: string
          user_id: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          results_count?: number | null
          search_query: string
          search_type?: string
          searched_at?: string
          user_id: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          results_count?: number | null
          search_query?: string
          search_type?: string
          searched_at?: string
          user_id?: string
        }
        Relationships: []
      }
      residency_ownership_verifications: {
        Row: {
          address_request_id: string | null
          citizen_address_id: string | null
          claimant_relationship: string
          consent_given: boolean
          consent_timestamp: string | null
          created_at: string
          data_retention_consent: boolean
          expires_at: string | null
          field_verification_completed_at: string | null
          field_verification_notes: string | null
          field_verification_required: boolean | null
          field_verification_scheduled_at: string | null
          id: string
          legal_basis: string
          primary_document_hash: string | null
          primary_document_type: Database["public"]["Enums"]["legal_document_type"]
          primary_document_url: string | null
          privacy_level: Database["public"]["Enums"]["privacy_access_level"]
          processing_purpose: string
          retention_period: number | null
          status: Database["public"]["Enums"]["verification_status"]
          supporting_documents: Json | null
          updated_at: string
          user_id: string
          verification_history: Json | null
          verification_notes: string | null
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          address_request_id?: string | null
          citizen_address_id?: string | null
          claimant_relationship: string
          consent_given?: boolean
          consent_timestamp?: string | null
          created_at?: string
          data_retention_consent?: boolean
          expires_at?: string | null
          field_verification_completed_at?: string | null
          field_verification_notes?: string | null
          field_verification_required?: boolean | null
          field_verification_scheduled_at?: string | null
          id?: string
          legal_basis: string
          primary_document_hash?: string | null
          primary_document_type: Database["public"]["Enums"]["legal_document_type"]
          primary_document_url?: string | null
          privacy_level?: Database["public"]["Enums"]["privacy_access_level"]
          processing_purpose: string
          retention_period?: number | null
          status?: Database["public"]["Enums"]["verification_status"]
          supporting_documents?: Json | null
          updated_at?: string
          user_id: string
          verification_history?: Json | null
          verification_notes?: string | null
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          address_request_id?: string | null
          citizen_address_id?: string | null
          claimant_relationship?: string
          consent_given?: boolean
          consent_timestamp?: string | null
          created_at?: string
          data_retention_consent?: boolean
          expires_at?: string | null
          field_verification_completed_at?: string | null
          field_verification_notes?: string | null
          field_verification_required?: boolean | null
          field_verification_scheduled_at?: string | null
          id?: string
          legal_basis?: string
          primary_document_hash?: string | null
          primary_document_type?: Database["public"]["Enums"]["legal_document_type"]
          primary_document_url?: string | null
          privacy_level?: Database["public"]["Enums"]["privacy_access_level"]
          processing_purpose?: string
          retention_period?: number | null
          status?: Database["public"]["Enums"]["verification_status"]
          supporting_documents?: Json | null
          updated_at?: string
          user_id?: string
          verification_history?: Json | null
          verification_notes?: string | null
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residency_ownership_verifications_address_request_id_fkey"
            columns: ["address_request_id"]
            isOneToOne: false
            referencedRelation: "address_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residency_ownership_verifications_citizen_address_id_fkey"
            columns: ["citizen_address_id"]
            isOneToOne: false
            referencedRelation: "citizen_address"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residency_ownership_verifications_citizen_address_id_fkey"
            columns: ["citizen_address_id"]
            isOneToOne: false
            referencedRelation: "citizen_address_manual_review_queue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residency_ownership_verifications_citizen_address_id_fkey"
            columns: ["citizen_address_id"]
            isOneToOne: false
            referencedRelation: "citizen_address_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "residency_ownership_verifications_citizen_address_id_fkey"
            columns: ["citizen_address_id"]
            isOneToOne: false
            referencedRelation: "current_citizen_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_locations: {
        Row: {
          address_components: Json | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          tags: string[] | null
          uac: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_components?: Json | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          tags?: string[] | null
          uac?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_components?: Json | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          tags?: string[] | null
          uac?: string | null
          updated_at?: string
          user_id?: string
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
      uac_sequence_counters: {
        Row: {
          city_code: string
          country_code: string
          current_num: number
          region_code: string
          updated_at: string
        }
        Insert: {
          city_code: string
          country_code: string
          current_num?: number
          region_code: string
          updated_at?: string
        }
        Update: {
          city_code?: string
          country_code?: string
          current_num?: number
          region_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      unit_communications: {
        Row: {
          acknowledged: boolean
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          from_unit_id: string | null
          from_user_id: string | null
          id: string
          is_radio_code: boolean
          message_content: string
          message_type: string
          metadata: Json | null
          priority_level: number
          radio_code: string | null
          to_user_id: string | null
        }
        Insert: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          from_unit_id?: string | null
          from_user_id?: string | null
          id?: string
          is_radio_code?: boolean
          message_content: string
          message_type?: string
          metadata?: Json | null
          priority_level?: number
          radio_code?: string | null
          to_user_id?: string | null
        }
        Update: {
          acknowledged?: boolean
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          from_unit_id?: string | null
          from_user_id?: string | null
          id?: string
          is_radio_code?: boolean
          message_content?: string
          message_type?: string
          metadata?: Json | null
          priority_level?: number
          radio_code?: string | null
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "unit_communications_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "unit_communications_from_unit_id_fkey"
            columns: ["from_unit_id"]
            isOneToOne: false
            referencedRelation: "emergency_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_communications_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "unit_communications_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
            foreignKeyName: "fk_user_role_metadata_user_role"
            columns: ["user_role_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["id"]
          },
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
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      webhook_delivery: {
        Row: {
          attempts: number | null
          created_at: string | null
          delivered_at: string | null
          event_type: string
          id: string
          last_error: string | null
          max_attempts: number | null
          next_retry_at: string | null
          payload: Json
          status: string | null
          url: string
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          delivered_at?: string | null
          event_type: string
          id?: string
          last_error?: string | null
          max_attempts?: number | null
          next_retry_at?: string | null
          payload: Json
          status?: string | null
          url: string
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          delivered_at?: string | null
          event_type?: string
          id?: string
          last_error?: string | null
          max_attempts?: number | null
          next_retry_at?: string | null
          payload?: Json
          status?: string | null
          url?: string
        }
        Relationships: []
      }
    }
    Views: {
      citizen_address_manual_review_queue: {
        Row: {
          address_description: string | null
          address_kind: Database["public"]["Enums"]["address_kind"] | null
          address_type: string | null
          building: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          nar_public: boolean | null
          nar_verified: boolean | null
          notes: string | null
          occupant: Database["public"]["Enums"]["occupant_type"] | null
          person_id: string | null
          region: string | null
          scope: Database["public"]["Enums"]["address_scope"] | null
          source: string | null
          status: Database["public"]["Enums"]["address_status"] | null
          street: string | null
          uac: string | null
          unit_uac: string | null
          updated_at: string | null
          verification_status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_address_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      citizen_address_with_details: {
        Row: {
          address_description: string | null
          address_kind: Database["public"]["Enums"]["address_kind"] | null
          address_type: string | null
          building: string | null
          city: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string | null
          latitude: number | null
          longitude: number | null
          nar_public: boolean | null
          nar_verified: boolean | null
          notes: string | null
          occupant: Database["public"]["Enums"]["occupant_type"] | null
          person_id: string | null
          region: string | null
          scope: Database["public"]["Enums"]["address_scope"] | null
          source: string | null
          status: Database["public"]["Enums"]["address_status"] | null
          street: string | null
          uac: string | null
          unit_uac: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_address_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      current_citizen_addresses: {
        Row: {
          address_kind: Database["public"]["Enums"]["address_kind"] | null
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_to: string | null
          id: string | null
          notes: string | null
          occupant: Database["public"]["Enums"]["occupant_type"] | null
          person_id: string | null
          scope: Database["public"]["Enums"]["address_scope"] | null
          source: string | null
          status: Database["public"]["Enums"]["address_status"] | null
          uac: string | null
          unit_uac: string | null
          updated_at: string | null
        }
        Insert: {
          address_kind?: Database["public"]["Enums"]["address_kind"] | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string | null
          notes?: string | null
          occupant?: Database["public"]["Enums"]["occupant_type"] | null
          person_id?: string | null
          scope?: Database["public"]["Enums"]["address_scope"] | null
          source?: string | null
          status?: Database["public"]["Enums"]["address_status"] | null
          uac?: string | null
          unit_uac?: string | null
          updated_at?: string | null
        }
        Update: {
          address_kind?: Database["public"]["Enums"]["address_kind"] | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_to?: string | null
          id?: string | null
          notes?: string | null
          occupant?: Database["public"]["Enums"]["occupant_type"] | null
          person_id?: string | null
          scope?: Database["public"]["Enums"]["address_scope"] | null
          source?: string | null
          status?: Database["public"]["Enums"]["address_status"] | null
          uac?: string | null
          unit_uac?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "citizen_address_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "my_person"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "citizen_address_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["id"]
          },
        ]
      }
      my_person: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          id: string | null
          national_id: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string | null
          national_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          id?: string | null
          national_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_secondary_address: {
        Args: {
          p_person_id: string
          p_scope: Database["public"]["Enums"]["address_scope"]
          p_source?: string
          p_uac: string
          p_unit_uac?: string
        }
        Returns: string
      }
      approve_address_request: {
        Args: { p_approved_by?: string; p_request_id: string }
        Returns: string
      }
      approve_address_request_with_duplicate_check: {
        Args: {
          p_approved_by?: string
          p_ignore_duplicates?: boolean
          p_request_id: string
        }
        Returns: Json
      }
      auto_approve_verified_citizen_addresses: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      calculate_completeness_score: {
        Args: {
          p_building: string
          p_city: string
          p_country: string
          p_description: string
          p_latitude: number
          p_longitude: number
          p_photo_url: string
          p_region: string
          p_street: string
        }
        Returns: number
      }
      calculate_coverage_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      can_view_citizen_address: {
        Args: {
          p_privacy_level: Database["public"]["Enums"]["address_privacy_level"]
          p_searchable_by_public: boolean
          p_searcher_id: string
          p_target_person_id: string
        }
        Returns: boolean
      }
      check_address_duplicates: {
        Args: {
          p_city: string
          p_country: string
          p_exclude_id?: string
          p_latitude: number
          p_longitude: number
          p_region: string
          p_street: string
        }
        Returns: Json
      }
      close_current_primary: {
        Args:
          | { p_person_id: string; p_until: string }
          | { p_person_id: string; p_until: string }
        Returns: undefined
      }
      debug_verification_access: {
        Args: Record<PropertyKey, never>
        Returns: Json
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
      generate_incident_uac: {
        Args: {
          p_city: string
          p_country: string
          p_incident_id: string
          p_region: string
        }
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
      get_next_uac_sequence: {
        Args: {
          p_city_code: string
          p_country_code: string
          p_region_code: string
        }
        Returns: string
      }
      get_pending_verifications_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_registrar_scope: {
        Args: { _user_id: string }
        Returns: {
          scope_type: string
          scope_value: string
        }[]
      }
      get_rejected_addresses_queue: {
        Args: Record<PropertyKey, never>
        Returns: {
          address_type: string
          building: string
          city: string
          country: string
          created_at: string
          description: string
          id: string
          justification: string
          latitude: number
          longitude: number
          region: string
          rejected_at: string
          rejected_by: string
          rejection_notes: string
          rejection_reason: string
          street: string
          user_id: string
        }[]
      }
      get_residents_by_uac: {
        Args: { p_current_only?: boolean; p_uac: string }
        Returns: {
          address_id: string
          address_kind: Database["public"]["Enums"]["address_kind"]
          effective_from: string
          effective_to: string
          occupant: Database["public"]["Enums"]["occupant_type"]
          person_id: string
          scope: Database["public"]["Enums"]["address_scope"]
          status: Database["public"]["Enums"]["address_status"]
          unit_uac: string
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
          requires_manual_review: boolean
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
      get_user_household_group_ids: {
        Args: { _user_id: string }
        Returns: string[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_car_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
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
      import_google_maps_addresses: {
        Args: Record<PropertyKey, never>
        Returns: {
          details: Json
          error_count: number
          success_count: number
          total_imported: number
        }[]
      }
      initiate_residency_verification: {
        Args: {
          p_citizen_address_id: string
          p_claimant_relationship: string
          p_legal_basis: string
          p_primary_document_type: Database["public"]["Enums"]["legal_document_type"]
          p_processing_purpose: string
          p_user_id: string
          p_verification_type: string
        }
        Returns: string
      }
      is_household_member: {
        Args: { _household_id: string; _user_id: string }
        Returns: boolean
      }
      record_privacy_consent: {
        Args: {
          p_consent_details?: Json
          p_consent_given: boolean
          p_consent_type: string
          p_legal_basis?: string
          p_user_id: string
          p_verification_id: string
        }
        Returns: string
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
      retire_address: {
        Args: { p_address_id: string; p_reason?: string; p_when?: string }
        Returns: undefined
      }
      search_addresses_safely: {
        Args: { search_query: string }
        Returns: {
          address_type: string
          building: string
          city: string
          completeness_score: number
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
      set_citizen_address_status: {
        Args: {
          p_actor_id?: string
          p_address_id: string
          p_status: Database["public"]["Enums"]["address_status"]
        }
        Returns: undefined
      }
      set_primary_address: {
        Args: {
          p_effective_from?: string
          p_person_id: string
          p_scope: Database["public"]["Enums"]["address_scope"]
          p_source?: string
          p_uac: string
          p_unit_uac?: string
        }
        Returns: string
      }
      unflag_address: {
        Args: { p_address_id: string; p_unflagged_by?: string }
        Returns: boolean
      }
      update_car_quality_metrics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      address_kind: "PRIMARY" | "SECONDARY" | "OTHER"
      address_privacy_level: "PRIVATE" | "REGION_ONLY" | "PUBLIC"
      address_scope: "BUILDING" | "UNIT"
      address_status: "SELF_DECLARED" | "CONFIRMED" | "REJECTED"
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
        | "police_admin"
        | "car_admin"
        | "car_verifier"
        | "residency_verifier"
      business_address_type:
        | "RESIDENTIAL"
        | "COMMERCIAL"
        | "GOVERNMENT"
        | "INDUSTRIAL"
        | "INSTITUTIONAL"
        | "PUBLIC_FACILITY"
        | "AGRICULTURAL"
        | "MIXED_USE"
      business_category:
        | "RETAIL"
        | "OFFICE"
        | "RESTAURANT"
        | "HOTEL"
        | "HOSPITAL"
        | "SCHOOL"
        | "UNIVERSITY"
        | "GOVERNMENT_OFFICE"
        | "POLICE_STATION"
        | "FIRE_STATION"
        | "EMBASSY"
        | "BANK"
        | "FACTORY"
        | "WAREHOUSE"
        | "FARM"
        | "CHURCH"
        | "MOSQUE"
        | "MARKET"
        | "SHOPPING_CENTER"
        | "GAS_STATION"
        | "AIRPORT"
        | "PORT"
        | "OTHER"
      custody_type_enum: "FULL" | "SHARED" | "PARTIAL" | "TEMPORARY"
      dependent_relationship:
        | "CHILD"
        | "ADOPTED_CHILD"
        | "STEPCHILD"
        | "WARD"
        | "GRANDCHILD"
        | "NIECE_NEPHEW"
        | "OTHER_RELATIVE"
      dependent_type_enum:
        | "MINOR"
        | "ADULT_STUDENT"
        | "ADULT_DISABLED"
        | "ELDERLY_PARENT"
        | "OTHER_ADULT"
      household_member_role:
        | "HEAD"
        | "SPOUSE"
        | "CHILD"
        | "PARENT"
        | "GRANDPARENT"
        | "GRANDCHILD"
        | "SIBLING"
        | "OTHER_RELATIVE"
        | "NON_RELATIVE"
      household_role_enum:
        | "HEAD"
        | "CO_HEAD"
        | "MEMBER"
        | "DEPENDENT"
        | "TEMPORARY_RESIDENT"
      household_status_enum: "ACTIVE" | "TRANSFERRED" | "DISSOLVED" | "MERGED"
      legal_document_type:
        | "property_deed"
        | "land_certificate"
        | "lease_agreement"
        | "tenancy_agreement"
        | "utility_bill"
        | "bank_statement"
        | "tax_certificate"
        | "inheritance_document"
        | "court_order"
        | "government_id"
        | "passport"
        | "birth_certificate"
        | "marriage_certificate"
        | "other_legal_document"
      membership_status_enum: "ACTIVE" | "MOVED_OUT" | "TEMPORARY" | "VISITING"
      occupant_type: "OWNER" | "TENANT" | "FAMILY" | "OTHER"
      privacy_access_level:
        | "public"
        | "restricted"
        | "confidential"
        | "classified"
      search_purpose_type:
        | "DELIVERY"
        | "EMERGENCY_CONTACT"
        | "GOVERNMENT_SERVICE"
        | "BUSINESS_CONTACT"
        | "PERSONAL"
        | "OTHER"
      verification_status:
        | "pending"
        | "document_review"
        | "field_verification"
        | "legal_review"
        | "approved"
        | "rejected"
        | "requires_additional_documents"
        | "under_investigation"
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
      address_kind: ["PRIMARY", "SECONDARY", "OTHER"],
      address_privacy_level: ["PRIVATE", "REGION_ONLY", "PUBLIC"],
      address_scope: ["BUILDING", "UNIT"],
      address_status: ["SELF_DECLARED", "CONFIRMED", "REJECTED"],
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
        "police_admin",
        "car_admin",
        "car_verifier",
        "residency_verifier",
      ],
      business_address_type: [
        "RESIDENTIAL",
        "COMMERCIAL",
        "GOVERNMENT",
        "INDUSTRIAL",
        "INSTITUTIONAL",
        "PUBLIC_FACILITY",
        "AGRICULTURAL",
        "MIXED_USE",
      ],
      business_category: [
        "RETAIL",
        "OFFICE",
        "RESTAURANT",
        "HOTEL",
        "HOSPITAL",
        "SCHOOL",
        "UNIVERSITY",
        "GOVERNMENT_OFFICE",
        "POLICE_STATION",
        "FIRE_STATION",
        "EMBASSY",
        "BANK",
        "FACTORY",
        "WAREHOUSE",
        "FARM",
        "CHURCH",
        "MOSQUE",
        "MARKET",
        "SHOPPING_CENTER",
        "GAS_STATION",
        "AIRPORT",
        "PORT",
        "OTHER",
      ],
      custody_type_enum: ["FULL", "SHARED", "PARTIAL", "TEMPORARY"],
      dependent_relationship: [
        "CHILD",
        "ADOPTED_CHILD",
        "STEPCHILD",
        "WARD",
        "GRANDCHILD",
        "NIECE_NEPHEW",
        "OTHER_RELATIVE",
      ],
      dependent_type_enum: [
        "MINOR",
        "ADULT_STUDENT",
        "ADULT_DISABLED",
        "ELDERLY_PARENT",
        "OTHER_ADULT",
      ],
      household_member_role: [
        "HEAD",
        "SPOUSE",
        "CHILD",
        "PARENT",
        "GRANDPARENT",
        "GRANDCHILD",
        "SIBLING",
        "OTHER_RELATIVE",
        "NON_RELATIVE",
      ],
      household_role_enum: [
        "HEAD",
        "CO_HEAD",
        "MEMBER",
        "DEPENDENT",
        "TEMPORARY_RESIDENT",
      ],
      household_status_enum: ["ACTIVE", "TRANSFERRED", "DISSOLVED", "MERGED"],
      legal_document_type: [
        "property_deed",
        "land_certificate",
        "lease_agreement",
        "tenancy_agreement",
        "utility_bill",
        "bank_statement",
        "tax_certificate",
        "inheritance_document",
        "court_order",
        "government_id",
        "passport",
        "birth_certificate",
        "marriage_certificate",
        "other_legal_document",
      ],
      membership_status_enum: ["ACTIVE", "MOVED_OUT", "TEMPORARY", "VISITING"],
      occupant_type: ["OWNER", "TENANT", "FAMILY", "OTHER"],
      privacy_access_level: [
        "public",
        "restricted",
        "confidential",
        "classified",
      ],
      search_purpose_type: [
        "DELIVERY",
        "EMERGENCY_CONTACT",
        "GOVERNMENT_SERVICE",
        "BUSINESS_CONTACT",
        "PERSONAL",
        "OTHER",
      ],
      verification_status: [
        "pending",
        "document_review",
        "field_verification",
        "legal_review",
        "approved",
        "rejected",
        "requires_additional_documents",
        "under_investigation",
      ],
    },
  },
} as const
