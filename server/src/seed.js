const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Patient = require("./models/Patient");
const Appointment = require("./models/Appointment");
const LabOrder = require("./models/LabOrder");

const DEMO_PASSWORD = process.env.ADMIN_PASSWORD || "password";

const DEMO_ACCOUNTS = [
  {
    email: process.env.ADMIN_EMAIL || "admin@clinic.com",
    full_name: "Clinic Admin",
    role: "admin",
    phone: "+91-9999999999",
  },
  {
    email: "doctor@clinic.com",
    full_name: "Dr. Ananya Mehta",
    role: "doctor",
    phone: "+91-9876500001",
    department_id: "cardiology",
    specialization_id: "cardiology",
  },
  {
    email: "nurse@clinic.com",
    full_name: "Priya Nair",
    role: "nurse",
    phone: "+91-9876500002",
  },
  {
    email: "reception@clinic.com",
    full_name: "Rohit Sharma",
    role: "receptionist",
    phone: "+91-9876500003",
  },
  {
    email: "lab@clinic.com",
    full_name: "Kavita Desai",
    role: "lab_staff",
    phone: "+91-9876500004",
  },
  {
    email: "patient@clinic.com",
    full_name: "Aarav Patel",
    role: "patient",
    phone: "+91-9998887770",
  },
];

const SAMPLE_PATIENTS = [
  {
    first_name: "Aarav",
    last_name: "Patel",
    date_of_birth: "1990-03-14",
    gender: "male",
    phone: "9998887770",
    email: "aarav.patel@example.com",
    blood_group: "O+",
    patient_mrn: "MRN-001",
    address: "12 Park Street",
    city: "Ahmedabad",
    state: "Gujarat",
    medical_history: "Hypertension",
    allergies: "None",
    chronic_conditions: "High BP",
  },
  {
    first_name: "Diya",
    last_name: "Shah",
    date_of_birth: "1985-09-22",
    gender: "female",
    phone: "8887776665",
    email: "diya.shah@example.com",
    blood_group: "A+",
    patient_mrn: "MRN-002",
    address: "45 CG Road",
    city: "Ahmedabad",
    state: "Gujarat",
    medical_history: "Diabetes Type 2",
    allergies: "Penicillin",
    chronic_conditions: "Diabetes",
  },
  {
    first_name: "Kabir",
    last_name: "Singh",
    date_of_birth: "1978-01-08",
    gender: "male",
    phone: "7776665554",
    email: "kabir.singh@example.com",
    blood_group: "B+",
    patient_mrn: "MRN-003",
    address: "8 Satellite Rd",
    city: "Ahmedabad",
    state: "Gujarat",
    medical_history: "Asthma",
    allergies: "Dust",
    chronic_conditions: "Asthma",
  },
  {
    first_name: "Meera",
    last_name: "Iyer",
    date_of_birth: "1995-06-30",
    gender: "female",
    phone: "6665554443",
    email: "meera.iyer@example.com",
    blood_group: "AB+",
    patient_mrn: "MRN-004",
    address: "22 Law Garden",
    city: "Ahmedabad",
    state: "Gujarat",
    medical_history: "None",
    allergies: "None",
  },
  {
    first_name: "Rohan",
    last_name: "Joshi",
    date_of_birth: "1982-11-17",
    gender: "male",
    phone: "5554443332",
    email: "rohan.joshi@example.com",
    blood_group: "O-",
    patient_mrn: "MRN-005",
    address: "3 Navrangpura",
    city: "Ahmedabad",
    state: "Gujarat",
    medical_history: "Thyroid disorder",
    allergies: "Sulfa drugs",
    chronic_conditions: "Hypothyroidism",
  },
  {
    first_name: "Anvi",
    last_name: "Kapoor",
    date_of_birth: "2001-04-02",
    gender: "female",
    phone: "4443332221",
    email: "anvi.kapoor@example.com",
    blood_group: "A-",
    patient_mrn: "MRN-006",
    address: "19 Bodakdev",
    city: "Ahmedabad",
    state: "Gujarat",
    medical_history: "Migraine",
    allergies: "None",
  },
];

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function demoCredentials() {
  return DEMO_ACCOUNTS.map(({ email, full_name, role }) => ({
    email,
    password: DEMO_PASSWORD,
    full_name,
    role,
  }));
}

async function ensureDemoUsers() {
  const password_hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let created = 0;

  for (const account of DEMO_ACCOUNTS) {
    const email = account.email.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) continue;

    await User.create({
      ...account,
      email,
      password_hash,
    });
    created += 1;
  }

  return { created, accounts: demoCredentials() };
}

async function ensureSampleData() {
  for (const patient of SAMPLE_PATIENTS) {
    const exists = await Patient.findOne({ patient_mrn: patient.patient_mrn });
    if (!exists) await Patient.create(patient);
  }

  const appointmentCount = await Appointment.estimatedDocumentCount();
  if (appointmentCount < 8) {
    await Appointment.insertMany([
      {
        patient_id: "MRN-001",
        doctor_id: "doctor@clinic.com",
        scheduled_date: isoDate(0),
        scheduled_time: "09:30",
        appointment_type: "opd",
        status: "scheduled",
        token_number: 1,
        reason_for_visit: "BP follow-up",
        consultation_fee: 600,
      },
      {
        patient_id: "MRN-002",
        doctor_id: "doctor@clinic.com",
        scheduled_date: isoDate(0),
        scheduled_time: "10:15",
        appointment_type: "follow_up",
        status: "scheduled",
        token_number: 2,
        reason_for_visit: "Diabetes review",
        consultation_fee: 600,
      },
      {
        patient_id: "MRN-003",
        doctor_id: "doctor@clinic.com",
        scheduled_date: isoDate(0),
        scheduled_time: "11:00",
        appointment_type: "walk_in",
        status: "completed",
        token_number: 3,
        reason_for_visit: "Asthma checkup",
        consultation_fee: 500,
      },
      {
        patient_id: "MRN-004",
        doctor_id: "doctor@clinic.com",
        scheduled_date: isoDate(1),
        scheduled_time: "09:00",
        appointment_type: "opd",
        status: "scheduled",
        token_number: 4,
        reason_for_visit: "General consultation",
        consultation_fee: 500,
      },
      {
        patient_id: "MRN-005",
        doctor_id: "doctor@clinic.com",
        scheduled_date: isoDate(1),
        scheduled_time: "12:30",
        appointment_type: "opd",
        status: "scheduled",
        token_number: 5,
        reason_for_visit: "Thyroid panel review",
        consultation_fee: 700,
      },
      {
        patient_id: "MRN-006",
        doctor_id: "doctor@clinic.com",
        scheduled_date: isoDate(-1),
        scheduled_time: "16:00",
        appointment_type: "opd",
        status: "completed",
        token_number: 8,
        reason_for_visit: "Migraine consultation",
        consultation_fee: 500,
      },
      {
        patient_id: "MRN-001",
        doctor_id: "doctor@clinic.com",
        scheduled_date: isoDate(-2),
        scheduled_time: "15:00",
        appointment_type: "follow_up",
        status: "cancelled",
        token_number: 6,
        reason_for_visit: "Reschedule requested",
        consultation_fee: 600,
      },
      {
        patient_id: "MRN-003",
        doctor_id: "doctor@clinic.com",
        scheduled_date: isoDate(2),
        scheduled_time: "10:45",
        appointment_type: "ipd",
        status: "scheduled",
        token_number: 9,
        reason_for_visit: "Pre-admission assessment",
        consultation_fee: 1000,
      },
    ]);
  }

  const labOrderCount = await LabOrder.estimatedDocumentCount();
  if (labOrderCount < 6) {
    await LabOrder.insertMany([
      {
        patient_id: "MRN-001",
        doctor_id: "doctor@clinic.com",
        test_name: "Complete Blood Count",
        status: "pending",
        urgency: "routine",
        order_date: isoDate(0),
      },
      {
        patient_id: "MRN-002",
        doctor_id: "doctor@clinic.com",
        test_name: "Lipid Profile",
        status: "in_progress",
        urgency: "urgent",
        order_date: isoDate(0),
        specimen_collected_at: isoDate(0),
      },
      {
        patient_id: "MRN-003",
        doctor_id: "doctor@clinic.com",
        test_name: "Chest X-Ray",
        status: "completed",
        urgency: "routine",
        order_date: isoDate(-1),
        specimen_collected_at: isoDate(-1),
      },
      {
        patient_id: "MRN-004",
        doctor_id: "doctor@clinic.com",
        test_name: "Vitamin D",
        status: "pending",
        urgency: "routine",
        order_date: isoDate(0),
      },
      {
        patient_id: "MRN-005",
        doctor_id: "doctor@clinic.com",
        test_name: "TSH / Thyroid Panel",
        status: "completed",
        urgency: "urgent",
        order_date: isoDate(-2),
        specimen_collected_at: isoDate(-2),
      },
      {
        patient_id: "MRN-006",
        doctor_id: "doctor@clinic.com",
        test_name: "MRI Brain",
        status: "pending",
        urgency: "urgent",
        order_date: isoDate(-1),
      },
    ]);
  }
}

async function runSetup() {
  const users = await ensureDemoUsers();
  await ensureSampleData();
  return {
    email: users.accounts[0].email,
    password: DEMO_PASSWORD,
    created: users.created > 0,
    accounts: users.accounts,
  };
}

module.exports = {
  ensureDemoUsers,
  ensureAdminSeed: ensureDemoUsers,
  ensureSampleData,
  runSetup,
  DEMO_ACCOUNTS,
  DEMO_PASSWORD,
};
