/*
  # Technician Management System

  1. New Tables
    - technician_availability
      - Stores technician availability by date and time slots
      - Links to users table for technician information
    
  2. Functions
    - is_technician_available: Check if a technician is available on a specific date/slot
    - find_available_technicians: Find technicians available for a given date/slot
    
  3. Security
    - RLS policies for access control
    - Secure functions for availability management
*/

-- Create technician_availability table if it doesn't exist
CREATE TABLE IF NOT EXISTS technician_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date text NOT NULL, -- Format: YYYY-MM-DD
  available boolean NOT NULL DEFAULT true,
  slots jsonb NOT NULL DEFAULT '{"morning": true, "afternoon": true}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique technician-date combinations
  UNIQUE(technician_id, date)
);

-- Enable RLS
ALTER TABLE technician_availability ENABLE ROW LEVEL SECURITY;

-- Add RLS policies (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'technician_availability' 
    AND policyname = 'Technicians can manage their own availability'
  ) THEN
    CREATE POLICY "Technicians can manage their own availability" ON technician_availability
      FOR ALL
      USING (
        technician_id = auth.uid() OR 
        auth.jwt() ->> 'role' = 'admin'
      )
      WITH CHECK (
        technician_id = auth.uid() OR 
        auth.jwt() ->> 'role' = 'admin'
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'technician_availability' 
    AND policyname = 'Users can view technician availability'
  ) THEN
    CREATE POLICY "Users can view technician availability" ON technician_availability
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- Function to check if a technician is available on a specific date and slot
CREATE OR REPLACE FUNCTION is_technician_available(
  p_technician_id uuid,
  p_date text,
  p_slot text DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_available boolean;
  v_slots jsonb;
BEGIN
  -- Get availability record
  SELECT 
    available,
    slots
  INTO 
    v_available,
    v_slots
  FROM technician_availability
  WHERE technician_id = p_technician_id
  AND date = p_date;
  
  -- If no record exists, technician is not available
  IF v_available IS NULL THEN
    RETURN false;
  END IF;
  
  -- If not available at all, return false
  IF NOT v_available THEN
    RETURN false;
  END IF;
  
  -- If no specific slot requested, return general availability
  IF p_slot IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check specific slot availability
  RETURN (v_slots->>p_slot)::boolean;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find available technicians for a given date and slot
CREATE OR REPLACE FUNCTION find_available_technicians(
  p_date text,
  p_slot text DEFAULT NULL,
  p_expertise text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  expertise jsonb,
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
    u.id,
    u.name,
    u.email,
    u.metadata->'specialties' as expertise,
    COALESCE(tl.current_interventions, 0) as current_load
  FROM users u
  LEFT JOIN technician_loads tl ON u.id = tl.id
  WHERE u.role = 'technician'
  AND u.active = true
  AND (
    p_expertise IS NULL OR 
    u.metadata->'specialties' ? p_expertise
  )
  AND EXISTS (
    SELECT 1 FROM technician_availability ta
    WHERE ta.technician_id = u.id
    AND ta.date = p_date
    AND ta.available = true
    AND (
      p_slot IS NULL OR
      (ta.slots->>p_slot)::boolean = true
    )
  )
  ORDER BY tl.current_interventions ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'technician_availability' 
    AND indexname = 'technician_availability_technician_date_idx'
  ) THEN
    CREATE INDEX technician_availability_technician_date_idx 
      ON technician_availability (technician_id, date);
  END IF;
END $$;

-- Update users table to support technician metadata if needed
DO $$ 
BEGIN
  -- Add default metadata for technicians if not exists
  UPDATE users
  SET metadata = jsonb_build_object(
    'department', 'Technique',
    'specialties', jsonb_build_array('Froid commercial', 'VMC')
  )
  WHERE role = 'technician'
  AND (metadata IS NULL OR metadata = '{}'::jsonb);
END $$;