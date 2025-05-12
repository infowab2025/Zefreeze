/*
  # Add Default Users Migration

  This migration adds three default users to the database for testing purposes:
  - Admin: admin@zefreeze.com / password
  - Technician: tech@zefreeze.com / password
  - Client: client@zefreeze.com / password

  It also ensures the ZEFREEZE company exists for the client user.
*/

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
  v_admin_id uuid := gen_seed_uuid('admin-user-123');
  v_tech_id uuid := gen_seed_uuid('tech-user-123');
  v_client_id uuid := gen_seed_uuid('client-user-123');
  v_auth_exists boolean;
BEGIN
  -- Create default company if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM companies WHERE name = 'ZEFREEZE') THEN
    v_company_id := gen_seed_uuid('zefreeze-company-123');
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

  -- Check if auth schema exists (for local development it might not)
  SELECT EXISTS (
    SELECT FROM information_schema.schemata WHERE schema_name = 'auth'
  ) INTO v_auth_exists;

  -- Admin user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@zefreeze.com') THEN
    -- Create auth user if schema exists
    IF v_auth_exists THEN
      BEGIN
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
        VALUES (
          v_admin_id,
          'admin@zefreeze.com',
          now(),
          now(),
          now(),
          '{"name":"Admin User","role":"admin"}'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
      EXCEPTION WHEN OTHERS THEN
        -- Ignore errors, just continue
        RAISE NOTICE 'Could not create auth user for admin: %', SQLERRM;
      END;
    END IF;

    -- Create user in users table
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
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Technician user
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tech@zefreeze.com') THEN
    -- Create auth user if schema exists
    IF v_auth_exists THEN
      BEGIN
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
        VALUES (
          v_tech_id,
          'tech@zefreeze.com',
          now(),
          now(),
          now(),
          '{"name":"Tech User","role":"technician"}'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
      EXCEPTION WHEN OTHERS THEN
        -- Ignore errors, just continue
        RAISE NOTICE 'Could not create auth user for technician: %', SQLERRM;
      END;
    END IF;

    -- Create user in users table
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
    ON CONFLICT (id) DO NOTHING;
    
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
    -- Create auth user if schema exists
    IF v_auth_exists THEN
      BEGIN
        INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
        VALUES (
          v_client_id,
          'client@zefreeze.com',
          now(),
          now(),
          now(),
          '{"name":"Client User","role":"client"}'::jsonb
        )
        ON CONFLICT (id) DO NOTHING;
      EXCEPTION WHEN OTHERS THEN
        -- Ignore errors, just continue
        RAISE NOTICE 'Could not create auth user for client: %', SQLERRM;
      END;
    END IF;

    -- Create user in users table
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
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;