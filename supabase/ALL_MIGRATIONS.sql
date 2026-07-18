/*
  # Medical Clinic CRM - Core Tables

  1. New Tables
    - `users` - Staff members with roles
    - `patients` - Patient profiles with medical history
    - `doctors` - Doctor information with specializations
    - `departments` - Medical departments
    - `specializations` - Doctor specializations
  
  2. Security
    - Enable RLS on all tables
    - Create role-based access policies
*/

CREATE TABLE IF NOT EXISTS specializations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  head_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'receptionist', 'lab_staff', 'patient')),
  is_active boolean DEFAULT true,
  department_id uuid REFERENCES departments(id),
  specialization_id uuid REFERENCES specializations(id),
  qualifications text,
  license_number text,
  profile_image_url text,
  bio text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  blood_group text,
  phone text NOT NULL,
  email text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_history text,
  allergies text,
  chronic_conditions text,
  insurance_provider text,
  insurance_policy_number text,
  patient_mrn text UNIQUE,
  registration_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE specializations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view specializations"
  ON specializations FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage specializations"
  ON specializations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Admin can manage departments"
  ON departments FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
  );

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()));

CREATE POLICY "Admin can manage users"
  ON users FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Allow newly registered users to insert their own profile row
CREATE POLICY "Users can create their own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Patients can view own data"
  ON patients FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'doctor', 'nurse'))
  );

CREATE POLICY "Patients can update own data"
  ON patients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin and medical staff can manage patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist', 'doctor', 'nurse'))
  );

CREATE INDEX idx_patients_user_id ON patients(user_id);
CREATE INDEX idx_patients_mrn ON patients(patient_mrn);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);/*
  # Appointment & Scheduling System

  1. New Tables
    - `doctor_schedules` - Doctor availability
    - `appointments` - Patient appointments
    - `appointment_tokens` - Queue management
    - `appointment_reminders` - Reminder tracking

  2. Security
    - Enable RLS with proper access control
*/

CREATE TABLE IF NOT EXISTS doctor_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week integer CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  slot_duration_minutes integer DEFAULT 30,
  max_appointments_per_day integer DEFAULT 20,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  appointment_type text CHECK (appointment_type IN ('opd', 'ipd', 'walk_in', 'follow_up')),
  status text CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show', 'rescheduled')) DEFAULT 'scheduled',
  reason_for_visit text,
  notes text,
  token_number integer,
  queue_position integer,
  consultation_fee numeric(10,2),
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS appointment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  reminder_type text CHECK (reminder_type IN ('email', 'sms', 'whatsapp')),
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  status text CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors can view own schedules"
  ON doctor_schedules FOR SELECT
  TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist'))
  );

CREATE POLICY "Admin can manage doctor schedules"
  ON doctor_schedules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Doctors can manage own schedules"
  ON doctor_schedules FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Patients can view own appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist', 'nurse'))
  );

CREATE POLICY "Medical staff can create appointments"
  ON appointments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist', 'doctor', 'nurse'))
  );

CREATE POLICY "Doctors and staff can update appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist', 'nurse'))
  )
  WITH CHECK (
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'receptionist', 'nurse'))
  );

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_doctor_schedules_doctor ON doctor_schedules(doctor_id);
CREATE INDEX idx_appointment_reminders_apt ON appointment_reminders(appointment_id);/*
  # Clinical Records, Diagnoses & Prescriptions

  1. New Tables
    - `clinical_records` - Doctor consultation notes
    - `diagnoses` - Patient diagnoses
    - `prescriptions` - Medicine prescriptions
    - `prescription_items` - Individual medicines in prescriptions

  2. Security
    - Enable RLS with doctor and patient access
*/

CREATE TABLE IF NOT EXISTS clinical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consultation_notes text,
  physical_examination text,
  vital_signs jsonb,
  weight numeric(6,2),
  height numeric(6,2),
  blood_pressure text,
  temperature numeric(5,2),
  heart_rate integer,
  respiratory_rate integer,
  record_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinical_record_id uuid NOT NULL REFERENCES clinical_records(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  diagnosis_code text,
  diagnosis_name text NOT NULL,
  severity text CHECK (severity IN ('mild', 'moderate', 'severe')),
  status text CHECK (status IN ('active', 'inactive', 'resolved')) DEFAULT 'active',
  notes text,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id) ON DELETE SET NULL,
  prescription_date date NOT NULL,
  valid_until date,
  notes text,
  status text CHECK (status IN ('active', 'completed', 'cancelled', 'filled')) DEFAULT 'active',
  pdf_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS prescription_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id uuid NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
  medicine_name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  duration text,
  instructions text,
  quantity integer,
  refills integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clinical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own clinical records"
  ON clinical_records FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'nurse'))
  );

CREATE POLICY "Doctors can create clinical records"
  ON clinical_records FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid() AND
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'doctor')
  );

CREATE POLICY "Doctors can update own clinical records"
  ON clinical_records FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Patients and doctors can view diagnoses"
  ON diagnoses FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'nurse'))
  );

CREATE POLICY "Doctors can create diagnoses"
  ON diagnoses FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
    doctor_id = auth.uid() OR
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'nurse', 'lab_staff'))
  );

CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "Doctors can update own prescriptions"
  ON prescriptions FOR UPDATE
  TO authenticated
  USING (doctor_id = auth.uid())
  WITH CHECK (doctor_id = auth.uid());

CREATE POLICY "View prescription items"
  ON prescription_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions p
      WHERE p.id = prescription_id AND (
        p.patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid()) OR
        p.doctor_id = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'nurse', 'lab_staff'))
      )
    )
  );

CREATE INDEX idx_clinical_records_patient ON clinical_records(patient_id);
CREATE INDEX idx_clinical_records_doctor ON clinical_records(doctor_id);
CREATE INDEX idx_clinical_records_appointment ON clinical_records(appointment_id);
CREATE INDEX idx_diagnoses_patient ON diagnoses(patient_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);/*
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
CREATE INDEX idx_lab_reports_status ON lab_reports(status);/*
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
CREATE INDEX idx_medical_documents_type ON medical_documents(document_type);/*
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
