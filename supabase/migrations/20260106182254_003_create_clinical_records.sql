/*
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
CREATE INDEX idx_prescription_items_prescription ON prescription_items(prescription_id);