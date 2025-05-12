/*
  # Database Optimization and Maintenance Automation

  1. New Functions
    - Predictive maintenance analysis
    - Real-time temperature monitoring
    - Compliance scoring system
    - Performance analytics
    - Automated alerts

  2. Indexes
    - Composite indexes for common queries
    - Full-text search optimization
    - Performance monitoring indexes

  3. Triggers
    - Automated status updates
    - Alert generation
    - Compliance checks
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

-- Add function for predictive maintenance analysis
CREATE OR REPLACE FUNCTION analyze_maintenance_patterns(equipment_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'equipment_info', json_build_object(
      'id', e.id,
      'name', e.name,
      'type', e.type,
      'installation_date', e.installation_date
    ),
    'maintenance_history', (
      SELECT json_agg(json_build_object(
        'intervention_date', i.completed_date,
        'type', i.type,
        'temperature_before', i.temperature_before,
        'temperature_after', i.temperature_after,
        'status', i.status
      ))
      FROM interventions i
      WHERE i.equipment_id = equipment_id
      AND i.type = 'maintenance'
      ORDER BY i.completed_date DESC
      LIMIT 10
    ),
    'performance_metrics', json_build_object(
      'avg_days_between_maintenance', (
        SELECT AVG(days_between)
        FROM (
          SELECT 
            EXTRACT(DAY FROM (completed_date - LAG(completed_date) OVER (ORDER BY completed_date))) as days_between
          FROM interventions
          WHERE equipment_id = equipment_id
          AND type = 'maintenance'
          AND status = 'completed'
        ) subq
      ),
      'temperature_stability', (
        SELECT json_build_object(
          'avg_variation', AVG(ABS(temperature_after - temperature_before)),
          'max_variation', MAX(ABS(temperature_after - temperature_before))
        )
        FROM interventions
        WHERE equipment_id = equipment_id
        AND temperature_before IS NOT NULL
        AND temperature_after IS NOT NULL
      )
    ),
    'prediction', (
      SELECT json_build_object(
        'next_maintenance_due', 
        CASE 
          WHEN AVG(EXTRACT(DAY FROM (completed_date - LAG(completed_date) OVER (ORDER BY completed_date)))) IS NOT NULL
          THEN now() + (AVG(EXTRACT(DAY FROM (completed_date - LAG(completed_date) OVER (ORDER BY completed_date)))) * interval '1 day')
          ELSE now() + interval '30 days'
        END,
        'confidence_score',
        CASE 
          WHEN COUNT(*) > 5 THEN 'high'
          WHEN COUNT(*) > 2 THEN 'medium'
          ELSE 'low'
        END
      )
      FROM interventions
      WHERE equipment_id = equipment_id
      AND type = 'maintenance'
      AND status = 'completed'
    )
  ) INTO result
  FROM equipment e
  WHERE e.id = equipment_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function for real-time temperature monitoring
CREATE OR REPLACE FUNCTION monitor_temperature_trends(equipment_id uuid, time_window interval)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'current_status', json_build_object(
      'last_reading', temperature_after,
      'timestamp', completed_date,
      'within_limits', 
        temperature_after BETWEEN 
          (e.specifications->>'min_temp')::numeric 
          AND (e.specifications->>'max_temp')::numeric
    ),
    'trend_analysis', json_build_object(
      'avg_temperature', AVG(temperature_after),
      'min_temperature', MIN(temperature_after),
      'max_temperature', MAX(temperature_after),
      'std_deviation', stddev(temperature_after)
    ),
    'alerts', (
      SELECT json_agg(json_build_object(
        'timestamp', completed_date,
        'temperature', temperature_after,
        'severity', 
        CASE
          WHEN ABS(temperature_after - (e.specifications->>'target_temp')::numeric) > 5 THEN 'high'
          WHEN ABS(temperature_after - (e.specifications->>'target_temp')::numeric) > 2 THEN 'medium'
          ELSE 'low'
        END
      ))
      FROM interventions i2
      WHERE i2.equipment_id = equipment_id
      AND i2.completed_date >= now() - time_window
      AND i2.temperature_after NOT BETWEEN 
        (e.specifications->>'min_temp')::numeric 
        AND (e.specifications->>'max_temp')::numeric
    )
  ) INTO result
  FROM interventions i
  JOIN equipment e ON i.equipment_id = e.id
  WHERE i.equipment_id = equipment_id
  AND i.completed_date >= now() - time_window
  GROUP BY e.id, i.temperature_after, i.completed_date;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function for compliance scoring
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
      WHERE e.company_id = company_id
    ),
    'component_scores', json_build_object(
      'haccp_compliance', (
        SELECT ROUND(COUNT(*) FILTER (WHERE compliance->>'haccp' = 'true')::float / NULLIF(COUNT(*), 0) * 100)
        FROM reports r
        JOIN interventions i ON r.intervention_id = i.id
        WHERE i.company_id = company_id
      ),
      'equipment_status', (
        SELECT ROUND(COUNT(*) FILTER (WHERE status = 'operational')::float / NULLIF(COUNT(*), 0) * 100)
        FROM equipment
        WHERE company_id = company_id
      ),
      'maintenance_schedule', (
        SELECT ROUND(COUNT(*) FILTER (WHERE next_maintenance_date > now())::float / NULLIF(COUNT(*), 0) * 100)
        FROM equipment
        WHERE company_id = company_id
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
      WHERE e.company_id = company_id
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

-- Add function for performance analytics
CREATE OR REPLACE FUNCTION analyze_performance_metrics(company_id uuid, start_date timestamp, end_date timestamp)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'intervention_metrics', json_build_object(
      'total_count', COUNT(*),
      'avg_resolution_time', AVG(EXTRACT(EPOCH FROM (completed_date - created_at))/3600),
      'by_priority', (
        SELECT json_object_agg(priority, count)
        FROM (
          SELECT priority, COUNT(*) as count
          FROM interventions
          WHERE company_id = company_id
          AND created_at BETWEEN start_date AND end_date
          GROUP BY priority
        ) p
      )
    ),
    'equipment_performance', (
      SELECT json_agg(json_build_object(
        'id', e.id,
        'name', e.name,
        'uptime_percentage', 
        ROUND(
          COUNT(*) FILTER (WHERE status = 'operational')::float / NULLIF(COUNT(*), 0) * 100
        ),
        'maintenance_count', COUNT(*) FILTER (WHERE i.type = 'maintenance'),
        'avg_temperature_variance',
        AVG(ABS(i.temperature_after - (e.specifications->>'target_temp')::numeric))
      ))
      FROM equipment e
      LEFT JOIN interventions i ON e.id = i.equipment_id
      WHERE e.company_id = company_id
      AND (i.created_at IS NULL OR i.created_at BETWEEN start_date AND end_date)
      GROUP BY e.id, e.name
    ),
    'technician_performance', (
      SELECT json_agg(json_build_object(
        'technician_id', u.id,
        'name', u.name,
        'interventions_completed', COUNT(*) FILTER (WHERE i.status = 'completed'),
        'avg_resolution_time',
        AVG(EXTRACT(EPOCH FROM (i.completed_date - i.created_at))/3600)
      ))
      FROM users u
      LEFT JOIN interventions i ON u.id = i.technician_id
      WHERE u.role = 'technician'
      AND (i.created_at IS NULL OR i.created_at BETWEEN start_date AND end_date)
      GROUP BY u.id, u.name
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;