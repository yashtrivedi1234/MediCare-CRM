/*
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
CREATE INDEX idx_appointment_reminders_apt ON appointment_reminders(appointment_id);