/*
  # Ajout des utilisateurs par défaut

  Cette migration ajoute des utilisateurs par défaut pour faciliter les tests.
  Elle vérifie d'abord si les utilisateurs existent déjà pour éviter les erreurs.

  1. Utilisateurs
    - Admin: admin@zefreeze.com
    - Technicien: tech@zefreeze.com
    - Client: client@zefreeze.com
  
  2. Entreprise
    - ZEFREEZE (entreprise par défaut)
*/

-- Fonction pour générer des UUID cohérents basés sur une graine
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
  v_tech_id uuid;
  v_client_id uuid;
BEGIN
  -- Créer une entreprise par défaut si nécessaire
  IF NOT EXISTS (SELECT 1 FROM companies WHERE name = 'ZEFREEZE') THEN
    v_company_id := gen_seed_uuid('zefreeze-company');
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

  -- Admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@zefreeze.com') THEN
    v_admin_id := gen_seed_uuid('admin-user');
    INSERT INTO users (id, name, email, phone, role, active, company_id, preferences, created_at, updated_at)
    VALUES (
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
    );
  END IF;

  -- Technicien
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'tech@zefreeze.com') THEN
    v_tech_id := gen_seed_uuid('tech-user');
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
    );
  END IF;

  -- Client
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'client@zefreeze.com') THEN
    v_client_id := gen_seed_uuid('client-user');
    INSERT INTO users (id, name, email, phone, role, active, company_id, preferences, created_at, updated_at)
    VALUES (
      v_client_id,
      'Client User',
      'client@zefreeze.com',
      '+33 1 23 45 67 82',
      'client',
      true,
      v_company_id,
      '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
      now(),
      now()
    );
  END IF;
END $$;