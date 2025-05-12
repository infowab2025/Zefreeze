-- First check if policies exist before dropping them
DO $$ 
BEGIN
  -- Drop policies if they exist
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Companies are viewable by authenticated users' AND tablename = 'companies') THEN
    DROP POLICY "Companies are viewable by authenticated users" ON companies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Companies are editable by admins' AND tablename = 'companies') THEN
    DROP POLICY "Companies are editable by admins" ON companies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Companies are viewable by their members' AND tablename = 'companies') THEN
    DROP POLICY "Companies are viewable by their members" ON companies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Companies are viewable by company members and technicians' AND tablename = 'companies') THEN
    DROP POLICY "Companies are viewable by company members and technicians" ON companies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Companies are viewable by all authenticated users' AND tablename = 'companies') THEN
    DROP POLICY "Companies are viewable by all authenticated users" ON companies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Companies are manageable by admins only' AND tablename = 'companies') THEN
    DROP POLICY "Companies are manageable by admins only" ON companies;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Companies are manageable by admins' AND tablename = 'companies') THEN
    DROP POLICY "Companies are manageable by admins" ON companies;
  END IF;
END $$;

-- Create new policies with proper permissions
-- Allow all authenticated users to view companies
CREATE POLICY "Companies are viewable by all authenticated users" 
ON companies
FOR SELECT 
TO authenticated
USING (true);

-- Allow only admins to insert, update, and delete companies
CREATE POLICY "Companies are manageable by admins only" 
ON companies
FOR ALL 
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');