/*
  # Final Database Setup

  1. Changes
    - Add missing indexes for companies and users
    - Add missing RLS policies for reports
    - Add metadata columns for better tracking
    - Add cascade delete for related records

  2. Security
    - Additional RLS policies for data protection
    - Secure function for status updates
*/

-- Add indexes for companies
CREATE INDEX IF NOT EXISTS companies_name_idx ON companies (name);
CREATE INDEX IF NOT EXISTS companies_created_at_idx ON companies (created_at);

-- Add indexes for users
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_company_id_idx ON users (company_id);

-- Add metadata columns for better tracking
ALTER TABLE companies ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE interventions ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add cascade delete for related records
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_company_id_fkey,
  ADD CONSTRAINT users_company_id_fkey
    FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE;

ALTER TABLE equipment
  DROP CONSTRAINT IF EXISTS equipment_company_id_fkey,
  ADD CONSTRAINT equipment_company_id_fkey
    FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE;

ALTER TABLE interventions
  DROP CONSTRAINT IF EXISTS interventions_company_id_fkey,
  ADD CONSTRAINT interventions_company_id_fkey
    FOREIGN KEY (company_id)
    REFERENCES companies(id)
    ON DELETE CASCADE;

-- Add RLS policies for companies
CREATE POLICY "Companies are viewable by their members" ON companies
  FOR SELECT
  USING (
    id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    ) OR auth.jwt() ->> 'role' IN ('admin', 'technician')
  );

-- Add RLS policies for reports
CREATE POLICY "Reports are manageable by technicians and admins" ON reports
  FOR ALL
  USING (auth.jwt() ->> 'role' IN ('admin', 'technician'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'technician'));

-- Function to get company statistics
CREATE OR REPLACE FUNCTION get_company_stats(company_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'equipmentCount', (SELECT COUNT(*) FROM equipment WHERE company_id = $1),
    'userCount', (SELECT COUNT(*) FROM users WHERE company_id = $1),
    'interventionCount', (SELECT COUNT(*) FROM interventions WHERE company_id = $1),
    'lastIntervention', (
      SELECT json_build_object(
        'id', id,
        'date', created_at,
        'type', type,
        'status', status
      )
      FROM interventions 
      WHERE company_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;