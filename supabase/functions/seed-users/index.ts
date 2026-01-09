import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error("Missing environment variables");
    }

    const authResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "apikey": supabaseServiceRoleKey,
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@clinic.com",
        password: "password",
        email_confirm: true,
        user_metadata: { role: "admin" },
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok && authResponse.status !== 422) {
      throw new Error(`Auth creation failed: ${JSON.stringify(authData)}`);
    }

    let userId = authData.user?.id;

    if (!userId && authResponse.status === 422) {
      const existingUserResponse = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?email=admin@clinic.com`,
        {
          headers: {
            "apikey": supabaseServiceRoleKey,
            "Authorization": `Bearer ${supabaseServiceRoleKey}`,
          },
        }
      );

      const existingUsers = await existingUserResponse.json();
      if (existingUsers.users && existingUsers.users.length > 0) {
        userId = existingUsers.users[0].id;
      }
    }

    if (!userId) {
      throw new Error("Could not create or find user");
    }

    const dbResponse = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: "POST",
      headers: {
        "apikey": supabaseServiceRoleKey,
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id: userId,
        email: "admin@clinic.com",
        full_name: "Admin User",
        phone: "+91-9999999999",
        role: "admin",
        is_active: true,
      }),
    });

    if (!dbResponse.ok && dbResponse.status !== 409) {
      const error = await dbResponse.text();
      console.error("DB error:", error);
    }

    return new Response(
      JSON.stringify({
        message: "Seed user created successfully",
        userId: userId,
        email: "admin@clinic.com",
        password: "password",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
