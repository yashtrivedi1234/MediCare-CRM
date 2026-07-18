import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const DEMO_PASSWORD = "password";

const DEMO_ACCOUNTS = [
  { email: "admin@clinic.com", full_name: "Clinic Admin", role: "admin", phone: "+91-9999999999" },
  { email: "doctor@clinic.com", full_name: "Dr. Ananya Mehta", role: "doctor", phone: "+91-9876500001" },
  { email: "nurse@clinic.com", full_name: "Priya Nair", role: "nurse", phone: "+91-9876500002" },
  { email: "reception@clinic.com", full_name: "Rohit Sharma", role: "receptionist", phone: "+91-9876500003" },
  { email: "lab@clinic.com", full_name: "Kavita Desai", role: "lab_staff", phone: "+91-9876500004" },
  { email: "patient@clinic.com", full_name: "Aarav Patel", role: "patient", phone: "+91-9998887770" },
];

async function ensureAuthUser(
  supabaseUrl: string,
  serviceKey: string,
  account: (typeof DEMO_ACCOUNTS)[number]
) {
  const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: account.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { role: account.role, full_name: account.full_name },
    }),
  });

  const createData = await createRes.json();
  if (createRes.ok && createData.user?.id) return createData.user.id as string;

  // Already exists — list and find by email
  const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=200`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  const listData = await listRes.json();
  const found = (listData.users || []).find(
    (u: { email?: string }) => u.email?.toLowerCase() === account.email.toLowerCase()
  );
  if (!found?.id) {
    throw new Error(`Could not create/find ${account.email}: ${JSON.stringify(createData)}`);
  }
  return found.id as string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !serviceKey) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");

    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    };

    const ids: Record<string, string> = {};
    for (const account of DEMO_ACCOUNTS) {
      const id = await ensureAuthUser(supabaseUrl, serviceKey, account);
      ids[account.email] = id;
      await fetch(`${supabaseUrl}/rest/v1/users`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id,
          email: account.email,
          full_name: account.full_name,
          phone: account.phone,
          role: account.role,
          is_active: true,
        }),
      });
    }

    return new Response(
      JSON.stringify({
        message: "Demo accounts ready (use browser seed fallback for sample clinic rows if needed)",
        password: DEMO_PASSWORD,
        accounts: DEMO_ACCOUNTS.map((a) => ({
          email: a.email,
          password: DEMO_PASSWORD,
          full_name: a.full_name,
          role: a.role,
        })),
        ids,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
