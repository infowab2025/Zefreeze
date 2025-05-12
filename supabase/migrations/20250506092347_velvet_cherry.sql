-- Helper function to generate consistent UUIDs based on a seed
CREATE OR REPLACE FUNCTION gen_seed_uuid(seed text) 
RETURNS uuid AS $$
BEGIN
  RETURN md5(seed)::uuid;
END;
$$ LANGUAGE plpgsql;

DO $$ 
DECLARE
  v_company_id uuid;
  v_admin_id uuid := gen_seed_uuid('admin-user-fixed');
  v_tech_id uuid := gen_seed_uuid('tech-user-fixed');
  v_client_id uuid := gen_seed_uuid('client-user-fixed');
BEGIN
  -- Create default company if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM companies WHERE name = 'ZEFREEZE') THEN
    v_company_id := gen_seed_uuid('zefreeze-company-fixed');
    INSERT INTO companies (id, name, address, phone, email, created_at, updated_at)
    VALUES (
      v_company_id,
      'ZEFREEZE',
      '123 Rue de Paris, 75001 Paris',
      '+33 1 23 45 67 89',
      'contact@zefreeze.com',
      now(),
      now()
    );
  ELSE
    SELECT id INTO v_company_id FROM companies WHERE name = 'ZEFREEZE';
  END IF;

  -- Admin user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@zefreeze.com') THEN
    INSERT INTO users (id, name, email, phone, role, active, company_id, preferences, metadata, created_at, updated_at)
    VALUES (
      v_admin_id,
      'Admin User',
      'admin@zefreeze.com',
      '+33 1 23 45 67 80',
      'admin',
      true,
      NULL,
      '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;

  -- Technician user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tech@zefreeze.com') THEN
    INSERT INTO users (id, name, email, phone, role, active, company_id, preferences, metadata, created_at, updated_at)
    VALUES (
      v_tech_id,
      'Tech User',
      'tech@zefreeze.com',
      '+33 1 23 45 67 81',
      'technician',
      true,
      NULL,
      '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
      '{"department": "Technique", "specialties": ["Froid commercial", "VMC"]}'::jsonb,
      now(),
      now()
    )
    ON CONFLICT (email) DO NOTHING;
    
    -- Add availability for technician
    IF NOT EXISTS (SELECT 1 FROM technician_availability WHERE technician_id = v_tech_id) THEN
      -- Add availability for the next 14 days (skipping weekends)
      FOR i IN 0..13 LOOP
        -- Calculate date (skip weekends)
        DECLARE
          current_date date := CURRENT_DATE + i * INTERVAL '1 day';
          day_of_week integer := EXTRACT(DOW FROM current_date);
        BEGIN
          -- Skip if weekend (0 = Sunday, 6 = Saturday)
          IF day_of_week != 0 AND day_of_week != 6 THEN
            INSERT INTO technician_availability (technician_id, date, available, slots)
            VALUES (
              v_tech_id,
              to_char(current_date, 'YYYY-MM-DD'),
              true,
              '{"morning": true, "afternoon": true}'::jsonb
            )
            ON CONFLICT (technician_id, date) DO NOTHING;
          END IF;
        END;
      END LOOP;
    END IF;
  END IF;

  -- Client user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'client@zefreeze.com') THEN
    INSERT INTO users (id, name, email, phone, role, active, company_id, preferences, metadata, created_at, updated_at)
    VALUES (
      v_client_id,
      'Client User',
      'client@zefreeze.com',
      '+33 1 23 45 67 82',
      'client',
      true,
      v_company_id,
      '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
      '{}'::jsonb,
      now(),
      now()
    )
    ON CONFLICT (email) DO NOTHING;
  END IF;
  
  -- Add a second company if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Restaurant Le Provençal') THEN
    INSERT INTO companies (id, name, address, phone, email, created_at, updated_at)
    VALUES (
      gen_seed_uuid('restaurant-company-fixed'),
      'Restaurant Le Provençal',
      '45 Avenue des Champs, 75008 Paris',
      '+33 1 23 45 67 90',
      'contact@leprovencal.fr',
      now(),
      now()
    );
  END IF;
  
  -- Add a third company if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Supermarché FraisMart') THEN
    INSERT INTO companies (id, name, address, phone, email, created_at, updated_at)
    VALUES (
      gen_seed_uuid('supermarket-company-fixed'),
      'Supermarché FraisMart',
      '12 Rue du Commerce, 75015 Paris',
      '+33 1 23 45 67 91',
      'contact@fraismart.fr',
      now(),
      now()
    );
  END IF;
END $$;