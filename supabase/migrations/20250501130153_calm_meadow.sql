/*
  # Add default data for testing

  This migration adds sample data to the database for testing purposes.
  It will only insert data if the tables are empty.

  1. Companies
    - Restaurant Le Provençal (sample client company)
  
  2. Users
    - Admin user
    - Two technicians
    - One client user
  
  3. Equipment
    - Cold storage unit
    - VMC system
  
  4. Interventions
    - Completed maintenance
    - Scheduled repair
  
  5. Reports
    - Completed maintenance report
  
  6. Messages and Notifications
    - System welcome message
    - Maintenance notification
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
  v_admin_id uuid;
  v_tech1_id uuid;
  v_tech2_id uuid;
  v_client_id uuid;
  v_equipment1_id uuid;
  v_equipment2_id uuid;
  v_intervention1_id uuid;
  v_intervention2_id uuid;
BEGIN
  -- Only proceed if tables are empty
  IF NOT EXISTS (SELECT 1 FROM companies) THEN
    -- Insert company
    v_company_id := gen_seed_uuid('company-1');
    INSERT INTO companies (id, name, address, phone, email, created_at, updated_at)
    VALUES (
      v_company_id,
      'Restaurant Le Provençal',
      '123 Rue de Paris, 75001 Paris',
      '+33 1 23 45 67 89',
      'contact@leprovencal.fr',
      now(),
      now()
    );

    -- Insert users
    v_admin_id := gen_seed_uuid('admin-1');
    v_tech1_id := gen_seed_uuid('tech-1');
    v_tech2_id := gen_seed_uuid('tech-2');
    v_client_id := gen_seed_uuid('client-1');

    INSERT INTO users (id, name, email, phone, role, active, company_id, preferences, created_at, updated_at)
    VALUES
      (
        v_admin_id,
        'Admin User',
        'admin@zefreeze.com',
        '+33 1 23 45 67 80',
        'admin',
        true,
        NULL,
        '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
        now(),
        now()
      ),
      (
        v_tech1_id,
        'Martin Dupuis',
        'martin@zefreeze.com',
        '+33 1 23 45 67 81',
        'technician',
        true,
        NULL,
        '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
        now(),
        now()
      ),
      (
        v_tech2_id,
        'Sophie Leclerc',
        'sophie@zefreeze.com',
        '+33 1 23 45 67 82',
        'technician',
        true,
        NULL,
        '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
        now(),
        now()
      ),
      (
        v_client_id,
        'Jean Dupont',
        'jean@leprovencal.fr',
        '+33 1 23 45 67 83',
        'client',
        true,
        v_company_id,
        '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
        now(),
        now()
      );

    -- Insert equipment
    v_equipment1_id := gen_seed_uuid('equipment-1');
    v_equipment2_id := gen_seed_uuid('equipment-2');

    INSERT INTO equipment (
      id, name, type, brand, model, serial_number, installation_date,
      status, specifications, company_id, last_maintenance_date, next_maintenance_date,
      created_at, updated_at
    )
    VALUES
      (
        v_equipment1_id,
        'Chambre froide positive',
        'cold_storage',
        'Carrier',
        'XR500',
        'CF123456',
        '2025-01-15',
        'operational',
        '{
          "temperature": {"min": 2, "max": 8, "current": 4},
          "power": 2.5,
          "dimensions": {"width": 200, "height": 220, "depth": 300}
        }'::jsonb,
        v_company_id,
        '2025-04-15',
        '2025-07-15',
        now(),
        now()
      ),
      (
        v_equipment2_id,
        'VMC Cuisine',
        'vmc',
        'Aldes',
        'VEC420',
        'VMC789012',
        '2025-02-01',
        'maintenance_needed',
        '{
          "power": 1.5,
          "airflow": 2000,
          "dimensions": {"width": 150, "height": 100, "depth": 150}
        }'::jsonb,
        v_company_id,
        '2025-03-01',
        '2025-06-01',
        now(),
        now()
      );

    -- Insert interventions
    v_intervention1_id := gen_seed_uuid('intervention-1');
    v_intervention2_id := gen_seed_uuid('intervention-2');

    INSERT INTO interventions (
      id, type, category, status, priority, description,
      equipment_id, company_id, technician_id, scheduled_date, completed_date,
      temperature_before, temperature_after, created_at, updated_at
    )
    VALUES
      (
        v_intervention1_id,
        'maintenance',
        'cold_storage',
        'completed',
        'medium',
        'Maintenance trimestrielle de la chambre froide',
        v_equipment1_id,
        v_company_id,
        v_tech1_id,
        '2025-04-15 10:00:00',
        '2025-04-15 12:00:00',
        6.5,
        4.2,
        now(),
        now()
      ),
      (
        v_intervention2_id,
        'repair',
        'vmc',
        'scheduled',
        'high',
        'Remplacement du moteur de ventilation',
        v_equipment2_id,
        v_company_id,
        v_tech2_id,
        '2025-05-20 14:00:00',
        NULL,
        NULL,
        NULL,
        now(),
        now()
      );

    -- Insert report for completed intervention
    INSERT INTO reports (
      id, intervention_id, type, notes, recommendations,
      compliance, technician_signature, client_signature,
      created_at, updated_at, status
    )
    VALUES (
      gen_seed_uuid('report-1'),
      v_intervention1_id,
      'intervention',
      'Maintenance effectuée selon le protocole. Nettoyage des condenseurs et vérification des joints.',
      'Prévoir le remplacement des joints dans les 6 mois.',
      '{
        "haccp": true,
        "refrigerant_leak": false,
        "frost": false
      }'::jsonb,
      'data:image/png;base64,signature1',
      'data:image/png;base64,signature2',
      now(),
      now(),
      'approved'
    );

    -- Insert messages
    INSERT INTO messages (
      id, sender_id, recipient_id, subject, content,
      intervention_id, read, created_at
    )
    VALUES (
      gen_seed_uuid('message-1'),
      v_admin_id,
      v_client_id,
      'Bienvenue sur ZEFREEZE',
      'Bienvenue sur la plateforme ZEFREEZE. Notre équipe est à votre disposition pour toute question.',
      NULL,
      false,
      now()
    );

    -- Insert notifications
    INSERT INTO notifications (
      id, user_id, type, title, message, priority,
      read, metadata, created_at
    )
    VALUES
      (
        gen_seed_uuid('notif-1'),
        v_client_id,
        'system',
        'Bienvenue sur ZEFREEZE',
        'Bienvenue sur votre espace client ZEFREEZE',
        'low',
        false,
        '{}'::jsonb,
        now()
      ),
      (
        gen_seed_uuid('notif-2'),
        v_client_id,
        'maintenance',
        'Maintenance VMC planifiée',
        'Une intervention de maintenance est planifiée pour votre système VMC',
        'medium',
        false,
        jsonb_build_object('intervention_id', v_intervention2_id),
        now()
      );
  END IF;
END $$;