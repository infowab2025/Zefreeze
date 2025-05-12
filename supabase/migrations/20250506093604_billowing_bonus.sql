/*
  # Fix Company RLS Policies

  1. Changes
    - Update RLS policies for companies table to allow:
      - Admins to manage all companies
      - All authenticated users to view companies
    
  2. Security
    - Ensure proper access control for company data
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Companies are viewable by authenticated users" ON companies;
DROP POLICY IF EXISTS "Companies are editable by admins" ON companies;
DROP POLICY IF EXISTS "Companies are viewable by their members" ON companies;

-- Create new policies with proper permissions
CREATE POLICY "Companies are viewable by all authenticated users" 
ON companies
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Companies are manageable by admins" 
ON companies
FOR ALL
TO authenticated
USING ((auth.jwt() ->> 'role'::text) = 'admin')
WITH CHECK ((auth.jwt() ->> 'role'::text) = 'admin');