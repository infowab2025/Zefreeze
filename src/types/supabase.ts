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
        }
        Insert: {
          id?: string
          name: string
          address: string
          phone?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          address?: string
          phone?: string | null
          email?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
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
        }
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
        }
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
        }
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
        }
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
  }
}