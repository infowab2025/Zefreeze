/*
  # Database Optimization and Automation

  1. New Indexes
    - Composite indexes for better query performance
    - Indexes for company-related queries
    - Indexes for intervention status tracking

  2. Functions
    - Equipment status automation
    - Statistics and reporting functions
    - Maintenance monitoring
*/

-- Add composite indexes for better query performance
CREATE INDEX IF NOT EXISTS equipment_company_type_idx ON equipment (company_id, type);
CREATE INDEX IF NOT EXISTS interventions_company_status_idx ON interventions (company_id, status);
CREATE INDEX IF NOT EXISTS reports_intervention_status_idx ON reports (intervention_id, status);

-- Add function to automatically update equipment status based on temperature readings
CREATE OR REPLACE FUNCTION update_equipment_status() RETURNS trigger AS $$
BEGIN
  -- Update equipment status based on intervention readings
  IF NEW.temperature_after IS NOT NULL THEN
    UPDATE equipment
    SET 
      status = CASE
        WHEN NEW.temperature_after > specifications->>'max_temp' THEN 'maintenance_needed'
        WHEN NEW.temperature_after < specifications->>'min_temp' THEN 'maintenance_needed'
        ELSE 'operational'
      END,
      updated_at = now()
    WHERE id = NEW.equipment_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for equipment status updates
DROP TRIGGER IF EXISTS update_equipment_status_trigger ON interventions;
CREATE TRIGGER update_equipment_status_trigger
  AFTER INSERT OR UPDATE OF temperature_after ON interventions
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_status();

-- Add function to get company equipment summary
CREATE OR REPLACE FUNCTION get_company_equipment_summary(company_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'operational', COUNT(*) FILTER (WHERE status = 'operational'),
    'maintenance_needed', COUNT(*) FILTER (WHERE status = 'maintenance_needed'),
    'out_of_service', COUNT(*) FILTER (WHERE status = 'out_of_service'),
    'by_type', json_build_object(
      'cold_storage', COUNT(*) FILTER (WHERE type = 'cold_storage'),
      'vmc', COUNT(*) FILTER (WHERE type = 'vmc'),
      'other', COUNT(*) FILTER (WHERE type = 'other')
    )
  ) INTO result
  FROM equipment
  WHERE company_id = $1;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get intervention statistics
CREATE OR REPLACE FUNCTION get_intervention_stats(company_id uuid, period text)
RETURNS json AS $$
DECLARE
  result json;
  period_start timestamp;
BEGIN
  -- Set period start date
  period_start := CASE period
    WHEN 'week' THEN date_trunc('week', now())
    WHEN 'month' THEN date_trunc('month', now())
    WHEN 'year' THEN date_trunc('year', now())
    ELSE date_trunc('month', now())
  END;

  SELECT json_build_object(
    'total', COUNT(*),
    'by_status', json_build_object(
      'pending', COUNT(*) FILTER (WHERE status = 'pending'),
      'scheduled', COUNT(*) FILTER (WHERE status = 'scheduled'),
      'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
      'completed', COUNT(*) FILTER (WHERE status = 'completed')
    ),
    'by_type', json_build_object(
      'repair', COUNT(*) FILTER (WHERE type = 'repair'),
      'maintenance', COUNT(*) FILTER (WHERE type = 'maintenance'),
      'installation', COUNT(*) FILTER (WHERE type = 'installation'),
      'audit', COUNT(*) FILTER (WHERE type = 'audit')
    ),
    'by_priority', json_build_object(
      'low', COUNT(*) FILTER (WHERE priority = 'low'),
      'medium', COUNT(*) FILTER (WHERE priority = 'medium'),
      'high', COUNT(*) FILTER (WHERE priority = 'high')
    )
  ) INTO result
  FROM interventions
  WHERE company_id = $1
  AND created_at >= period_start;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get report statistics
CREATE OR REPLACE FUNCTION get_report_stats(company_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'by_status', json_build_object(
      'draft', COUNT(*) FILTER (WHERE r.status = 'draft'),
      'pending_review', COUNT(*) FILTER (WHERE r.status = 'pending_review'),
      'approved', COUNT(*) FILTER (WHERE r.status = 'approved'),
      'rejected', COUNT(*) FILTER (WHERE r.status = 'rejected')
    ),
    'by_type', json_build_object(
      'intervention', COUNT(*) FILTER (WHERE r.type = 'intervention'),
      'haccp', COUNT(*) FILTER (WHERE r.type = 'haccp'),
      'maintenance', COUNT(*) FILTER (WHERE r.type = 'maintenance')
    ),
    'compliance', json_build_object(
      'compliant', COUNT(*) FILTER (WHERE (r.compliance->>'haccp')::boolean = true),
      'non_compliant', COUNT(*) FILTER (WHERE (r.compliance->>'haccp')::boolean = false)
    )
  ) INTO result
  FROM reports r
  JOIN interventions i ON r.intervention_id = i.id
  WHERE i.company_id = company_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check equipment maintenance status
CREATE OR REPLACE FUNCTION check_equipment_maintenance_status()
RETURNS void AS $$
BEGIN
  -- Update equipment status based on maintenance schedule
  UPDATE equipment
  SET 
    status = 'maintenance_needed',
    updated_at = now(),
    metadata = jsonb_set(
      metadata,
      '{maintenance_alert}',
      'true'
    )
  WHERE 
    next_maintenance_date <= now() + interval '1 week'
    AND status = 'operational';

  -- Create notifications for equipment needing maintenance
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    priority,
    metadata
  )
  SELECT 
    u.id,
    'maintenance',
    'Maintenance requise',
    'L''équipement ' || e.name || ' nécessite une maintenance',
    'medium',
    jsonb_build_object(
      'equipment_id', e.id,
      'company_id', e.company_id,
      'maintenance_date', e.next_maintenance_date
    )
  FROM equipment e
  JOIN users u ON e.company_id = u.company_id
  WHERE 
    e.next_maintenance_date <= now() + interval '1 week'
    AND e.status = 'maintenance_needed'
    AND u.role IN ('admin', 'technician');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;