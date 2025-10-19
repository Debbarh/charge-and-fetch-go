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
      driver_stats: {
        Row: {
          average_rating: number | null
          average_response_time_minutes: number | null
          avg_communication: number | null
          avg_professionalism: number | null
          avg_punctuality: number | null
          avg_vehicle_condition: number | null
          cancelled_rides: number
          completed_rides: number
          created_at: string
          driver_id: string
          last_active_at: string | null
          total_ratings: number
          total_revenue: number | null
          total_rides: number
          updated_at: string
        }
        Insert: {
          average_rating?: number | null
          average_response_time_minutes?: number | null
          avg_communication?: number | null
          avg_professionalism?: number | null
          avg_punctuality?: number | null
          avg_vehicle_condition?: number | null
          cancelled_rides?: number
          completed_rides?: number
          created_at?: string
          driver_id: string
          last_active_at?: string | null
          total_ratings?: number
          total_revenue?: number | null
          total_rides?: number
          updated_at?: string
        }
        Update: {
          average_rating?: number | null
          average_response_time_minutes?: number | null
          avg_communication?: number | null
          avg_professionalism?: number | null
          avg_punctuality?: number | null
          avg_vehicle_condition?: number | null
          cancelled_rides?: number
          completed_rides?: number
          created_at?: string
          driver_id?: string
          last_active_at?: string | null
          total_ratings?: number
          total_revenue?: number | null
          total_rides?: number
          updated_at?: string
        }
        Relationships: []
      }
      driver_verifications: {
        Row: {
          bio: string | null
          created_at: string
          driver_license_url: string | null
          experience_years: number
          hourly_rate: number | null
          id: string
          identity_document_url: string | null
          insurance_url: string | null
          rejected_at: string | null
          rejection_reason: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
          vehicle_color: string
          vehicle_make: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_registration_url: string | null
          vehicle_year: number
          verified_at: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          driver_license_url?: string | null
          experience_years?: number
          hourly_rate?: number | null
          id?: string
          identity_document_url?: string | null
          insurance_url?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
          vehicle_color: string
          vehicle_make: string
          vehicle_model: string
          vehicle_plate: string
          vehicle_registration_url?: string | null
          vehicle_year: number
          verified_at?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          driver_license_url?: string | null
          experience_years?: number
          hourly_rate?: number | null
          id?: string
          identity_document_url?: string | null
          insurance_url?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          vehicle_color?: string
          vehicle_make?: string
          vehicle_model?: string
          vehicle_plate?: string
          vehicle_registration_url?: string | null
          vehicle_year?: number
          verified_at?: string | null
        }
        Relationships: []
      }
      driver_wallets: {
        Row: {
          balance: number
          created_at: string
          driver_id: string
          id: string
          last_payout_at: string | null
          pending_balance: number
          total_earned: number
          total_withdrawn: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          driver_id: string
          id?: string
          last_payout_at?: string | null
          pending_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          driver_id?: string
          id?: string
          last_payout_at?: string | null
          pending_balance?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          offer_id: string | null
          read: boolean
          receiver_id: string
          request_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          offer_id?: string | null
          read?: boolean
          receiver_id: string
          request_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          offer_id?: string | null
          read?: boolean
          receiver_id?: string
          request_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "driver_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_request_id_fkey"
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
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          availability_schedule: Json | null
          bio: string | null
          created_at: string | null
          email_notifications: boolean | null
          experience_years: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string
          notification_negotiations: boolean | null
          notification_new_offers: boolean | null
          notification_status_changes: boolean | null
          phone: string | null
          push_notifications: boolean | null
          specialties: string[] | null
          updated_at: string | null
          vehicle_color: string | null
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
          vehicle_year: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          bio?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id: string
          notification_negotiations?: boolean | null
          notification_new_offers?: boolean | null
          notification_status_changes?: boolean | null
          phone?: string | null
          push_notifications?: boolean | null
          specialties?: string[] | null
          updated_at?: string | null
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          bio?: string | null
          created_at?: string | null
          email_notifications?: boolean | null
          experience_years?: number | null
          full_name?: string | null
          hourly_rate?: number | null
          id?: string
          notification_negotiations?: boolean | null
          notification_new_offers?: boolean | null
          notification_status_changes?: boolean | null
          phone?: string | null
          push_notifications?: boolean | null
          specialties?: string[] | null
          updated_at?: string | null
          vehicle_color?: string | null
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vehicle_year?: number | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          client_id: string
          comment: string | null
          communication_rating: number | null
          created_at: string
          driver_id: string
          id: string
          offer_id: string
          overall_rating: number
          professionalism_rating: number | null
          punctuality_rating: number | null
          request_id: string
          updated_at: string
          vehicle_condition_rating: number | null
        }
        Insert: {
          client_id: string
          comment?: string | null
          communication_rating?: number | null
          created_at?: string
          driver_id: string
          id?: string
          offer_id: string
          overall_rating: number
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          request_id: string
          updated_at?: string
          vehicle_condition_rating?: number | null
        }
        Update: {
          client_id?: string
          comment?: string | null
          communication_rating?: number | null
          created_at?: string
          driver_id?: string
          id?: string
          offer_id?: string
          overall_rating?: number
          professionalism_rating?: number | null
          punctuality_rating?: number | null
          request_id?: string
          updated_at?: string
          vehicle_condition_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "driver_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
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
      ride_tracking: {
        Row: {
          arrived_at_destination: string | null
          arrived_at_pickup: string | null
          completed_at: string | null
          created_at: string
          destination_eta_minutes: number | null
          distance_to_destination_km: number | null
          distance_to_pickup_km: number | null
          driver_id: string
          driver_latitude: number | null
          driver_longitude: number | null
          id: string
          pickup_eta_minutes: number | null
          request_id: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          arrived_at_destination?: string | null
          arrived_at_pickup?: string | null
          completed_at?: string | null
          created_at?: string
          destination_eta_minutes?: number | null
          distance_to_destination_km?: number | null
          distance_to_pickup_km?: number | null
          driver_id: string
          driver_latitude?: number | null
          driver_longitude?: number | null
          id?: string
          pickup_eta_minutes?: number | null
          request_id: string
          started_at?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          arrived_at_destination?: string | null
          arrived_at_pickup?: string | null
          completed_at?: string | null
          created_at?: string
          destination_eta_minutes?: number | null
          distance_to_destination_km?: number | null
          distance_to_pickup_km?: number | null
          driver_id?: string
          driver_latitude?: number | null
          driver_longitude?: number | null
          id?: string
          pickup_eta_minutes?: number | null
          request_id?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_tracking_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          description: string | null
          driver_id: string
          id: string
          offer_id: string | null
          paid_at: string | null
          payment_method: string
          payment_status: string
          request_id: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          description?: string | null
          driver_id: string
          id?: string
          offer_id?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          request_id?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          description?: string | null
          driver_id?: string
          id?: string
          offer_id?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_status?: string
          request_id?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "driver_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
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
      conversations: {
        Row: {
          conversation_id: string | null
          last_message: string | null
          last_message_at: string | null
          offer_id: string | null
          other_user_id: string | null
          other_user_name: string | null
          request_id: string | null
          unread_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "driver_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      top_drivers: {
        Row: {
          average_rating: number | null
          avg_communication: number | null
          avg_professionalism: number | null
          avg_punctuality: number | null
          avg_vehicle_condition: number | null
          completed_rides: number | null
          driver_id: string | null
          driver_name: string | null
          total_ratings: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      approve_driver_verification: {
        Args: { verification_id: string }
        Returns: undefined
      }
      get_admin_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          monthly_revenue: number
          pending_verifications: number
          recent_requests: number
          recent_transactions: number
          total_drivers: number
        }[]
      }
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
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      reject_driver_verification: {
        Args: { rejection_reason: string; verification_id: string }
        Returns: undefined
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
