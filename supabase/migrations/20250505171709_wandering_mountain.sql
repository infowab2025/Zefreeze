-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  type text NOT NULL CHECK (type IN ('cold_storage', 'vmc', 'other')),
  description text NOT NULL,
  location jsonb NOT NULL,
  preferred_date date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create material_kits table
CREATE TABLE IF NOT EXISTS material_kits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('cold_storage', 'vmc', 'other')),
  description text NOT NULL,
  base_price numeric NOT NULL,
  items jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES quote_requests(id),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  type text NOT NULL CHECK (type IN ('cold_storage', 'vmc', 'other')),
  description text NOT NULL,
  location jsonb NOT NULL,
  kit_id uuid REFERENCES material_kits(id),
  kit_name text,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  discount numeric NOT NULL DEFAULT 0,
  discount_type text NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'amount')),
  tax numeric NOT NULL,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'prepared', 'sent', 'accepted', 'paid', 'rejected', 'expired')),
  payment_status text CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  deposit_amount numeric,
  deposit_paid boolean DEFAULT false,
  expiry_date date NOT NULL,
  notes text,
  terms_accepted boolean DEFAULT false,
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  accepted_at timestamptz,
  paid_at timestamptz
);

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for quote_requests
CREATE POLICY "Quote requests are viewable by company members and admins" ON quote_requests
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Quote requests are manageable by admins" ON quote_requests
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add RLS policies for material_kits
CREATE POLICY "Material kits are viewable by authenticated users" ON material_kits
  FOR SELECT
  USING (true);

CREATE POLICY "Material kits are manageable by admins" ON material_kits
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add RLS policies for quotes
CREATE POLICY "Quotes are viewable by company members and admins" ON quotes
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    ) OR auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Quotes are manageable by admins" ON quotes
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS quote_requests_company_id_idx ON quote_requests(company_id);
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests(status);
CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx ON quote_requests(created_at);

CREATE INDEX IF NOT EXISTS material_kits_type_idx ON material_kits(type);
CREATE INDEX IF NOT EXISTS material_kits_name_idx ON material_kits(name);

CREATE INDEX IF NOT EXISTS quotes_company_id_idx ON quotes(company_id);
CREATE INDEX IF NOT EXISTS quotes_status_idx ON quotes(status);
CREATE INDEX IF NOT EXISTS quotes_created_at_idx ON quotes(created_at);
CREATE INDEX IF NOT EXISTS quotes_request_id_idx ON quotes(request_id);

-- Insert sample material kits
INSERT INTO material_kits (id, name, type, description, base_price, items)
VALUES
  (
    gen_random_uuid(),
    'Kit Chambre Froide Standard',
    'cold_storage',
    'Kit complet pour chambre froide commerciale standard',
    8500,
    '[
      {"name": "Unité de condensation", "description": "Unité de condensation 2HP", "quantity": 1, "unitPrice": 3500},
      {"name": "Évaporateur", "description": "Évaporateur plafonnier", "quantity": 1, "unitPrice": 2200},
      {"name": "Panneau isolant", "description": "Panneau sandwich 100mm", "quantity": 10, "unitPrice": 180},
      {"name": "Porte isotherme", "description": "Porte pivotante 800x1900mm", "quantity": 1, "unitPrice": 950},
      {"name": "Kit d''installation", "description": "Tuyauterie, raccords et accessoires", "quantity": 1, "unitPrice": 750}
    ]'::jsonb
  ),
  (
    gen_random_uuid(),
    'Kit VMC Double Flux',
    'vmc',
    'Système de ventilation mécanique contrôlée double flux',
    5200,
    '[
      {"name": "Centrale double flux", "description": "Centrale VMC double flux haut rendement", "quantity": 1, "unitPrice": 2800},
      {"name": "Conduits isolés", "description": "Conduits isolés diamètre 160mm", "quantity": 10, "unitPrice": 45},
      {"name": "Bouches d''extraction", "description": "Bouches d''extraction autoréglables", "quantity": 4, "unitPrice": 85},
      {"name": "Bouches d''insufflation", "description": "Bouches d''insufflation réglables", "quantity": 4, "unitPrice": 95},
      {"name": "Kit d''installation", "description": "Raccords, fixations et accessoires", "quantity": 1, "unitPrice": 650}
    ]'::jsonb
  ),
  (
    gen_random_uuid(),
    'Kit Chambre Froide Négative',
    'cold_storage',
    'Kit complet pour chambre froide négative professionnelle',
    12500,
    '[
      {"name": "Unité de condensation renforcée", "description": "Unité de condensation 3HP basse température", "quantity": 1, "unitPrice": 4800},
      {"name": "Évaporateur basse température", "description": "Évaporateur plafonnier dégivrage électrique", "quantity": 1, "unitPrice": 3200},
      {"name": "Panneau isolant renforcé", "description": "Panneau sandwich 150mm", "quantity": 12, "unitPrice": 220},
      {"name": "Porte isotherme négative", "description": "Porte pivotante chauffante 800x1900mm", "quantity": 1, "unitPrice": 1450},
      {"name": "Système de dégivrage", "description": "Kit de dégivrage électrique", "quantity": 1, "unitPrice": 850},
      {"name": "Kit d''installation", "description": "Tuyauterie, raccords et accessoires", "quantity": 1, "unitPrice": 950}
    ]'::jsonb
  ),
  (
    gen_random_uuid(),
    'Kit VMC Simple Flux',
    'vmc',
    'Système de ventilation mécanique contrôlée simple flux',
    2800,
    '[
      {"name": "Centrale simple flux", "description": "Centrale VMC simple flux autoréglable", "quantity": 1, "unitPrice": 1200},
      {"name": "Conduits", "description": "Conduits souples diamètre 125mm", "quantity": 8, "unitPrice": 35},
      {"name": "Bouches d''extraction", "description": "Bouches d''extraction autoréglables", "quantity": 4, "unitPrice": 65},
      {"name": "Entrées d''air", "description": "Entrées d''air autoréglables", "quantity": 6, "unitPrice": 45},
      {"name": "Kit d''installation", "description": "Raccords, fixations et accessoires", "quantity": 1, "unitPrice": 450}
    ]'::jsonb
  );