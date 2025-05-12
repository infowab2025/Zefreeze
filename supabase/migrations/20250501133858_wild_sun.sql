/*
  # Add Statistics Functions

  1. Equipment Statistics
    - Distribution by type
    - Status overview
    - Maintenance tracking
  
  2. Intervention Statistics
    - Priority distribution
    - Resolution times
    - Type breakdown
  
  3. Compliance Statistics
    - HACCP compliance
    - Equipment status
    - Maintenance schedule
*/

-- Function to get equipment statistics
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

-- Function to get intervention statistics
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
    WHEN 'quarter' THEN date_trunc('quarter', now())
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

-- Function to calculate compliance scores
CREATE OR REPLACE FUNCTION calculate_compliance_score(company_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'overall_score', (
      SELECT 
        ROUND(
          (
            COUNT(*) FILTER (WHERE r.compliance->>'haccp' = 'true')::float * 0.4 +
            COUNT(*) FILTER (WHERE e.status = 'operational')::float * 0.3 +
            COUNT(*) FILTER (WHERE e.next_maintenance_date > now())::float * 0.3
          ) / NULLIF(COUNT(*), 0) * 100
        )
      FROM equipment e
      LEFT JOIN interventions i ON e.id = i.equipment_id
      LEFT JOIN reports r ON i.id = r.intervention_id
      WHERE e.company_id = $1
    ),
    'component_scores', json_build_object(
      'haccp_compliance', (
        SELECT ROUND(COUNT(*) FILTER (WHERE compliance->>'haccp' = 'true')::float / NULLIF(COUNT(*), 0) * 100)
        FROM reports r
        JOIN interventions i ON r.intervention_id = i.id
        WHERE i.company_id = $1
      ),
      'equipment_status', (
        SELECT ROUND(COUNT(*) FILTER (WHERE status = 'operational')::float / NULLIF(COUNT(*), 0) * 100)
        FROM equipment
        WHERE company_id = $1
      ),
      'maintenance_schedule', (
        SELECT ROUND(COUNT(*) FILTER (WHERE next_maintenance_date > now())::float / NULLIF(COUNT(*), 0) * 100)
        FROM equipment
        WHERE company_id = $1
      )
    ),
    'recent_violations', (
      SELECT json_agg(json_build_object(
        'equipment_name', e.name,
        'violation_type', 
        CASE
          WHEN r.compliance->>'haccp' = 'false' THEN 'HACCP non-compliance'
          WHEN e.status = 'maintenance_needed' THEN 'Maintenance overdue'
          ELSE 'Temperature violation'
        END,
        'date', GREATEST(r.created_at, e.updated_at)
      ))
      FROM equipment e
      LEFT JOIN interventions i ON e.id = i.equipment_id
      LEFT JOIN reports r ON i.id = r.intervention_id
      WHERE e.company_id = $1
      AND (
        r.compliance->>'haccp' = 'false'
        OR e.status = 'maintenance_needed'
        OR e.next_maintenance_date < now()
      )
      ORDER BY GREATEST(r.created_at, e.updated_at) DESC
      LIMIT 5
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;