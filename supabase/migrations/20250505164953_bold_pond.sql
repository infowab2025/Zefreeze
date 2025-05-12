/*
  # Add Feasibility Reports Table

  1. New Table
    - feasibility_reports
      - Stores project feasibility assessments
      - Tracks technical conditions and recommendations
      - Links to clients and technicians
    
  2. Security
    - RLS policies for access control
*/

-- Create feasibility_reports table
CREATE TABLE IF NOT EXISTS feasibility_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES users(id),
  location jsonb NOT NULL,
  project_type text NOT NULL CHECK (project_type IN ('cold_storage', 'vmc', 'other')),
  project_description text NOT NULL,
  technical_conditions jsonb NOT NULL,
  recommendations text NOT NULL,
  estimated_cost numeric,
  estimated_duration numeric,
  feasibility_score text NOT NULL CHECK (feasibility_score IN ('high', 'medium', 'low')),
  notes text,
  photos text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE feasibility_reports ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Technicians can create feasibility reports" ON feasibility_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'technician')
  );

CREATE POLICY "Users can view feasibility reports for their company" ON feasibility_reports
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    ) OR auth.jwt() ->> 'role' IN ('admin', 'technician')
  );

CREATE POLICY "Admins and technicians can update feasibility reports" ON feasibility_reports
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'technician')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'technician')
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS feasibility_reports_client_id_idx ON feasibility_reports(client_id);
CREATE INDEX IF NOT EXISTS feasibility_reports_technician_id_idx ON feasibility_reports(technician_id);
CREATE INDEX IF NOT EXISTS feasibility_reports_created_at_idx ON feasibility_reports(created_at);
CREATE INDEX IF NOT EXISTS feasibility_reports_project_type_idx ON feasibility_reports(project_type);
CREATE INDEX IF NOT EXISTS feasibility_reports_feasibility_score_idx ON feasibility_reports(feasibility_score);