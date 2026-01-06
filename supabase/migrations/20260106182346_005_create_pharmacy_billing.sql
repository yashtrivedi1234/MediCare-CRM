/*
  # Pharmacy Inventory & Billing System

  1. New Tables
    - `medicines` - Medicine inventory
    - `medicine_stock` - Stock tracking
    - `bills` - Patient bills
    - `bill_items` - Individual line items

  2. Security
    - Enable RLS with staff and patient access
*/

CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  generic_name text,
  manufacturer text,
  strength text,
  form text CHECK (form IN ('tablet', 'capsule', 'liquid', 'injection', 'cream', 'powder', 'other')),
  unit_price numeric(10,2) NOT NULL,
  hsn_code text,
  gst_rate numeric(5,2) DEFAULT 18,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medicine_stock (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id uuid NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  quantity_in_stock integer NOT NULL DEFAULT 0,
  reorder_level integer DEFAULT 50,
  batch_number text,
  expiry_date date,
  cost_per_unit numeric(10,2),
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  bill_number text UNIQUE NOT NULL,
  bill_date date NOT NULL,
  bill_type text CHECK (bill_type IN ('consultation', 'lab', 'pharmacy', 'ipd', 'combined')),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax_amount numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) DEFAULT 0,
  total_amount numeric(10,2) NOT NULL,
  paid_amount numeric(10,2) DEFAULT 0,
  payment_status text CHECK (payment_status IN ('pending', 'partial', 'paid', 'cancelled')) DEFAULT 'pending',
  payment_method text CHECK (payment_method IN ('cash', 'card', 'upi', 'bank_transfer', 'insurance')),
  paid_at timestamptz,
  notes text,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  item_type text CHECK (item_type IN ('consultation', 'lab_test', 'medicine', 'procedure')),
  item_id uuid,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price numeric(10,2) NOT NULL,
  tax_rate numeric(5,2) DEFAULT 0,
  tax_amount numeric(10,2) DEFAULT 0,
  line_total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES users(id),
  document_type text CHECK (document_type IN ('report', 'scan', 'xray', 'prescription', 'certificate', 'insurance', 'other')),
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  document_date date,
  description text,
  is_visible_to_patient boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicine_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active medicines"
  ON medicines FOR SELECT
  USING (is_active = true);

CREATE POLICY "Staff can manage medicines"
  ON medicines FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  );

CREATE POLICY "Staff can view stock"
  ON medicine_stock FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff', 'receptionist'))
  );

CREATE POLICY "Staff can manage stock"
  ON medicine_stock FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'lab_staff'))
  );

CREATE POLICY "Patients can view own bills"
  ON bills FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist'))
  );

CREATE POLICY "Staff can create and manage bills"
  ON bills FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist'))
  );

CREATE POLICY "View bill items"
  ON bill_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bills
      WHERE bills.id = bill_items.bill_id AND (
        bills.patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist'))
      )
    )
  );

CREATE POLICY "Patients can view own documents"
  ON medical_documents FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
    uploaded_by = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'doctor', 'nurse'))
  );

CREATE POLICY "Staff can upload documents"
  ON medical_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'doctor', 'nurse', 'lab_staff'))
  );

CREATE INDEX idx_bills_patient ON bills(patient_id);
CREATE INDEX idx_bills_date ON bills(bill_date);
CREATE INDEX idx_bills_status ON bills(payment_status);
CREATE INDEX idx_bill_items_bill ON bill_items(bill_id);
CREATE INDEX idx_medicine_stock_medicine ON medicine_stock(medicine_id);
CREATE INDEX idx_medicine_stock_expiry ON medicine_stock(expiry_date);
CREATE INDEX idx_medical_documents_patient ON medical_documents(patient_id);
CREATE INDEX idx_medical_documents_type ON medical_documents(document_type);