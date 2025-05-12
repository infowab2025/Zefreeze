-- First ensure RLS is enabled
ALTER TABLE technician_availability ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Technicians can manage their own availability" ON technician_availability;
DROP POLICY IF EXISTS "Users can view technician availability" ON technician_availability;

-- Create policy for technicians to manage their own availability and admins to manage all
CREATE POLICY "Technicians can manage their own availability"
ON technician_availability
FOR ALL
TO authenticated
USING (
  (technician_id = auth.uid()) OR 
  (auth.jwt() ->> 'role'::text) = 'admin'
)
WITH CHECK (
  (technician_id = auth.uid()) OR 
  (auth.jwt() ->> 'role'::text) = 'admin'
);

-- Create policy for viewing availability (all authenticated users can view)
CREATE POLICY "Users can view technician availability"
ON technician_availability
FOR SELECT
TO authenticated
USING (true);