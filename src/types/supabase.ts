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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar: {
        Row: {
          calendar_id: string
          created_at: string
          updated_at: string | null
          use_yn: string
          user_id: string
        }
        Insert: {
          calendar_id: string
          created_at?: string
          updated_at?: string | null
          use_yn?: string
          user_id: string
        }
        Update: {
          calendar_id?: string
          created_at?: string
          updated_at?: string | null
          use_yn?: string
          user_id?: string
        }
        Relationships: []
      }
      centers: {
        Row: {
          id: number
          latitude_y: string | null
          longitude_x: string | null
          name: string | null
          radius: string | null
        }
        Insert: {
          id?: number
          latitude_y?: string | null
          longitude_x?: string | null
          name?: string | null
          radius?: string | null
        }
        Update: {
          id?: number
          latitude_y?: string | null
          longitude_x?: string | null
          name?: string | null
          radius?: string | null
        }
        Relationships: []
      }
      history: {
        Row: {
          created_at: string
          day_night: string
          event_id: string
          place_name: string
          user_id: string
          visit_date: string
        }
        Insert: {
          created_at?: string
          day_night?: string
          event_id: string
          place_name: string
          user_id: string
          visit_date: string
        }
        Update: {
          created_at?: string
          day_night?: string
          event_id?: string
          place_name?: string
          user_id?: string
          visit_date?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          address_name: string | null
          category_group_code: string | null
          category_group_name: string | null
          category_name: string | null
          created_at: string | null
          id: string
          latitude: string | null
          longitude: string | null
          phone: string | null
          place_name: string | null
          place_url: string | null
          road_address_name: string | null
          updated_at: string | null
        }
        Insert: {
          address_name?: string | null
          category_group_code?: string | null
          category_group_name?: string | null
          category_name?: string | null
          created_at?: string | null
          id: string
          latitude?: string | null
          longitude?: string | null
          phone?: string | null
          place_name?: string | null
          place_url?: string | null
          road_address_name?: string | null
          updated_at?: string | null
        }
        Update: {
          address_name?: string | null
          category_group_code?: string | null
          category_group_name?: string | null
          category_name?: string | null
          created_at?: string | null
          id?: string
          latitude?: string | null
          longitude?: string | null
          phone?: string | null
          place_name?: string | null
          place_url?: string | null
          road_address_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      call_bookmarks_with_places: {
        Row: {
          address_name: string | null
          category_group_code: string | null
          category_group_name: string | null
          category_name: string | null
          created_at: string | null
          id: string | null
          latitude: string | null
          longitude: string | null
          phone: string | null
          place_name: string | null
          place_url: string | null
          road_address_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
      call_places_with_history: {
        Row: {
          address_name: string | null
          category_name: string | null
          event_id: string | null
          id: string | null
          place_name: string | null
          place_url: string | null
          user_id: string | null
          visit_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_bookmarked_places: {
        Args: { p_user_id: string }
        Returns: {
          address_name: string
          bookmarked: string
          category_group_code: string
          category_group_name: string
          category_name: string
          created_at: string
          id: string
          latitude: string
          longitude: string
          phone: string
          place_name: string
          place_url: string
          road_address_name: string
          updated_at: string
        }[]
      }
      get_places_with_bookmarks: {
        Args: { p_user_id: string }
        Returns: {
          address_name: string
          bookmarked: string
          category_group_code: string
          category_group_name: string
          category_name: string
          created_at: string
          id: string
          latitude: string
          longitude: string
          phone: string
          place_name: string
          place_url: string
          road_address_name: string
          updated_at: string
        }[]
      }
      get_places_with_name_and_bookmarks: {
        Args: { p_place_names: string[]; p_user_id: string }
        Returns: {
          address_name: string
          bookmarked: string
          category_group_code: string
          category_group_name: string
          category_name: string
          created_at: string
          id: string
          latitude: string
          longitude: string
          phone: string
          place_name: string
          place_url: string
          road_address_name: string
          updated_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
