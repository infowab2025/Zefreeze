/*
  # Add Default Data Migration

  1. New Functions
    - check_and_insert_default_data()
      - Checks if tables are empty and inserts default data
    - get_random_uuid()
      - Helper function to generate UUIDs consistently

  2. Default Data
    - Companies
    - Users (admin, technicians, clients)
    - Equipment
    - Interventions
    - Reports

  3. Security
    - All data is inserted with proper relationships
    - Maintains referential integrity
*/

-- Helper function to generate UUIDs consistently
CREATE OR REPLACE FUNCTION get_random_uuid(seed text)
RETURNS uuid AS $$
BEGIN
  -- Use MD5 to generate a deterministic UUID based on seed
  RETURN md5(seed)::uuid;
END;
$$ LANGUAGE plpgsql;

-- Main function to check and insert default data
CREATE OR REPLACE FUNCTION check_and_insert_default_data()
RETURNS void AS $$
DECLARE
  company_id uuid;
  admin_id uuid;
  tech1_id uuid;
  tech2_id uuid;
  client1_id uuid;
  equipment1_id uuid;
  equipment2_id uuid;
  intervention1_id uuid;
  intervention2_id uuid;
BEGIN
  -- Only insert data if tables are empty
  IF NOT EXISTS (SELECT 1 FROM companies LIMIT 1) THEN
    -- Insert default company
    company_id := get_random_uuid('default_company');
    INSERT INTO companies (id, name, address, phone, email, created_at, updated_at)
    VALUES (
      company_id,
      'Restaurant Le Provençal',
      '123 Rue de Paris, 75001 Paris',
      '+33 1 23 45 67 89',
      'contact@leprovencal.fr',
      now(),
      now()
    );

    -- Insert default users
    IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
      -- Admin user
      admin_id := get_random_uuid('default_admin');
      INSERT INTO users (id, name, email, phone, role, company_id, created_at, updated_at)
      VALUES (
        admin_id,
        'Admin User',
        'admin@zefreeze.com',
        '+33 1 23 45 67 80',
        'admin',
        company_id,
        now(),
        now()
      );

      -- Technicians
      tech1_id := get_random_uuid('default_tech1');
      tech2_id := get_random_uuid('default_tech2');
      INSERT INTO users (id, name, email, phone, role, company_id, created_at, updated_at)
      VALUES
        (
          tech1_id,
          'Martin Dupuis',
          'martin@zefreeze.com',
          '+33 1 23 45 67 81',
          'technician',
          company_id,
          now(),
          now()
        ),
        (
          tech2_id,
          'Sophie Leclerc',
          'sophie@zefreeze.com',
          '+33 1 23 45 67 82',
          'technician',
          company_id,
          now(),
          now()
        );

      -- Client user
      client1_id := get_random_uuid('default_client');
      INSERT INTO users (id, name, email, phone, role, company_id, created_at, updated_at)
      VALUES (
        client1_id,
        'Jean Dupont',
        'jean@leprovencal.fr',
        '+33 1 23 45 67 83',
        'client',
        company_id,
        now(),
        now()
      );
    END IF;

    -- Insert default equipment
    IF NOT EXISTS (SELECT 1 FROM equipment LIMIT 1) THEN
      equipment1_id := get_random_uuid('default_equipment1');
      equipment2_id := get_random_uuid('default_equipment2');
      INSERT INTO equipment (
        id, name, type, brand, model, serial_number, 
        installation_date, status, specifications, company_id,
        last_maintenance_date, next_maintenance_date, created_at, updated_at
      )
      VALUES
        (
          equipment1_id,
          'Chambre froide positive',
          'cold_storage',
          'Carrier',
          'XR500',
          'CF123456',
          '2024-01-15',
          'operational',
          '{"min_temp": 2, "max_temp": 8, "target_temp": 4, "power": 2.5, "dimensions": {"width": 200, "height": 220, "depth": 300}}'::jsonb,
          company_id,
          '2025-04-01',
          '2025-07-01',
          now(),
          now()
        ),
        (
          equipment2_id,
          'Système VMC cuisine',
          'vmc',
          'Aldes',
          'VX200',
          'VMC789012',
          '2024-02-01',
          'operational',
          '{"power": 1.5, "airflow": 1000, "dimensions": {"width": 150, "height": 150, "depth": 200}}'::jsonb,
          company_id,
          '2025-04-15',
          '2025-07-15',
          now(),
          now()
        );
    END IF;

    -- Insert default interventions
    IF NOT EXISTS (SELECT 1 FROM interventions LIMIT 1) THEN
      intervention1_id := get_random_uuid('default_intervention1');
      intervention2_id := get_random_uuid('default_intervention2');
      INSERT INTO interventions (
        id, type, category, status, priority, description,
        equipment_id, company_id, technician_id,
        scheduled_date, completed_date,
        temperature_before, temperature_after,
        created_at, updated_at
      )
      VALUES
        (
          intervention1_id,
          'maintenance',
          'cold_storage',
          'completed',
          'medium',
          'Maintenance périodique de la chambre froide',
          equipment1_id,
          company_id,
          tech1_id,
          '2025-04-01 10:00:00',
          '2025-04-01 12:00:00',
          5.2,
          4.0,
          now(),
          now()
        ),
        (
          intervention2_id,
          'maintenance',
          'vmc',
          'scheduled',
          'low',
          'Maintenance du système VMC',
          equipment2_id,
          company_id,
          tech2_id,
          '2025-05-15 14:00:00',
          null,
          null,
          null,
          now(),
          now()
        );
    END IF;

    -- Insert default reports
    IF NOT EXISTS (SELECT 1 FROM reports LIMIT 1) THEN
      INSERT INTO reports (
        id, intervention_id, type, notes, recommendations,
        compliance, technician_signature, client_signature,
        signed_at, created_at, updated_at, status
      )
      VALUES (
        get_random_uuid('default_report1'),
        intervention1_id,
        'intervention',
        'Maintenance effectuée selon les procédures standard. Système en bon état de fonctionnement.',
        'Prévoir un nettoyage complet des évaporateurs dans les 3 mois.',
        '{"haccp": true, "refrigerant_leak": false, "frost": false}'::jsonb,
        'data:image/png;base64,signature1',
        'data:image/png;base64,signature2',
        '2025-04-01 12:00:00',
        now(),
        now(),
        'approved'
      );
    END IF;

    -- Insert default notifications
    IF NOT EXISTS (SELECT 1 FROM notifications LIMIT 1) THEN
      INSERT INTO notifications (
        id, user_id, type, title, message, priority,
        metadata, created_at
      )
      VALUES
        (
          get_random_uuid('default_notification1'),
          tech1_id,
          'maintenance',
          'Maintenance planifiée',
          'Maintenance de la chambre froide prévue pour le 01/07/2025',
          'medium',
          jsonb_build_object(
            'equipment_id', equipment1_id,
            'scheduled_date', '2025-07-01'
          ),
          now()
        ),
        (
          get_random_uuid('default_notification2'),
          admin_id,
          'system',
          'Nouveau rapport disponible',
          'Le rapport de maintenance de la chambre froide est disponible',
          'low',
          jsonb_build_object(
            'intervention_id', intervention1_id
          ),
          now()
        );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to insert default data
SELECT check_and_insert_default_data();