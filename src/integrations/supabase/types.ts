export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contractor_companies: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      meeting_note_attachments: {
        Row: {
          content_type: string | null
          created_at: string
          file_path: string
          filename: string
          id: string
          note_id: string
          size: number | null
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          file_path: string
          filename: string
          id?: string
          note_id: string
          size?: number | null
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          file_path?: string
          filename?: string
          id?: string
          note_id?: string
          size?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_note_attachments_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "meeting_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_note_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_notes: {
        Row: {
          contact_person: string | null
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          note_type: string
          participants: string | null
          project_id: string
          title: string
        }
        Insert: {
          contact_person?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          note_type: string
          participants?: string | null
          project_id: string
          title: string
        }
        Update: {
          contact_person?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          note_type?: string
          participants?: string | null
          project_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      processes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_index: number
          percentage: number | null
          project_id: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          percentage?: number | null
          project_id: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_index?: number
          percentage?: number | null
          project_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "processes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      project_files: {
        Row: {
          content_type: string | null
          created_at: string
          file_path: string
          filename: string
          id: string
          project_id: string
          size: number | null
          uploaded_by: string | null
        }
        Insert: {
          content_type?: string | null
          created_at?: string
          file_path: string
          filename: string
          id?: string
          project_id: string
          size?: number | null
          uploaded_by?: string | null
        }
        Update: {
          content_type?: string | null
          created_at?: string
          file_path?: string
          filename?: string
          id?: string
          project_id?: string
          size?: number | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          joined_at: string
          profile_id: string
          project_id: string
          role: string | null
        }
        Insert: {
          joined_at?: string
          profile_id: string
          project_id: string
          role?: string | null
        }
        Update: {
          joined_at?: string
          profile_id?: string
          project_id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_urls: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          project_id: string
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id: string
          title: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_urls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_urls_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          amount_excl_tax: number | null
          amount_incl_tax: number | null
          contractor_company_id: string | null
          created_at: string
          description: string | null
          design_period: string | null
          id: string
          owner_id: string
          progress: number | null
          status: string | null
          title: string
        }
        Insert: {
          amount_excl_tax?: number | null
          amount_incl_tax?: number | null
          contractor_company_id?: string | null
          created_at?: string
          description?: string | null
          design_period?: string | null
          id?: string
          owner_id: string
          progress?: number | null
          status?: string | null
          title: string
        }
        Update: {
          amount_excl_tax?: number | null
          amount_incl_tax?: number | null
          contractor_company_id?: string | null
          created_at?: string
          description?: string | null
          design_period?: string | null
          id?: string
          owner_id?: string
          progress?: number | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_contractor_company_id_fkey"
            columns: ["contractor_company_id"]
            isOneToOne: false
            referencedRelation: "contractor_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          process_id: string | null
          project_id: string
          status: string | null
          title: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          process_id?: string | null
          project_id: string
          status?: string | null
          title: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          process_id?: string | null
          project_id?: string
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_process_id_fkey"
            columns: ["process_id"]
            isOneToOne: false
            referencedRelation: "processes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
