export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      certification_exams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          passing_score: number
          questions: Json
          title: string
          total_questions: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          passing_score?: number
          questions?: Json
          title: string
          total_questions: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          passing_score?: number
          questions?: Json
          title?: string
          total_questions?: number
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          certificate_number: string
          created_at: string
          exam_id: string
          expires_date: string | null
          id: string
          issued_date: string
          user_id: string
        }
        Insert: {
          certificate_number: string
          created_at?: string
          exam_id: string
          expires_date?: string | null
          id?: string
          issued_date?: string
          user_id: string
        }
        Update: {
          certificate_number?: string
          created_at?: string
          exam_id?: string
          expires_date?: string | null
          id?: string
          issued_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certifications_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "certification_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          difficulty_level: string
          estimated_duration_minutes: number | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty_level?: string
          estimated_duration_minutes?: number | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty_level?: string
          estimated_duration_minutes?: number | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_alerts: {
        Row: {
          alert_type: string
          created_at: string
          id: string
          message: string
          read: boolean
          severity: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          severity?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          severity?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_reports: {
        Row: {
          created_at: string
          credit_score: number | null
          id: string
          provider: string
          report_data: Json
          report_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_score?: number | null
          id?: string
          provider?: string
          report_data?: Json
          report_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_score?: number | null
          id?: string
          provider?: string
          report_data?: Json
          report_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          amount: number | null
          created_at: string
          creditor_name: string | null
          dispute_date: string
          dispute_reason: string
          id: string
          item_description: string
          resolution_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          created_at?: string
          creditor_name?: string | null
          dispute_date?: string
          dispute_reason: string
          id?: string
          item_description: string
          resolution_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number | null
          created_at?: string
          creditor_name?: string | null
          dispute_date?: string
          dispute_reason?: string
          id?: string
          item_description?: string
          resolution_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      exam_attempts: {
        Row: {
          answers: Json
          completed_at: string
          created_at: string
          exam_id: string
          id: string
          passed: boolean
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          completed_at?: string
          created_at?: string
          exam_id: string
          id?: string
          passed: boolean
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          completed_at?: string
          created_at?: string
          exam_id?: string
          id?: string
          passed?: boolean
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "certification_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string
          course_id: string
          created_at: string
          id: string
          lesson_order: number
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string
          id?: string
          lesson_order: number
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string
          id?: string
          lesson_order?: number
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_logs: {
        Row: {
          calories: number | null
          carbs_g: number | null
          created_at: string
          date: string
          fat_g: number | null
          food_item: string
          id: string
          meal_type: string
          protein_g: number | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          date?: string
          fat_g?: number | null
          food_item: string
          id?: string
          meal_type: string
          protein_g?: number | null
          user_id: string
        }
        Update: {
          calories?: number | null
          carbs_g?: number | null
          created_at?: string
          date?: string
          fat_g?: number | null
          food_item?: string
          id?: string
          meal_type?: string
          protein_g?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string
          fitness_goals: string[] | null
          fitness_level: string | null
          full_name: string | null
          height_cm: number | null
          id: string
          updated_at: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email: string
          fitness_goals?: string[] | null
          fitness_level?: string | null
          full_name?: string | null
          height_cm?: number | null
          id?: string
          updated_at?: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string
          fitness_goals?: string[] | null
          fitness_level?: string | null
          full_name?: string | null
          height_cm?: number | null
          id?: string
          updated_at?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      progress_logs: {
        Row: {
          body_fat_percentage: number | null
          created_at: string
          date: string
          id: string
          muscle_mass_kg: number | null
          notes: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          body_fat_percentage?: number | null
          created_at?: string
          date?: string
          id?: string
          muscle_mass_kg?: number | null
          notes?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          body_fat_percentage?: number | null
          created_at?: string
          date?: string
          id?: string
          muscle_mass_kg?: number | null
          notes?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean
          completion_date: string | null
          course_id: string
          created_at: string
          id: string
          lesson_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          completion_date?: string | null
          course_id: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          completion_date?: string | null
          course_id?: string
          created_at?: string
          id?: string
          lesson_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string | null
          duration_minutes: number | null
          exercises: Json
          id: string
          title: string
          updated_at: string
          user_id: string
          workout_type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          title: string
          updated_at?: string
          user_id: string
          workout_type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string | null
          duration_minutes?: number | null
          exercises?: Json
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          workout_type?: string
        }
        Relationships: []
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
