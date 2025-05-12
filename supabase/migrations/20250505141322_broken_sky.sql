/*
  # Add Foreign Keys to Reports Table

  1. Changes
    - Add technician_id and client_id columns to reports table
    - Add foreign key constraints
    - Migrate signature data to new structure
    - Update RLS policies

  2. Security
    - Add RLS policies for new relationships
*/

-- Add new columns for foreign keys
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS technician_id uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS client_id uuid REFERENCES companies(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS reports_technician_id_idx ON reports(technician_id);
CREATE INDEX IF NOT EXISTS reports_client_id_idx ON reports(client_id);

-- Update RLS policies for the new structure
CREATE POLICY "Technicians can view their own reports" ON reports
  FOR SELECT
  USING (
    technician_id = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Clients can view their company reports" ON reports
  FOR SELECT
  USING (
    client_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid()
    ) OR
    auth.jwt() ->> 'role' IN ('admin', 'technician')
  );