/*
  # Lab Management & Reports

  1. New Tables
    - `lab_test_types` - Available lab tests
    - `lab_orders` - Ordered lab tests
    - `lab_reports` - Test results

  2. Security
    - Enable RLS with proper patient and staff access
*/

CREATE TABLE IF NOT EXISTS lab_test_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text UNIQUE,
  description text,
  normal_range text,
  unit text,
  sample_type text,
  turnaround_time_hours integer,
  price numeric(10,2),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  ordered_by_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  order_date timestamptz DEFAULT now(),
  test_type_id uuid NOT NULL REFERENCES lab_test_types(id),
  urgency text CHECK (urgency IN ('routine', 'urgent')) DEFAULT 'routine',
  status text CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  specimen_collected_at timestamptz,
  sample_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lab_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id uuid NOT NULL REFERENCES lab_orders(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  result_value text,
  unit text,
  normal_range text,
  reference_range text,
  is_abnormal boolean DEFAULT false,
  notes text,
  report_date timestamptz DEFAULT now(),
  verified_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  pdf_url text,
  status text CHECK (status IN ('draft', 'pending_verification', 'verified', 'released')) DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE lab_test_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view lab test types"
  ON lab_test_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage lab test types"
  ON lab_test_types FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Patients can view own lab orders"
  ON lab_orders FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff', 'nurse'))
  );

CREATE POLICY "Medical staff can create lab orders"
  ON lab_orders FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'doctor', 'receptionist', 'nurse'))
  );

CREATE POLICY "Lab staff can update lab orders"
  ON lab_orders FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  );

CREATE POLICY "Patients can view own lab reports"
  ON lab_reports FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM lab_orders
      WHERE lab_orders.id = lab_reports.lab_order_id AND (
        lab_orders.doctor_id = auth.uid() OR
        lab_orders.ordered_by_id = auth.uid()
      )
    ) OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff', 'nurse'))
  );

CREATE POLICY "Lab staff can create reports"
  ON lab_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  );

CREATE POLICY "Lab staff can update reports"
  ON lab_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  );

CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id);
CREATE INDEX idx_lab_orders_status ON lab_orders(status);
CREATE INDEX idx_lab_reports_order ON lab_reports(lab_order_id);
CREATE INDEX idx_lab_reports_patient ON lab_reports(patient_id);
CREATE INDEX idx_lab_reports_status ON lab_reports(status);