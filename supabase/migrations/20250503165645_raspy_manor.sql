-- Create installation_requests table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'installation_requests'
  ) THEN
    CREATE TABLE installation_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id uuid NOT NULL REFERENCES companies(id),
      type text NOT NULL CHECK (type IN ('cold_storage', 'vmc', 'other')),
      description text NOT NULL,
      location jsonb NOT NULL,
      preferred_date date,
      status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'scheduled', 'completed', 'cancelled')),
      technician_id uuid REFERENCES users(id),
      scheduled_date timestamptz,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      metadata jsonb DEFAULT '{}'::jsonb
    );

    -- Enable RLS
    ALTER TABLE installation_requests ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop ALL existing policies with exception handling
DO $$ 
BEGIN
  -- Try to drop each policy individually with error handling
  BEGIN
    DROP POLICY IF EXISTS "Installation requests viewable by company members and technicia" ON installation_requests;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Installation requests manageable by admins" ON installation_requests;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "view_installation_requests" ON installation_requests;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "manage_installation_requests" ON installation_requests;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "view_installation_requests_policy" ON installation_requests;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "manage_installation_requests_policy" ON installation_requests;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or other error, continue
  END;
END $$;

-- Create new policies with unique names
DO $$ 
BEGIN
  -- Create view policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'installation_requests' 
    AND policyname = 'view_installation_requests_policy_v2'
  ) THEN
    CREATE POLICY "view_installation_requests_policy_v2" ON installation_requests
      FOR SELECT
      USING (
        company_id IN (
          SELECT company_id FROM users WHERE id = auth.uid()
        ) OR auth.jwt() ->> 'role' IN ('admin', 'technician')
      );
  END IF;

  -- Create manage policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'installation_requests' 
    AND policyname = 'manage_installation_requests_policy_v2'
  ) THEN
    CREATE POLICY "manage_installation_requests_policy_v2" ON installation_requests
      FOR ALL
      USING (auth.jwt() ->> 'role' = 'admin')
      WITH CHECK (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;

-- Function to get available technicians
CREATE OR REPLACE FUNCTION get_available_technicians(
  request_date date,
  installation_type text
)
RETURNS TABLE (
  technician_id uuid,
  name text,
  availability json,
  expertise text[],
  current_load integer
) AS $$
BEGIN
  RETURN QUERY
  WITH technician_loads AS (
    SELECT 
      u.id,
      COUNT(i.id) as current_interventions
    FROM users u
    LEFT JOIN interventions i ON u.id = i.technician_id 
    WHERE u.role = 'technician'
    AND i.status IN ('scheduled', 'in_progress')
    GROUP BY u.id
  )
  SELECT 
    u.id as technician_id,
    u.name,
    (
      SELECT json_agg(
        json_build_object(
          'date', d.date,
          'slots', ARRAY['morning', 'afternoon']::text[]
        )
      )
      FROM generate_series(
        request_date,
        request_date + interval '14 days',
        interval '1 day'
      ) d(date)
      WHERE EXTRACT(DOW FROM d.date) BETWEEN 1 AND 5  -- Monday to Friday
    ) as availability,
    ARRAY['cold_storage', 'vmc']::text[] as expertise,
    COALESCE(tl.current_interventions, 0) as current_load
  FROM users u
  LEFT JOIN technician_loads tl ON u.id = tl.id
  WHERE u.role = 'technician'
  AND u.active = true
  ORDER BY tl.current_interventions ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign technician to installation request
CREATE OR REPLACE FUNCTION assign_technician_to_request(
  p_request_id uuid,
  p_technician_id uuid,
  p_scheduled_date timestamptz
)
RETURNS installation_requests AS $$
DECLARE
  v_request installation_requests;
BEGIN
  -- Update request with technician assignment
  UPDATE installation_requests
  SET 
    technician_id = p_technician_id,
    scheduled_date = p_scheduled_date,
    status = 'assigned',
    updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  -- Create notification for technician
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    priority,
    metadata
  )
  VALUES (
    p_technician_id,
    'installation',
    'Nouvelle installation assignée',
    'Vous avez été assigné à une nouvelle installation',
    'high',
    jsonb_build_object(
      'request_id', p_request_id,
      'scheduled_date', p_scheduled_date
    )
  );

  -- Create notification for client
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
    'installation',
    'Technicien assigné',
    'Un technicien a été assigné à votre demande d''installation',
    'medium',
    jsonb_build_object(
      'request_id', p_request_id,
      'technician_id', p_technician_id,
      'scheduled_date', p_scheduled_date
    )
  FROM users u
  WHERE u.company_id = v_request.company_id
  AND u.role = 'client';

  RETURN v_request;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'installation_requests' 
    AND indexname = 'installation_requests_company_status_idx'
  ) THEN
    CREATE INDEX installation_requests_company_status_idx 
      ON installation_requests (company_id, status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'installation_requests' 
    AND indexname = 'installation_requests_technician_idx'
  ) THEN
    CREATE INDEX installation_requests_technician_idx 
      ON installation_requests (technician_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'installation_requests' 
    AND indexname = 'installation_requests_scheduled_date_idx'
  ) THEN
    CREATE INDEX installation_requests_scheduled_date_idx 
      ON installation_requests (scheduled_date);
  END IF;
END $$;