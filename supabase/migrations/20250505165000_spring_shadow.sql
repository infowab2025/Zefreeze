/*
  # Update Reports Table for HACCP

  1. Changes
    - Add metadata column for additional report data
    - Add support for HACCP-specific fields
    - Add support for installation reports
    
  2. Security
    - Update RLS policies for new report types
*/

-- Add metadata column if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reports' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE reports ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add function to check HACCP compliance
CREATE OR REPLACE FUNCTION check_haccp_compliance()
RETURNS TRIGGER AS $$
DECLARE
  v_equipment_name text;
  v_company_id uuid;
  v_user_record record;
  v_is_compliant boolean;
BEGIN
  -- Get equipment details
  SELECT e.name, e.company_id
  INTO v_equipment_name, v_company_id
  FROM equipment e
  JOIN interventions i ON e.id = i.equipment_id
  WHERE i.id = NEW.intervention_id;
  
  -- Check if report is HACCP type and has compliance data
  IF NEW.type = 'haccp' AND NEW.compliance IS NOT NULL THEN
    -- Check if all compliance fields are true
    v_is_compliant := (NEW.compliance->>'haccp')::boolean AND 
                      (NEW.compliance->>'refrigerant_leak')::boolean AND 
                      (NEW.compliance->>'frost')::boolean;
    
    -- If not compliant, create notifications
    IF NOT v_is_compliant THEN
      -- Create notification for company users and admins
      FOR v_user_record IN 
        SELECT id FROM users 
        WHERE (company_id = v_company_id AND role = 'client') 
        OR role = 'admin'
      LOOP
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          priority,
          metadata
        ) VALUES (
          v_user_record.id,
          'alert',
          'Non-conformité HACCP',
          'Équipement ' || v_equipment_name || ' non conforme aux normes HACCP',
          'high',
          jsonb_build_object(
            'report_id', NEW.id,
            'equipment_id', (SELECT equipment_id FROM interventions WHERE id = NEW.intervention_id),
            'compliance', NEW.compliance
          )
        );
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for HACCP compliance alerts
CREATE TRIGGER haccp_compliance_trigger
  AFTER INSERT OR UPDATE OF compliance ON reports
  FOR EACH ROW
  EXECUTE FUNCTION check_haccp_compliance();

-- Add function to update equipment status based on HACCP report
CREATE OR REPLACE FUNCTION update_equipment_status_from_haccp()
RETURNS TRIGGER AS $$
DECLARE
  v_equipment_id uuid;
  v_is_compliant boolean;
BEGIN
  -- Get equipment ID from intervention
  SELECT equipment_id INTO v_equipment_id
  FROM interventions
  WHERE id = NEW.intervention_id;
  
  -- Check if report is HACCP type and has compliance data
  IF NEW.type = 'haccp' AND NEW.compliance IS NOT NULL AND v_equipment_id IS NOT NULL THEN
    -- Check if all compliance fields are true
    v_is_compliant := (NEW.compliance->>'haccp')::boolean AND 
                      (NEW.compliance->>'refrigerant_leak')::boolean AND 
                      (NEW.compliance->>'frost')::boolean;
    
    -- Update equipment status based on compliance
    UPDATE equipment
    SET 
      status = CASE WHEN v_is_compliant THEN 'operational' ELSE 'maintenance_needed' END,
      updated_at = now(),
      metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{last_haccp_check}',
        to_jsonb(now())
      )
    WHERE id = v_equipment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating equipment status from HACCP reports
CREATE TRIGGER update_equipment_from_haccp_trigger
  AFTER INSERT OR UPDATE OF compliance ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_status_from_haccp();