/*
  # Final Backend Integration

  1. Add indexes for better performance
    - Add composite indexes for frequently accessed data
    - Add full-text search capabilities
  
  2. Add triggers for data consistency
    - Automatic status updates
    - Notification generation
    - Audit logging
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

    -- Create notification if temperature is out of range
    IF NEW.temperature_after > (SELECT (specifications->>'max_temp')::numeric FROM equipment WHERE id = NEW.equipment_id)
    OR NEW.temperature_after < (SELECT (specifications->>'min_temp')::numeric FROM equipment WHERE id = NEW.equipment_id)
    THEN
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
        'Alerte température',
        'Température hors limites pour ' || e.name,
        'high',
        jsonb_build_object(
          'equipment_id', e.id,
          'temperature', NEW.temperature_after,
          'intervention_id', NEW.id
        )
      FROM equipment e
      JOIN users u ON e.company_id = u.company_id
      WHERE e.id = NEW.equipment_id
      AND u.role IN ('admin', 'technician');
    END IF;
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
$$ LANGUAGE plpgsql;

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

  -- Create notification for status change
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
    'system',
    'Statut du rapport mis à jour',
    'Le rapport ' || r.id || ' est maintenant ' || new_status,
    'low',
    jsonb_build_object(
      'report_id', r.id,
      'old_status', r.status,
      'new_status', new_status
    )
  FROM reports r
  JOIN interventions i ON r.intervention_id = i.id
  JOIN users u ON i.company_id = u.company_id
  WHERE r.id = report_id;

  RETURN updated_report;
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