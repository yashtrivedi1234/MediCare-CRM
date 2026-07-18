import { hasSupabaseConfig, supabase } from './supabase';

export const DEMO_PASSWORD = 'password';

export const DEMO_ACCOUNTS = [
  { email: 'admin@clinic.com', full_name: 'Clinic Admin', role: 'admin', phone: '+91-9999999999' },
  { email: 'doctor@clinic.com', full_name: 'Dr. Ananya Mehta', role: 'doctor', phone: '+91-9876500001' },
  { email: 'nurse@clinic.com', full_name: 'Priya Nair', role: 'nurse', phone: '+91-9876500002' },
  { email: 'reception@clinic.com', full_name: 'Rohit Sharma', role: 'receptionist', phone: '+91-9876500003' },
  { email: 'lab@clinic.com', full_name: 'Kavita Desai', role: 'lab_staff', phone: '+91-9876500004' },
  { email: 'patient@clinic.com', full_name: 'Aarav Patel', role: 'patient', phone: '+91-9998887770' },
] as const;

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

async function ensureAuthUser(account: (typeof DEMO_ACCOUNTS)[number]) {
  const email = account.email.toLowerCase();
  const confirmHint =
    'Turn OFF “Confirm email” in Supabase → Authentication → Providers → Email, then retry.';

  // Prefer sign-in (already exists). Fall back to sign-up.
  let userId: string | undefined;
  const signIn = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
  if (signIn.data.session?.user) {
    userId = signIn.data.session.user.id;
  } else {
    const signUp = await supabase.auth.signUp({
      email,
      password: DEMO_PASSWORD,
      options: { data: { full_name: account.full_name, role: account.role } },
    });

    if (signUp.error) {
      const retry = await supabase.auth.signInWithPassword({ email, password: DEMO_PASSWORD });
      if (retry.error || !retry.data.session?.user) {
        throw new Error(`Could not create/login ${email}: ${signUp.error.message}. ${confirmHint}`);
      }
      userId = retry.data.session.user.id;
    } else if (signUp.data.session?.user) {
      userId = signUp.data.session.user.id;
    } else if (signUp.data.user && !signUp.data.session) {
      // Account created but not confirmed — cannot write public.users under RLS
      throw new Error(
        `Signed up ${email} but no session was returned. ${confirmHint}`
      );
    }
  }

  if (!userId) throw new Error(`No user id for ${email}. ${confirmHint}`);

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error(`Not authenticated while creating profile for ${email}. ${confirmHint}`);
  }

  const { error } = await supabase.from('users').upsert({
    id: userId,
    email,
    full_name: account.full_name,
    phone: account.phone,
    role: account.role,
    is_active: true,
  });
  if (error) throw new Error(`Profile upsert failed for ${email}: ${error.message}`);

  await supabase.auth.signOut();
  return userId;
}

async function seedClinicData(ids: Record<string, string>) {
  const adminId = ids['admin@clinic.com'];
  const doctorId = ids['doctor@clinic.com'];
  const patientUserId = ids['patient@clinic.com'];
  if (!adminId || !doctorId) throw new Error('Missing admin/doctor ids');

  // Sign in as admin for staff-only inserts
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: 'admin@clinic.com',
    password: DEMO_PASSWORD,
  });
  if (loginError) throw new Error(loginError.message);

  const samplePatients = [
    {
      first_name: 'Aarav',
      last_name: 'Patel',
      date_of_birth: '1990-03-14',
      gender: 'male',
      phone: '9998887770',
      email: 'aarav.patel@example.com',
      blood_group: 'O+',
      patient_mrn: 'MRN-001',
      medical_history: 'Hypertension',
      allergies: 'None',
      user_id: patientUserId,
    },
    {
      first_name: 'Diya',
      last_name: 'Shah',
      date_of_birth: '1985-09-22',
      gender: 'female',
      phone: '8887776665',
      email: 'diya.shah@example.com',
      blood_group: 'A+',
      patient_mrn: 'MRN-002',
      medical_history: 'Diabetes Type 2',
      allergies: 'Penicillin',
    },
    {
      first_name: 'Kabir',
      last_name: 'Singh',
      date_of_birth: '1978-01-08',
      gender: 'male',
      phone: '7776665554',
      email: 'kabir.singh@example.com',
      blood_group: 'B+',
      patient_mrn: 'MRN-003',
      medical_history: 'Asthma',
      allergies: 'Dust',
    },
    {
      first_name: 'Meera',
      last_name: 'Iyer',
      date_of_birth: '1995-06-30',
      gender: 'female',
      phone: '6665554443',
      email: 'meera.iyer@example.com',
      blood_group: 'AB+',
      patient_mrn: 'MRN-004',
    },
    {
      first_name: 'Rohan',
      last_name: 'Joshi',
      date_of_birth: '1982-11-17',
      gender: 'male',
      phone: '5554443332',
      email: 'rohan.joshi@example.com',
      blood_group: 'O-',
      patient_mrn: 'MRN-005',
      medical_history: 'Thyroid disorder',
    },
    {
      first_name: 'Anvi',
      last_name: 'Kapoor',
      date_of_birth: '2001-04-02',
      gender: 'female',
      phone: '4443332221',
      email: 'anvi.kapoor@example.com',
      blood_group: 'A-',
      patient_mrn: 'MRN-006',
      medical_history: 'Migraine',
    },
  ];

  for (const patient of samplePatients) {
    const { data: existing } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_mrn', patient.patient_mrn)
      .maybeSingle();
    if (!existing) {
      const { error } = await supabase.from('patients').insert(patient);
      if (error) throw new Error(`Patient seed failed (${patient.patient_mrn}): ${error.message}`);
    }
  }

  const { data: patients, error: patientsError } = await supabase
    .from('patients')
    .select('id, patient_mrn');
  if (patientsError) throw new Error(patientsError.message);

  const mrnToId = Object.fromEntries((patients || []).map((p) => [p.patient_mrn, p.id]));

  const { count: apptCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  if ((apptCount || 0) < 6) {
    const rows = [
      {
        patient_id: mrnToId['MRN-001'],
        doctor_id: doctorId,
        scheduled_date: isoDate(0),
        scheduled_time: '09:30',
        appointment_type: 'opd',
        status: 'scheduled',
        token_number: 1,
        reason_for_visit: 'BP follow-up',
        consultation_fee: 600,
        created_by: adminId,
      },
      {
        patient_id: mrnToId['MRN-002'],
        doctor_id: doctorId,
        scheduled_date: isoDate(0),
        scheduled_time: '10:15',
        appointment_type: 'follow_up',
        status: 'scheduled',
        token_number: 2,
        reason_for_visit: 'Diabetes review',
        consultation_fee: 600,
        created_by: adminId,
      },
      {
        patient_id: mrnToId['MRN-003'],
        doctor_id: doctorId,
        scheduled_date: isoDate(0),
        scheduled_time: '11:00',
        appointment_type: 'walk_in',
        status: 'completed',
        token_number: 3,
        reason_for_visit: 'Asthma checkup',
        consultation_fee: 500,
        created_by: adminId,
      },
      {
        patient_id: mrnToId['MRN-004'],
        doctor_id: doctorId,
        scheduled_date: isoDate(1),
        scheduled_time: '09:00',
        appointment_type: 'opd',
        status: 'scheduled',
        token_number: 4,
        reason_for_visit: 'General consultation',
        consultation_fee: 500,
        created_by: adminId,
      },
      {
        patient_id: mrnToId['MRN-005'],
        doctor_id: doctorId,
        scheduled_date: isoDate(-1),
        scheduled_time: '16:00',
        appointment_type: 'opd',
        status: 'completed',
        token_number: 5,
        reason_for_visit: 'Thyroid panel review',
        consultation_fee: 700,
        created_by: adminId,
      },
      {
        patient_id: mrnToId['MRN-006'],
        doctor_id: doctorId,
        scheduled_date: isoDate(2),
        scheduled_time: '10:45',
        appointment_type: 'opd',
        status: 'scheduled',
        token_number: 6,
        reason_for_visit: 'Migraine consultation',
        consultation_fee: 500,
        created_by: adminId,
      },
    ].filter((r) => r.patient_id);

    if (rows.length) {
      const { error } = await supabase.from('appointments').insert(rows);
      if (error) throw new Error(`Appointment seed failed: ${error.message}`);
    }
  }

  const testNames = [
    { name: 'Complete Blood Count', code: 'CBC' },
    { name: 'Lipid Profile', code: 'LIPID' },
    { name: 'Chest X-Ray', code: 'CXR' },
    { name: 'Vitamin D', code: 'VITD' },
    { name: 'TSH / Thyroid Panel', code: 'TSH' },
    { name: 'MRI Brain', code: 'MRI-BR' },
  ];

  for (const t of testNames) {
    const { data: existing } = await supabase
      .from('lab_test_types')
      .select('id')
      .eq('code', t.code)
      .maybeSingle();
    if (!existing) {
      const { error } = await supabase.from('lab_test_types').insert({ ...t, is_active: true, price: 500 });
      if (error) throw new Error(`Lab test type seed failed (${t.code}): ${error.message}`);
    }
  }

  const { data: types } = await supabase.from('lab_test_types').select('id, code');
  const codeToId = Object.fromEntries((types || []).map((t) => [t.code, t.id]));

  const { count: labCount } = await supabase
    .from('lab_orders')
    .select('*', { count: 'exact', head: true });

  if ((labCount || 0) < 4) {
    const labRows = [
      {
        patient_id: mrnToId['MRN-001'],
        doctor_id: doctorId,
        ordered_by_id: adminId,
        test_type_id: codeToId.CBC,
        urgency: 'routine',
        status: 'pending',
        order_date: new Date().toISOString(),
      },
      {
        patient_id: mrnToId['MRN-002'],
        doctor_id: doctorId,
        ordered_by_id: adminId,
        test_type_id: codeToId.LIPID,
        urgency: 'urgent',
        status: 'in_progress',
        order_date: new Date().toISOString(),
      },
      {
        patient_id: mrnToId['MRN-003'],
        doctor_id: doctorId,
        ordered_by_id: adminId,
        test_type_id: codeToId.CXR,
        urgency: 'routine',
        status: 'completed',
        order_date: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        patient_id: mrnToId['MRN-005'],
        doctor_id: doctorId,
        ordered_by_id: adminId,
        test_type_id: codeToId.TSH,
        urgency: 'urgent',
        status: 'completed',
        order_date: new Date(Date.now() - 172800000).toISOString(),
      },
    ].filter((r) => r.patient_id && r.test_type_id);

    if (labRows.length) {
      const { error } = await supabase.from('lab_orders').insert(labRows);
      if (error) throw new Error(`Lab order seed failed: ${error.message}`);
    }
  }

  await supabase.auth.signOut();
}

export type DemoSeedResult = {
  message: string;
  accounts: Array<{ email: string; password: string; full_name: string; role: string }>;
};

export async function runDemoSeed(): Promise<DemoSeedResult> {
  if (!hasSupabaseConfig) {
    throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY');
  }

  // Browser-only seed (no edge function — avoids CORS when seed-users isn't deployed).
  const ids: Record<string, string> = {};
  for (const account of DEMO_ACCOUNTS) {
    ids[account.email] = await ensureAuthUser(account);
  }

  await seedClinicData(ids);

  return {
    message: 'Demo accounts and sample clinic data are ready on Supabase',
    accounts: DEMO_ACCOUNTS.map((a) => ({
      email: a.email,
      password: DEMO_PASSWORD,
      full_name: a.full_name,
      role: a.role,
    })),
  };
}
