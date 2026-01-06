export type UserRole = 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'lab_staff' | 'patient';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  department_id?: string;
  specialization_id?: string;
  profile_image_url?: string;
  created_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  blood_group?: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history?: string;
  allergies?: string;
  chronic_conditions?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  patient_mrn?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  full_name: string;
  specialization_id: string;
  specialization?: Specialization;
  department_id: string;
  department?: Department;
  qualifications?: string;
  license_number?: string;
  bio?: string;
  profile_image_url?: string;
  phone: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
}

export interface Specialization {
  id: string;
  name: string;
  description?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_date: string;
  scheduled_time: string;
  appointment_type: 'opd' | 'ipd' | 'walk_in' | 'follow_up';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  reason_for_visit?: string;
  token_number?: number;
  consultation_fee?: number;
  created_at: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  prescription_date: string;
  valid_until?: string;
  status: 'active' | 'completed' | 'cancelled' | 'filled';
  notes?: string;
  pdf_url?: string;
  items?: PrescriptionItem[];
  created_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  quantity?: number;
}

export interface LabOrder {
  id: string;
  patient_id: string;
  doctor_id?: string;
  test_type_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  urgency: 'routine' | 'urgent';
  order_date: string;
  specimen_collected_at?: string;
}

export interface LabReport {
  id: string;
  lab_order_id: string;
  patient_id: string;
  test_name: string;
  result_value?: string;
  unit?: string;
  is_abnormal: boolean;
  status: 'draft' | 'pending_verification' | 'verified' | 'released';
  verified_at?: string;
  pdf_url?: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  manufacturer?: string;
  strength?: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'injection' | 'cream' | 'powder' | 'other';
  unit_price: number;
  is_active: boolean;
}

export interface MedicineStock {
  id: string;
  medicine_id: string;
  quantity_in_stock: number;
  reorder_level: number;
  expiry_date?: string;
  batch_number?: string;
}

export interface Bill {
  id: string;
  patient_id: string;
  bill_number: string;
  bill_date: string;
  bill_type: 'consultation' | 'lab' | 'pharmacy' | 'ipd' | 'combined';
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_status: 'pending' | 'partial' | 'paid' | 'cancelled';
  payment_method?: string;
  items?: BillItem[];
  created_at: string;
}

export interface BillItem {
  id: string;
  bill_id: string;
  item_type: 'consultation' | 'lab_test' | 'medicine' | 'procedure';
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ClinicalRecord {
  id: string;
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  consultation_notes?: string;
  physical_examination?: string;
  weight?: number;
  height?: number;
  blood_pressure?: string;
  temperature?: number;
  heart_rate?: number;
  created_at: string;
}

export interface MedicalDocument {
  id: string;
  patient_id: string;
  document_type: 'report' | 'scan' | 'xray' | 'prescription' | 'certificate' | 'insurance' | 'other';
  file_name: string;
  file_url: string;
  document_date?: string;
  description?: string;
}
