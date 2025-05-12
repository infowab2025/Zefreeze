export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string
          name: string
          address: string
          phone: string | null
          email: string | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          id: string
          name: string
          type: 'cold_storage' | 'vmc' | 'other'
          brand: string
          model: string
          serial_number: string
          installation_date: string
          status: 'operational' | 'maintenance_needed' | 'out_of_service'
          specifications: Json
          company_id: string
          last_maintenance_date: string | null
          next_maintenance_date: string | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          name: string
          type: 'cold_storage' | 'vmc' | 'other'
          brand: string
          model: string
          serial_number: string
          installation_date: string
          status?: 'operational' | 'maintenance_needed' | 'out_of_service'
          specifications?: Json
          company_id: string
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          name?: string
          type?: 'cold_storage' | 'vmc' | 'other'
          brand?: string
          model?: string
          serial_number?: string
          installation_date?: string
          status?: 'operational' | 'maintenance_needed' | 'out_of_service'
          specifications?: Json
          company_id?: string
          last_maintenance_date?: string | null
          next_maintenance_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      feasibility_reports: {
        Row: {
          id: string
          client_id: string
          technician_id: string
          location: Json
          project_type: 'cold_storage' | 'vmc' | 'other'
          project_description: string
          technical_conditions: Json
          recommendations: string
          estimated_cost: number | null
          estimated_duration: number | null
          feasibility_score: 'high' | 'medium' | 'low'
          notes: string | null
          photos: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_id: string
          technician_id: string
          location: Json
          project_type: 'cold_storage' | 'vmc' | 'other'
          project_description: string
          technical_conditions: Json
          recommendations: string
          estimated_cost?: number | null
          estimated_duration?: number | null
          feasibility_score: 'high' | 'medium' | 'low'
          notes?: string | null
          photos?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          technician_id?: string
          location?: Json
          project_type?: 'cold_storage' | 'vmc' | 'other'
          project_description?: string
          technical_conditions?: Json
          recommendations?: string
          estimated_cost?: number | null
          estimated_duration?: number | null
          feasibility_score?: 'high' | 'medium' | 'low'
          notes?: string | null
          photos?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feasibility_reports_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feasibility_reports_technician_id_fkey"
            columns: ["technician_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      installation_requests: {
        Row: {
          id: string
          company_id: string
          type: 'cold_storage' | 'vmc' | 'other'
          description: string
          location: Json
          preferred_date: string | null
          status: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled'
          technician_id: string | null
          scheduled_date: string | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          company_id: string
          type: 'cold_storage' | 'vmc' | 'other'
          description: string
          location: Json
          preferred_date?: string | null
          status?: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled'
          technician_id?: string | null
          scheduled_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          company_id?: string
          type?: 'cold_storage' | 'vmc' | 'other'
          description?: string
          location?: Json
          preferred_date?: string | null
          status?: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled'
          technician_id?: string | null
          scheduled_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "installation_requests_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "installation_requests_technician_id_fkey"
            columns: ["technician_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      interventions: {
        Row: {
          id: string
          type: 'repair' | 'maintenance' | 'installation' | 'audit'
          category: 'cold_storage' | 'vmc' | 'haccp'
          status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high'
          description: string
          equipment_id: string | null
          company_id: string
          technician_id: string | null
          scheduled_date: string | null
          completed_date: string | null
          temperature_before: number | null
          temperature_after: number | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          type: 'repair' | 'maintenance' | 'installation' | 'audit'
          category: 'cold_storage' | 'vmc' | 'haccp'
          status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          priority: 'low' | 'medium' | 'high'
          description: string
          equipment_id?: string | null
          company_id: string
          technician_id?: string | null
          scheduled_date?: string | null
          completed_date?: string | null
          temperature_before?: number | null
          temperature_after?: number | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          type?: 'repair' | 'maintenance' | 'installation' | 'audit'
          category?: 'cold_storage' | 'vmc' | 'haccp'
          status?: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          description?: string
          equipment_id?: string | null
          company_id?: string
          technician_id?: string | null
          scheduled_date?: string | null
          completed_date?: string | null
          temperature_before?: number | null
          temperature_after?: number | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "interventions_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_equipment_id_fkey"
            columns: ["equipment_id"]
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interventions_technician_id_fkey"
            columns: ["technician_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      material_kits: {
        Row: {
          id: string
          name: string
          type: 'cold_storage' | 'vmc' | 'other'
          description: string
          base_price: number
          items: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          type: 'cold_storage' | 'vmc' | 'other'
          description: string
          base_price: number
          items: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          type?: 'cold_storage' | 'vmc' | 'other'
          description?: string
          base_price?: number
          items?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string
          subject: string
          content: string
          intervention_id: string | null
          read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id: string
          subject: string
          content: string
          intervention_id?: string | null
          read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          recipient_id?: string
          subject?: string
          content?: string
          intervention_id?: string | null
          read?: boolean | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_intervention_id_fkey"
            columns: ["intervention_id"]
            referencedRelation: "interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'maintenance' | 'alert' | 'message' | 'system'
          title: string
          message: string
          priority: 'low' | 'medium' | 'high'
          read: boolean | null
          metadata: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: 'maintenance' | 'alert' | 'message' | 'system'
          title: string
          message: string
          priority: 'low' | 'medium' | 'high'
          read?: boolean | null
          metadata?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'maintenance' | 'alert' | 'message' | 'system'
          title?: string
          message?: string
          priority?: 'low' | 'medium' | 'high'
          read?: boolean | null
          metadata?: Json | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      quote_requests: {
        Row: {
          id: string
          company_id: string
          contact_name: string
          contact_email: string
          contact_phone: string
          type: 'cold_storage' | 'vmc' | 'other'
          description: string
          location: Json
          preferred_date: string | null
          status: 'pending' | 'confirmed' | 'rejected'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          company_id: string
          contact_name: string
          contact_email: string
          contact_phone: string
          type: 'cold_storage' | 'vmc' | 'other'
          description: string
          location: Json
          preferred_date?: string | null
          status?: 'pending' | 'confirmed' | 'rejected'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          company_id?: string
          contact_name?: string
          contact_email?: string
          contact_phone?: string
          type?: 'cold_storage' | 'vmc' | 'other'
          description?: string
          location?: Json
          preferred_date?: string | null
          status?: 'pending' | 'confirmed' | 'rejected'
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quote_requests_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
      quotes: {
        Row: {
          id: string
          request_id: string | null
          company_id: string
          contact_name: string
          contact_email: string
          contact_phone: string
          type: 'cold_storage' | 'vmc' | 'other'
          description: string
          location: Json
          kit_id: string | null
          kit_name: string | null
          items: Json
          subtotal: number
          discount: number
          discount_type: 'percentage' | 'amount'
          tax: number
          total: number
          status: 'draft' | 'prepared' | 'sent' | 'accepted' | 'paid' | 'rejected' | 'expired'
          payment_status: 'unpaid' | 'partial' | 'paid' | null
          deposit_amount: number | null
          deposit_paid: boolean | null
          expiry_date: string
          notes: string | null
          terms_accepted: boolean | null
          pdf_url: string | null
          created_at: string | null
          updated_at: string | null
          sent_at: string | null
          accepted_at: string | null
          paid_at: string | null
        }
        Insert: {
          id?: string
          request_id?: string | null
          company_id: string
          contact_name: string
          contact_email: string
          contact_phone: string
          type: 'cold_storage' | 'vmc' | 'other'
          description: string
          location: Json
          kit_id?: string | null
          kit_name?: string | null
          items: Json
          subtotal: number
          discount?: number
          discount_type?: 'percentage' | 'amount'
          tax: number
          total: number
          status?: 'draft' | 'prepared' | 'sent' | 'accepted' | 'paid' | 'rejected' | 'expired'
          payment_status?: 'unpaid' | 'partial' | 'paid' | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          expiry_date: string
          notes?: string | null
          terms_accepted?: boolean | null
          pdf_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          sent_at?: string | null
          accepted_at?: string | null
          paid_at?: string | null
        }
        Update: {
          id?: string
          request_id?: string | null
          company_id?: string
          contact_name?: string
          contact_email?: string
          contact_phone?: string
          type?: 'cold_storage' | 'vmc' | 'other'
          description?: string
          location?: Json
          kit_id?: string | null
          kit_name?: string | null
          items?: Json
          subtotal?: number
          discount?: number
          discount_type?: 'percentage' | 'amount'
          tax?: number
          total?: number
          status?: 'draft' | 'prepared' | 'sent' | 'accepted' | 'paid' | 'rejected' | 'expired'
          payment_status?: 'unpaid' | 'partial' | 'paid' | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          expiry_date?: string
          notes?: string | null
          terms_accepted?: boolean | null
          pdf_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          sent_at?: string | null
          accepted_at?: string | null
          paid_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_kit_id_fkey"
            columns: ["kit_id"]
            referencedRelation: "material_kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_request_id_fkey"
            columns: ["request_id"]
            referencedRelation: "quote_requests"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          intervention_id: string
          type: 'intervention' | 'haccp' | 'maintenance'
          notes: string
          recommendations: string | null
          photos: string[] | null
          compliance: Json | null
          technician_signature: string | null
          client_signature: string | null
          signed_at: string | null
          created_at: string | null
          updated_at: string | null
          status: 'draft' | 'pending_review' | 'approved' | 'rejected'
          metadata: Json | null
          search_vector: unknown | null
          technician_id: string | null
          client_id: string | null
        }
        Insert: {
          id?: string
          intervention_id: string
          type: 'intervention' | 'haccp' | 'maintenance'
          notes: string
          recommendations?: string | null
          photos?: string[] | null
          compliance?: Json | null
          technician_signature?: string | null
          client_signature?: string | null
          signed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          status?: 'draft' | 'pending_review' | 'approved' | 'rejected'
          metadata?: Json | null
          search_vector?: unknown | null
          technician_id?: string | null
          client_id?: string | null
        }
        Update: {
          id?: string
          intervention_id?: string
          type?: 'intervention' | 'haccp' | 'maintenance'
          notes?: string
          recommendations?: string | null
          photos?: string[] | null
          compliance?: Json | null
          technician_signature?: string | null
          client_signature?: string | null
          signed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          status?: 'draft' | 'pending_review' | 'approved' | 'rejected'
          metadata?: Json | null
          search_vector?: unknown | null
          technician_id?: string | null
          client_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_intervention_id_fkey"
            columns: ["intervention_id"]
            referencedRelation: "interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_technician_id_fkey"
            columns: ["technician_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      technician_availability: {
        Row: {
          id: string
          technician_id: string
          date: string
          available: boolean
          slots: Json
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          technician_id: string
          date: string
          available?: boolean
          slots?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          technician_id?: string
          date?: string
          available?: boolean
          slots?: Json
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "technician_availability_technician_id_fkey"
            columns: ["technician_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      temperature_logs: {
        Row: {
          id: string
          equipment_id: string
          technician_id: string
          temperature: number
          is_compliant: boolean
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          equipment_id: string
          technician_id: string
          temperature: number
          is_compliant: boolean
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          equipment_id?: string
          technician_id?: string
          temperature?: number
          is_compliant?: boolean
          notes?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temperature_logs_equipment_id_fkey"
            columns: ["equipment_id"]
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "temperature_logs_technician_id_fkey"
            columns: ["technician_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          role: 'admin' | 'technician' | 'client'
          active: boolean | null
          company_id: string | null
          preferences: Json | null
          last_login_at: string | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          role: 'admin' | 'technician' | 'client'
          active?: boolean | null
          company_id?: string | null
          preferences?: Json | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          role?: 'admin' | 'technician' | 'client'
          active?: boolean | null
          company_id?: string | null
          preferences?: Json | null
          last_login_at?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      analyze_maintenance_patterns: {
        Args: {
          equipment_id: string
        }
        Returns: Json
      }
      analyze_performance_metrics: {
        Args: {
          company_id: string
          start_date: string
          end_date: string
        }
        Returns: Json
      }
      assign_technician_to_request: {
        Args: {
          p_request_id: string
          p_technician_id: string
          p_scheduled_date: string
        }
        Returns: {
          id: string
          company_id: string
          type: string
          description: string
          location: Json
          preferred_date: string | null
          status: string
          technician_id: string | null
          scheduled_date: string | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
      }
      calculate_compliance_score: {
        Args: {
          company_id: string
        }
        Returns: Json
      }
      find_available_technicians: {
        Args: {
          p_date: string
          p_slot?: string
          p_expertise?: string
        }
        Returns: {
          id: string
          name: string
          email: string
          expertise: Json
          current_load: number
        }[]
      }
      gen_seed_uuid: {
        Args: {
          seed: string
        }
        Returns: string
      }
      generate_compliance_report: {
        Args: {
          company_id: string
        }
        Returns: Json
      }
      get_available_technicians: {
        Args: {
          request_date: string
          installation_type: string
        }
        Returns: {
          technician_id: string
          name: string
          availability: Json
          expertise: string[]
          current_load: number
        }[]
      }
      get_company_equipment_summary: {
        Args: {
          company_id: string
        }
        Returns: Json
      }
      get_company_stats: {
        Args: {
          company_id: string
        }
        Returns: Json
      }
      get_intervention_stats: {
        Args: {
          company_id: string
          period: string
        }
        Returns: Json
      }
      get_random_uuid: {
        Args: {
          seed: string
        }
        Returns: string
      }
      get_report_stats: {
        Args: {
          company_id: string
        }
        Returns: Json
      }
      is_technician_available: {
        Args: {
          p_technician_id: string
          p_date: string
          p_slot?: string
        }
        Returns: boolean
      }
      monitor_temperature_trends: {
        Args: {
          equipment_id: string
          time_window: unknown
        }
        Returns: Json
      }
      update_report_status: {
        Args: {
          report_id: string
          new_status: string
          user_id: string
        }
        Returns: {
          id: string
          intervention_id: string
          type: string
          notes: string
          recommendations: string | null
          photos: string[] | null
          compliance: Json | null
          technician_signature: string | null
          client_signature: string | null
          signed_at: string | null
          created_at: string | null
          updated_at: string | null
          status: string
          metadata: Json | null
          search_vector: unknown | null
          technician_id: string | null
          client_id: string | null
        }
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