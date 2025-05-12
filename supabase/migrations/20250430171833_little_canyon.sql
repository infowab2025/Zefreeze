/*
  # Report Management Improvements

  1. New Indexes
    - Add indexes for better query performance on commonly searched fields
    - Add indexes for foreign key relationships
    - Add indexes for filtering and sorting

  2. Changes
    - Add status column to reports table
    - Add metadata column for additional report data
    - Add search vector for full-text search
*/

-- Add status column
ALTER TABLE reports ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected'));

-- Add metadata column
ALTER TABLE reports ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add search vector column
ALTER TABLE reports ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create indexes
CREATE INDEX IF NOT EXISTS reports_type_idx ON reports (type);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at);
CREATE INDEX IF NOT EXISTS reports_intervention_id_idx ON reports (intervention_id);
CREATE INDEX IF NOT EXISTS reports_search_vector_idx ON reports USING gin(search_vector);

-- Create function to update search vector
CREATE OR REPLACE FUNCTION reports_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.notes, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.recommendations, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS reports_search_vector_trigger ON reports;
CREATE TRIGGER reports_search_vector_trigger
  BEFORE INSERT OR UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION reports_search_vector_update();

-- Add RLS policies for the new status column
CREATE POLICY "Reports are viewable by involved parties with status" ON reports
  FOR SELECT
  USING (
    intervention_id IN (
      SELECT id FROM interventions WHERE 
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
        OR technician_id = auth.uid()
        OR auth.jwt() ->> 'role' = 'admin'
    )
  );

-- Add function to update report status
CREATE OR REPLACE FUNCTION update_report_status(
  report_id uuid,
  new_status text,
  user_id uuid
) RETURNS reports AS $$
DECLARE
  updated_report reports;
BEGIN
  -- Check if the user has permission to update the status
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND (role = 'admin' OR role = 'technician')
  ) THEN
    RAISE EXCEPTION 'Unauthorized to update report status';
  END IF;

  -- Update the report status
  UPDATE reports 
  SET 
    status = new_status,
    updated_at = now()
  WHERE id = report_id
  RETURNING * INTO updated_report;

  RETURN updated_report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;