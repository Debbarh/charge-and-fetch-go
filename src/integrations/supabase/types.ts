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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      driver_offers: {
        Row: {
          availability: string | null
          created_at: string
          driver_experience: string | null
          driver_id: string
          driver_name: string
          driver_phone: string
          driver_rating: number | null
          driver_total_rides: number | null
          driver_vehicle: string
          estimated_duration: string
          id: string
          last_activity: string
          message: string | null
          proposed_price: number
          request_id: string
          response_time: string | null
          status: Database["public"]["Enums"]["offer_status"]
          updated_at: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          driver_experience?: string | null
          driver_id: string
          driver_name: string
          driver_phone: string
          driver_rating?: number | null
          driver_total_rides?: number | null
          driver_vehicle: string
          estimated_duration: string
          id?: string
          last_activity?: string
          message?: string | null
          proposed_price: number
          request_id: string
          response_time?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          driver_experience?: string | null
          driver_id?: string
          driver_name?: string
          driver_phone?: string
          driver_rating?: number | null
          driver_total_rides?: number | null
          driver_vehicle?: string
          estimated_duration?: string
          id?: string
          last_activity?: string
          message?: string | null
          proposed_price?: number
          request_id?: string
          response_time?: string | null
          status?: Database["public"]["Enums"]["offer_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_offers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      negotiations: {
        Row: {
          created_at: string
          from_role: Database["public"]["Enums"]["negotiation_role"]
          from_user_id: string
          id: string
          message: string
          offer_id: string
          proposed_duration: string | null
          proposed_price: number
          status: Database["public"]["Enums"]["negotiation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_role: Database["public"]["Enums"]["negotiation_role"]
          from_user_id: string
          id?: string
          message: string
          offer_id: string
          proposed_duration?: string | null
          proposed_price: number
          status?: Database["public"]["Enums"]["negotiation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_role?: Database["public"]["Enums"]["negotiation_role"]
          from_user_id?: string
          id?: string
          message?: string
          offer_id?: string
          proposed_duration?: string | null
          proposed_price?: number
          status?: Database["public"]["Enums"]["negotiation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "negotiations_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "driver_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          battery_level: number
          contact_phone: string
          created_at: string
          destination_address: string | null
          estimated_duration: string | null
          id: string
          notes: string | null
          pickup_address: string
          proposed_price: number
          selected_driver_id: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          user_id: string
          vehicle_model: string
        }
        Insert: {
          battery_level: number
          contact_phone: string
          created_at?: string
          destination_address?: string | null
          estimated_duration?: string | null
          id?: string
          notes?: string | null
          pickup_address: string
          proposed_price: number
          selected_driver_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          urgency: Database["public"]["Enums"]["urgency_level"]
          user_id: string
          vehicle_model: string
        }
        Update: {
          battery_level?: number
          contact_phone?: string
          created_at?: string
          destination_address?: string | null
          estimated_duration?: string | null
          id?: string
          notes?: string | null
          pickup_address?: string
          proposed_price?: number
          selected_driver_id?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_level"]
          user_id?: string
          vehicle_model?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_negotiation_history: {
        Args: { p_offer_id: string }
        Returns: {
          created_at: string
          from_role: Database["public"]["Enums"]["negotiation_role"]
          from_user_id: string
          from_user_name: string
          id: string
          message: string
          proposed_duration: string
          proposed_price: number
          status: Database["public"]["Enums"]["negotiation_status"]
        }[]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "chauffeur" | "client"
      negotiation_role: "client" | "driver"
      negotiation_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "counter_offered"
      offer_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "counter_offered"
        | "negotiating"
        | "selected"
        | "completed"
      request_status: "active" | "driver_selected" | "completed" | "cancelled"
      urgency_level: "low" | "medium" | "high"
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
      app_role: ["admin", "chauffeur", "client"],
      negotiation_role: ["client", "driver"],
      negotiation_status: [
        "pending",
        "accepted",
        "rejected",
        "counter_offered",
      ],
      offer_status: [
        "pending",
        "accepted",
        "rejected",
        "counter_offered",
        "negotiating",
        "selected",
        "completed",
      ],
      request_status: ["active", "driver_selected", "completed", "cancelled"],
      urgency_level: ["low", "medium", "high"],
    },
  },
} as const
