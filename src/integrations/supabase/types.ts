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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      funnel_records: {
        Row: {
          conv_p1_p2: number | null
          conv_p1_p3: number | null
          conv_p2_p3: number | null
          created_at: string
          drop_p1_p2: number | null
          drop_p1_p3: number | null
          id: string
          observation: string | null
          p2: number
          p3: number
          project_id: string | null
          user_id: string
          visits_p1: number
        }
        Insert: {
          conv_p1_p2?: number | null
          conv_p1_p3?: number | null
          conv_p2_p3?: number | null
          created_at?: string
          drop_p1_p2?: number | null
          drop_p1_p3?: number | null
          id?: string
          observation?: string | null
          p2: number
          p3: number
          project_id?: string | null
          user_id: string
          visits_p1: number
        }
        Update: {
          conv_p1_p2?: number | null
          conv_p1_p3?: number | null
          conv_p2_p3?: number | null
          created_at?: string
          drop_p1_p2?: number | null
          drop_p1_p3?: number | null
          id?: string
          observation?: string | null
          p2?: number
          p3?: number
          project_id?: string | null
          user_id?: string
          visits_p1?: number
        }
        Relationships: [
          {
            foreignKeyName: "funnel_records_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          niche: string | null
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          niche?: string | null
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          niche?: string | null
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          adx_fee: number | null
          created_at: string
          dollar_rate: number | null
          id: string
          meta_fee: number | null
          tax_rate: number | null
          updated_at: string
          use_auto_dollar: boolean | null
          user_id: string
        }
        Insert: {
          adx_fee?: number | null
          created_at?: string
          dollar_rate?: number | null
          id?: string
          meta_fee?: number | null
          tax_rate?: number | null
          updated_at?: string
          use_auto_dollar?: boolean | null
          user_id: string
        }
        Update: {
          adx_fee?: number | null
          created_at?: string
          dollar_rate?: number | null
          id?: string
          meta_fee?: number | null
          tax_rate?: number | null
          updated_at?: string
          use_auto_dollar?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      simulations: {
        Row: {
          cpa: number | null
          cpa_ideal: number | null
          created_at: string
          dollar_rate: number
          id: string
          project_id: string | null
          results_count: number
          revenue_brl: number
          revenue_per_result: number | null
          revenue_usd: number
          roi: number | null
          status: string
          total_spent: number
          user_id: string
        }
        Insert: {
          cpa?: number | null
          cpa_ideal?: number | null
          created_at?: string
          dollar_rate: number
          id?: string
          project_id?: string | null
          results_count: number
          revenue_brl: number
          revenue_per_result?: number | null
          revenue_usd: number
          roi?: number | null
          status?: string
          total_spent: number
          user_id: string
        }
        Update: {
          cpa?: number | null
          cpa_ideal?: number | null
          created_at?: string
          dollar_rate?: number
          id?: string
          project_id?: string | null
          results_count?: number
          revenue_brl?: number
          revenue_per_result?: number | null
          revenue_usd?: number
          roi?: number | null
          status?: string
          total_spent?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
