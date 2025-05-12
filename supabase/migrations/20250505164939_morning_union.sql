/*
  # Add Temperature Logs Table

  1. New Table
    - temperature_logs
      - Stores temperature readings for equipment
      - Tracks compliance with temperature thresholds
      - Links to equipment and technicians
    
  2. Functions
    - Automatic compliance checking
    - Alert generation for non-compliant temperatures
    
  3. Security
    - RLS policies for access control
*/

-- Create temperature_logs table
CREATE TABLE IF NOT EXISTS temperature_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id uuid NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  technician_id uuid NOT NULL REFERENCES users(id),
  temperature numeric NOT NULL,
  is_compliant boolean NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  
  -- Add indexes for better performance
  CONSTRAINT temperature_logs_temperature_check CHECK (temperature IS NOT NULL)
);

-- Enable RLS
ALTER TABLE temperature_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Technicians can create temperature logs" ON temperature_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'technician')
  );

CREATE POLICY "Users can view temperature logs for their equipment" ON temperature_logs
  FOR SELECT
  TO authenticated
  USING (
    equipment_id IN (
      SELECT e.id FROM equipment e
      WHERE e.company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
      )
    ) OR auth.jwt() ->> 'role' IN ('admin', 'technician')
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS temperature_logs_equipment_id_idx ON temperature_logs(equipment_id);
CREATE INDEX IF NOT EXISTS temperature_logs_technician_id_idx ON temperature_logs(technician_id);
CREATE INDEX IF NOT EXISTS temperature_logs_created_at_idx ON temperature_logs(created_at);
CREATE INDEX IF NOT EXISTS temperature_logs_is_compliant_idx ON temperature_logs(is_compliant);

-- Add function to create temperature alert notifications
CREATE OR REPLACE FUNCTION create_temperature_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_equipment_name text;
  v_min_temp numeric;
  v_max_temp numeric;
  v_company_id uuid;
  v_user_record record;
BEGIN
  -- Get equipment details
  SELECT e.name, e.specifications->>'min_temp' as min_temp, 
         e.specifications->>'max_temp' as max_temp, e.company_id
  INTO v_equipment_name, v_min_temp, v_max_temp, v_company_id
  FROM equipment e
  WHERE e.id = NEW.equipment_id;
  
  -- Only create alert if temperature is out of range
  IF NOT NEW.is_compliant THEN
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
        'Alerte température',
        'Température hors limites pour ' || v_equipment_name || ': ' || 
        NEW.temperature || '°C (Seuils: ' || v_min_temp || '-' || v_max_temp || '°C)',
        'high',
        jsonb_build_object(
          'equipment_id', NEW.equipment_id,
          'temperature', NEW.temperature,
          'min_threshold', v_min_temp,
          'max_threshold', v_max_temp,
          'log_id', NEW.id
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for temperature alerts
CREATE TRIGGER temperature_alert_trigger
  AFTER INSERT ON temperature_logs
  FOR EACH ROW
  EXECUTE FUNCTION create_temperature_alert();