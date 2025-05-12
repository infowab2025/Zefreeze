-- Function to create notifications based on user preferences
CREATE OR REPLACE FUNCTION create_user_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_priority text,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  -- Only create notification if user has enabled notifications
  INSERT INTO notifications (
    id,
    user_id,
    type,
    title,
    message,
    priority,
    metadata,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_priority,
    p_metadata,
    now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new messages
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for recipient
  PERFORM create_user_notification(
    NEW.recipient_id,
    'message',
    'Nouveau message',
    'Vous avez reçu un message de ' || (SELECT name FROM users WHERE id = NEW.sender_id),
    'low',
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'intervention_id', NEW.intervention_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS message_notification_trigger ON messages;
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger for intervention status changes
CREATE OR REPLACE FUNCTION notify_intervention_status_change()
RETURNS TRIGGER AS $$
DECLARE
  client_user RECORD;
  v_title text;
  v_message text;
  v_priority text;
BEGIN
  -- Set notification details based on status change
  CASE NEW.status
    WHEN 'scheduled' THEN
      v_title := 'Intervention planifiée';
      v_message := 'Une intervention a été planifiée pour le ' || 
                   to_char(NEW.scheduled_date, 'DD/MM/YYYY HH24:MI');
      v_priority := 'medium';
    WHEN 'in_progress' THEN
      v_title := 'Intervention en cours';
      v_message := 'L''intervention a débuté';
      v_priority := 'medium';
    WHEN 'completed' THEN
      v_title := 'Intervention terminée';
      v_message := 'L''intervention a été complétée avec succès';
      v_priority := 'low';
    ELSE
      v_title := 'Mise à jour intervention';
      v_message := 'Le statut de l''intervention a été mis à jour: ' || NEW.status;
      v_priority := 'low';
  END CASE;

  -- Notify clients
  FOR client_user IN 
    SELECT id FROM users 
    WHERE company_id = NEW.company_id 
    AND role = 'client'
  LOOP
    PERFORM create_user_notification(
      client_user.id,
      'intervention',
      v_title,
      v_message,
      v_priority,
      jsonb_build_object(
        'intervention_id', NEW.id,
        'status', NEW.status,
        'equipment_id', NEW.equipment_id
      )
    );
  END LOOP;

  -- Notify assigned technician if exists
  IF NEW.technician_id IS NOT NULL THEN
    PERFORM create_user_notification(
      NEW.technician_id,
      'intervention',
      v_title,
      v_message,
      v_priority,
      jsonb_build_object(
        'intervention_id', NEW.id,
        'status', NEW.status,
        'equipment_id', NEW.equipment_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS intervention_status_notification_trigger ON interventions;
CREATE TRIGGER intervention_status_notification_trigger
  AFTER INSERT OR UPDATE OF status ON interventions
  FOR EACH ROW
  EXECUTE FUNCTION notify_intervention_status_change();

-- Trigger for equipment status changes
CREATE OR REPLACE FUNCTION notify_equipment_status_change()
RETURNS TRIGGER AS $$
DECLARE
  user_record RECORD;
  v_title text;
  v_message text;
  v_priority text;
BEGIN
  -- Only proceed if status has changed
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- Set notification details based on new status
  CASE NEW.status
    WHEN 'maintenance_needed' THEN
      v_title := 'Maintenance requise';
      v_message := 'L''équipement ' || NEW.name || ' nécessite une maintenance';
      v_priority := 'high';
    WHEN 'out_of_service' THEN
      v_title := 'Équipement hors service';
      v_message := 'L''équipement ' || NEW.name || ' est hors service';
      v_priority := 'high';
    ELSE
      v_title := 'Changement de statut équipement';
      v_message := 'Le statut de l''équipement ' || NEW.name || ' a changé: ' || NEW.status;
      v_priority := 'medium';
  END CASE;

  -- Notify all relevant users
  FOR user_record IN 
    SELECT id FROM users 
    WHERE (company_id = NEW.company_id AND role = 'client') 
    OR role = 'technician'
  LOOP
    PERFORM create_user_notification(
      user_record.id,
      'equipment',
      v_title,
      v_message,
      v_priority,
      jsonb_build_object(
        'equipment_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS equipment_status_notification_trigger ON equipment;
CREATE TRIGGER equipment_status_notification_trigger
  AFTER UPDATE OF status ON equipment
  FOR EACH ROW
  EXECUTE FUNCTION notify_equipment_status_change();

-- Trigger for temperature alerts
CREATE OR REPLACE FUNCTION notify_temperature_alert()
RETURNS TRIGGER AS $$
DECLARE
  v_equipment equipment;
  user_record RECORD;
  v_temperature_limits jsonb;
  v_title text;
  v_message text;
BEGIN
  -- Get equipment details
  SELECT * INTO v_equipment
  FROM equipment
  WHERE id = NEW.equipment_id;

  -- Get temperature limits
  v_temperature_limits := v_equipment.specifications->'temperature';

  -- Only proceed if temperature is out of range
  IF NEW.temperature_after IS NOT NULL AND (
    NEW.temperature_after > (v_temperature_limits->>'max')::numeric OR
    NEW.temperature_after < (v_temperature_limits->>'min')::numeric
  ) THEN
    -- Set notification details
    v_title := 'Alerte température';
    v_message := 'Température hors limites pour ' || v_equipment.name || 
                 ' (' || NEW.temperature_after || '°C)';

    -- Notify users
    FOR user_record IN 
      SELECT id FROM users 
      WHERE (company_id = v_equipment.company_id AND role = 'client') 
      OR role = 'technician'
    LOOP
      PERFORM create_user_notification(
        user_record.id,
        'alert',
        v_title,
        v_message,
        'high',
        jsonb_build_object(
          'equipment_id', NEW.equipment_id,
          'intervention_id', NEW.id,
          'temperature', NEW.temperature_after,
          'min_temp', (v_temperature_limits->>'min')::numeric,
          'max_temp', (v_temperature_limits->>'max')::numeric
        )
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS temperature_alert_trigger ON interventions;
CREATE TRIGGER temperature_alert_trigger
  AFTER INSERT OR UPDATE OF temperature_after ON interventions
  FOR EACH ROW
  EXECUTE FUNCTION notify_temperature_alert();

-- Function to check for upcoming maintenance
CREATE OR REPLACE FUNCTION check_upcoming_maintenance()
RETURNS void AS $$
DECLARE
  v_equipment RECORD;
  user_record RECORD;
BEGIN
  FOR v_equipment IN
    SELECT e.*
    FROM equipment e
    WHERE e.next_maintenance_date <= now() + interval '1 week'
      AND e.next_maintenance_date > now()
  LOOP
    -- Notify relevant users
    FOR user_record IN 
      SELECT id FROM users 
      WHERE (company_id = v_equipment.company_id AND role = 'client') 
      OR role = 'technician'
    LOOP
      PERFORM create_user_notification(
        user_record.id,
        'maintenance',
        'Maintenance planifiée',
        'Maintenance prévue pour ' || v_equipment.name || ' le ' || 
        to_char(v_equipment.next_maintenance_date, 'DD/MM/YYYY'),
        'medium',
        jsonb_build_object(
          'equipment_id', v_equipment.id,
          'maintenance_date', v_equipment.next_maintenance_date
        )
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;