/*
  # Reports Schema Improvements

  1. New Columns
    - status: Track report workflow status
    - metadata: Store flexible additional data
    - search_vector: Enable full-text search

  2. Indexes
    - Added performance optimizing indexes for common queries
    - Full-text search index for search_vector

  3. Functions
    - Added search vector update function
    - Added status update function with permission checks

  4. Security
    - Status update function runs with elevated privileges
    - Permission checks for status updates
*/

-- Add status column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'status'
  ) THEN
    ALTER TABLE reports ADD COLUMN status text NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected'));
  END IF;
END $$;

-- Add metadata column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE reports ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add search vector column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'search_vector'
  ) THEN
    ALTER TABLE reports ADD COLUMN search_vector tsvector;
  END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS reports_type_idx ON reports (type);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports (status);
CREATE INDEX IF NOT EXISTS reports_created_at_idx ON reports (created_at);
CREATE INDEX IF NOT EXISTS reports_intervention_id_idx ON reports (intervention_id);
CREATE INDEX IF NOT EXISTS reports_search_vector_idx ON reports USING gin(search_vector);

-- Create or replace function to update search vector
CREATE OR REPLACE FUNCTION reports_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('french', COALESCE(NEW.notes, '')), 'A') ||
    setweight(to_tsvector('french', COALESCE(NEW.recommendations, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger to ensure clean state
DROP TRIGGER IF EXISTS reports_search_vector_trigger ON reports;
CREATE TRIGGER reports_search_vector_trigger
  BEFORE INSERT OR UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION reports_search_vector_update();

-- Create or replace function to update report status
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