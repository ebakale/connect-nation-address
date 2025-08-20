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
          reviewed_at: string | null
          reviewed_by: string | null
          reviewer_notes: string | null
          status: string
          street: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_type?: string
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
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          street: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_type?: string
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
          reviewed_at?: string | null
          reviewed_by?: string | null
          reviewer_notes?: string | null
          status?: string
          street?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          street: string
          uac: string
          updated_at: string
          user_id: string
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
          street: string
          uac: string
          updated_at?: string
          user_id: string
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
          street?: string
          uac?: string
          updated_at?: string
          user_id?: string
          verified?: boolean
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
      flag_address_for_review: {
        Args: { p_address_id: string; p_flagged_by?: string; p_reason: string }
        Returns: boolean
      }
      flag_address_request_for_review: {
        Args: { p_flagged_by?: string; p_reason: string; p_request_id: string }
        Returns: boolean
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
      ],
    },
  },
} as const
