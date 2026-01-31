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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ad_views: {
        Row: {
          ad_type: string
          completed: boolean
          created_at: string
          id: string
          rewarded: boolean
          user_id: string
        }
        Insert: {
          ad_type: string
          completed?: boolean
          created_at?: string
          id?: string
          rewarded?: boolean
          user_id: string
        }
        Update: {
          ad_type?: string
          completed?: boolean
          created_at?: string
          id?: string
          rewarded?: boolean
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      devotionals: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          scheduled_date: string
          scripture: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          scheduled_date: string
          scripture: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          scheduled_date?: string
          scripture?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          current_streak: number
          email: string
          email_verified: boolean
          id: string
          is_suspended: boolean
          last_ad_watch: string | null
          last_check_in: string | null
          referral_code: string
          referred_by: string | null
          tasks_completed: number
          total_earned: number
          updated_at: string
          user_id: string
          username: string | null
          wallet_address: string | null
        }
        Insert: {
          balance?: number
          created_at?: string
          current_streak?: number
          email: string
          email_verified?: boolean
          id?: string
          is_suspended?: boolean
          last_ad_watch?: string | null
          last_check_in?: string | null
          referral_code: string
          referred_by?: string | null
          tasks_completed?: number
          total_earned?: number
          updated_at?: string
          user_id: string
          username?: string | null
          wallet_address?: string | null
        }
        Update: {
          balance?: number
          created_at?: string
          current_streak?: number
          email?: string
          email_verified?: boolean
          id?: string
          is_suspended?: boolean
          last_ad_watch?: string | null
          last_check_in?: string | null
          referral_code?: string
          referred_by?: string | null
          tasks_completed?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
          username?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_paid: boolean
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          status: string
          tasks_completed: number
          updated_at: string
        }
        Insert: {
          bonus_paid?: boolean
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          status?: string
          tasks_completed?: number
          updated_at?: string
        }
        Update: {
          bonus_paid?: boolean
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          status?: string
          tasks_completed?: number
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      task_completions: {
        Row: {
          completed_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_completions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          action_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          platform: string | null
          requires_verification: boolean
          reward: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          platform?: string | null
          requires_verification?: boolean
          reward?: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          platform?: string | null
          requires_verification?: boolean
          reward?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          processed_at: string | null
          status: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      leaderboard_public: {
        Row: {
          id: string | null
          tasks_completed: number | null
          total_earned: number | null
          username: string | null
        }
        Insert: {
          id?: string | null
          tasks_completed?: number | null
          total_earned?: number | null
          username?: string | null
        }
        Update: {
          id?: string | null
          tasks_completed?: number | null
          total_earned?: number | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
