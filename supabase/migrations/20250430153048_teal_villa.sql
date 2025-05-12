/*
  # Initial Schema Setup for ZEFREEZE Application

  1. New Tables
    - users
      - Core user information and authentication
      - Stores user profiles, roles, and preferences
    
    - companies
      - Client company information
      - Stores business details and locations
    
    - equipment
      - Equipment/installation details
      - Tracks all managed equipment with specifications
    
    - interventions
      - Service interventions and maintenance records
      - Links technicians, equipment, and reports
    
    - reports
      - Technical reports for interventions
      - Stores inspection results and compliance data
    
    - messages
      - Internal messaging system
      - Communication between users
    
    - notifications
      - System notifications
      - Alerts and updates for users

  2. Security
    - RLS enabled on all tables
    - Role-based access policies
    - Data isolation between clients
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phone text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('admin', 'technician', 'client')),
  active boolean DEFAULT true,
  company_id uuid REFERENCES companies(id),
  preferences jsonb DEFAULT '{"notifications": {"email": true, "push": true}, "language": "fr", "timezone": "Europe/Paris"}'::jsonb,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cold_storage', 'vmc', 'other')),
  brand text NOT NULL,
  model text NOT NULL,
  serial_number text NOT NULL,
  installation_date date NOT NULL,
  status text NOT NULL DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance_needed', 'out_of_service')),
  specifications jsonb NOT NULL DEFAULT '{}'::jsonb,
  company_id uuid NOT NULL REFERENCES companies(id),
  last_maintenance_date timestamptz,
  next_maintenance_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Interventions table
CREATE TABLE IF NOT EXISTS interventions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('repair', 'maintenance', 'installation', 'audit')),
  category text NOT NULL CHECK (category IN ('cold_storage', 'vmc', 'haccp')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  description text NOT NULL,
  equipment_id uuid REFERENCES equipment(id),
  company_id uuid NOT NULL REFERENCES companies(id),
  technician_id uuid REFERENCES users(id),
  scheduled_date timestamptz,
  completed_date timestamptz,
  temperature_before numeric,
  temperature_after numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  intervention_id uuid NOT NULL REFERENCES interventions(id),
  type text NOT NULL CHECK (type IN ('intervention', 'haccp', 'maintenance')),
  notes text NOT NULL,
  recommendations text,
  photos text[],
  compliance jsonb DEFAULT '{"haccp": false, "refrigerant_leak": false, "frost": false}'::jsonb,
  technician_signature text,
  client_signature text,
  signed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_id uuid NOT NULL REFERENCES users(id),
  subject text NOT NULL,
  content text NOT NULL,
  intervention_id uuid REFERENCES interventions(id),
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  type text NOT NULL CHECK (type IN ('maintenance', 'alert', 'message', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Companies policies
CREATE POLICY "Companies are viewable by authenticated users" ON companies
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Companies are editable by admins" ON companies
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can manage users" ON users
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Equipment policies
CREATE POLICY "Equipment is viewable by company members" ON equipment
  FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    ) OR auth.jwt() ->> 'role' IN ('admin', 'technician')
  );

CREATE POLICY "Equipment is manageable by admins and technicians" ON equipment
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'technician'));

-- Interventions policies
CREATE POLICY "Interventions are viewable by involved parties" ON interventions
  FOR SELECT TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    ) OR technician_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Interventions are manageable by admins and technicians" ON interventions
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'technician'));

-- Reports policies
CREATE POLICY "Reports are viewable by involved parties" ON reports
  FOR SELECT TO authenticated
  USING (
    intervention_id IN (
      SELECT id FROM interventions WHERE 
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
        OR technician_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
    )
  );

CREATE POLICY "Reports are manageable by technicians" ON reports
  FOR ALL TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'technician')
  );

-- Messages policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Only system can create notifications" ON notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');