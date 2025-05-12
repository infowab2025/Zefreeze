/*
  # Database Optimization and Automation

  1. New Functions
    - Automated equipment status updates based on temperature readings
    - Company statistics and reporting functions
    - Maintenance monitoring and notification system
    
  2. Indexes
    - Composite indexes for improved query performance
    - Search vector indexes for report content
    
  3. Triggers
    - Equipment status update automation
    - Report search vector updates
*/

-- Add composite indexes for better query performance
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'equipment_company_type_idx') THEN
    CREATE INDEX equipment_company_type_idx ON equipment (company_id, type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'interventions_company_status_idx') THEN
    CREATE INDEX interventions_company_status_idx ON interventions (company_id, status);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'reports_intervention_status_idx') THEN
    CREATE INDEX reports_intervention_status_idx ON reports (intervention_id, status);
  END IF;
END $$;

-- Add function to automatically update equipment status based on temperature readings
CREATE OR REPLACE FUNCTION update_equipment_status() RETURNS trigger AS $$
BEGIN
  -- Update equipment status based on intervention readings
  IF NEW.temperature_after IS NOT NULL THEN
    UPDATE equipment
    SET 
      status = CASE
        WHEN NEW.temperature_after > (specifications->>'max_temp')::numeric THEN 'maintenance_needed'
        WHEN NEW.temperature_after < (specifications->>'min_temp')::numeric THEN 'maintenance_needed'
        ELSE 'operational'
      END,
      updated_at = now(),
      metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{last_temperature_check}',
        to_jsonb(now())
      )
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

-- Add function to get company equipment summary with maintenance predictions
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
    ),
    'maintenance_predictions', (
      SELECT json_agg(json_build_object(
        'id', id,
        'name', name,
        'next_maintenance', next_maintenance_date,
        'days_until_maintenance', 
        EXTRACT(DAY FROM (next_maintenance_date - CURRENT_DATE))
      ))
      FROM equipment
      WHERE company_id = $1
      AND next_maintenance_date IS NOT NULL
      AND next_maintenance_date <= CURRENT_DATE + interval '30 days'
      ORDER BY next_maintenance_date
      LIMIT 5
    )
  ) INTO result
  FROM equipment
  WHERE company_id = $1;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get detailed intervention analytics
CREATE OR REPLACE FUNCTION get_intervention_analytics(company_id uuid, start_date date, end_date date)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'summary', json_build_object(
      'total_count', COUNT(*),
      'average_completion_time', 
      AVG(EXTRACT(EPOCH FROM (completed_date - created_at))/3600)
    ),
    'by_type', (
      SELECT json_object_agg(type, count)
      FROM (
        SELECT type, COUNT(*) as count
        FROM interventions
        WHERE company_id = $1
        AND created_at BETWEEN $2 AND $3
        GROUP BY type
      ) t
    ),
    'by_priority', (
      SELECT json_object_agg(priority, count)
      FROM (
        SELECT priority, COUNT(*) as count
        FROM interventions
        WHERE company_id = $1
        AND created_at BETWEEN $2 AND $3
        GROUP BY priority
      ) p
    ),
    'temperature_stats', (
      SELECT json_build_object(
        'average_improvement', 
        AVG(temperature_before - temperature_after),
        'compliant_count',
        COUNT(*) FILTER (
          WHERE temperature_after BETWEEN 
            (e.specifications->>'min_temp')::numeric 
            AND (e.specifications->>'max_temp')::numeric
        )
      )
      FROM interventions i
      JOIN equipment e ON i.equipment_id = e.id
      WHERE i.company_id = $1
      AND i.created_at BETWEEN $2 AND $3
      AND i.temperature_before IS NOT NULL
      AND i.temperature_after IS NOT NULL
    )
  ) INTO result
  FROM interventions
  WHERE company_id = $1
  AND created_at BETWEEN $2 AND $3;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to generate compliance report
CREATE OR REPLACE FUNCTION generate_compliance_report(company_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'equipment_compliance', (
      SELECT json_build_object(
        'total_equipment', COUNT(*),
        'compliant_equipment', COUNT(*) FILTER (
          WHERE status = 'operational'
        ),
        'maintenance_needed', COUNT(*) FILTER (
          WHERE status = 'maintenance_needed'
        ),
        'temperature_compliance', (
          SELECT COUNT(*) 
          FROM interventions i
          WHERE i.company_id = $1
          AND i.completed_date >= CURRENT_DATE - interval '30 days'
          AND i.temperature_after BETWEEN 
            (e.specifications->>'min_temp')::numeric 
            AND (e.specifications->>'max_temp')::numeric
        )
      )
      FROM equipment e
      WHERE e.company_id = $1
    ),
    'haccp_compliance', (
      SELECT json_build_object(
        'total_reports', COUNT(*),
        'compliant_reports', COUNT(*) FILTER (
          WHERE (compliance->>'haccp')::boolean = true
        ),
        'last_audit_date', MAX(created_at)
      )
      FROM reports r
      JOIN interventions i ON r.intervention_id = i.id
      WHERE i.company_id = $1
      AND r.type = 'haccp'
    ),
    'maintenance_compliance', (
      SELECT json_build_object(
        'scheduled_maintenance_completed', COUNT(*) FILTER (
          WHERE type = 'maintenance' 
          AND status = 'completed'
        ),
        'overdue_maintenance', COUNT(*) FILTER (
          WHERE next_maintenance_date < CURRENT_DATE
        )
      )
      FROM equipment
      WHERE company_id = $1
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to monitor critical temperature thresholds
CREATE OR REPLACE FUNCTION monitor_temperature_thresholds()
RETURNS void AS $$
BEGIN
  -- Create alerts for equipment with critical temperature readings
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
    'alert',
    'Alerte température critique',
    'Température hors limites pour ' || e.name,
    'high',
    jsonb_build_object(
      'equipment_id', e.id,
      'company_id', e.company_id,
      'temperature', i.temperature_after,
      'threshold_min', (e.specifications->>'min_temp')::numeric,
      'threshold_max', (e.specifications->>'max_temp')::numeric
    )
  FROM interventions i
  JOIN equipment e ON i.equipment_id = e.id
  JOIN users u ON e.company_id = u.company_id
  WHERE i.completed_date >= CURRENT_TIMESTAMP - interval '1 hour'
  AND i.temperature_after IS NOT NULL
  AND (
    i.temperature_after < (e.specifications->>'min_temp')::numeric
    OR i.temperature_after > (e.specifications->>'max_temp')::numeric
  )
  AND u.role IN ('admin', 'technician');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;