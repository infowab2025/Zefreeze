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

  -- Traiter chaque utilisateur individuellement pour éviter les erreurs de clé dupliquée

  -- Admin
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@zefreeze.com') THEN
    v_admin_id := gen_seed_uuid('admin-user');
    
    -- Vérifier si l'utilisateur existe dans auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@zefreeze.com') THEN
      -- Créer dans auth.users
      INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
      VALUES (
        v_admin_id,
        'admin@zefreeze.com',
        now(),
        now(),
        now()
      );
    ELSE
      -- Récupérer l'ID existant
      SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@zefreeze.com';
    END IF;
    
    -- Créer dans users
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
    
    -- Vérifier si l'utilisateur existe dans auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tech@zefreeze.com') THEN
      -- Créer dans auth.users
      INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
      VALUES (
        v_tech_id,
        'tech@zefreeze.com',
        now(),
        now(),
        now()
      );
    ELSE
      -- Récupérer l'ID existant
      SELECT id INTO v_tech_id FROM auth.users WHERE email = 'tech@zefreeze.com';
    END IF;
    
    -- Créer dans users
    INSERT INTO users (id, name, email, phone, role, active, company_id, preferences, created_at, updated_at)
    VALUES (
      v_tech_id,
      'Tech User',
      'tech@zefreeze.com',
      '+33 1 23 45 67 81',
      'technician',
      true,
      NULL,
      '{"language": "fr", "timezone": "Europe/Paris", "notifications": {"email": true, "push": true}}'::jsonb,
      now(),
      now()
    );
  END IF;

  -- Client
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'client@zefreeze.com') THEN
    v_client_id := gen_seed_uuid('client-user');
    
    -- Vérifier si l'utilisateur existe dans auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@zefreeze.com') THEN
      -- Créer dans auth.users
      INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
      VALUES (
        v_client_id,
        'client@zefreeze.com',
        now(),
        now(),
        now()
      );
    ELSE
      -- Récupérer l'ID existant
      SELECT id INTO v_client_id FROM auth.users WHERE email = 'client@zefreeze.com';
    END IF;
    
    -- Créer dans users
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