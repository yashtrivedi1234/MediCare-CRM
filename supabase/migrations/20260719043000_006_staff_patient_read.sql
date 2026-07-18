/*
  Demo / staff read access — let clinic roles view patient lists.
*/

DROP POLICY IF EXISTS "Patients can view own data" ON patients;

CREATE POLICY "Staff and patients can view patient records"
  ON patients FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'doctor', 'nurse', 'receptionist', 'lab_staff')
    )
  );
