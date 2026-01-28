import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const allowedCurrencies = new Set(["USD", "EUR", "MXN"]);

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json(401, { error: "Unauthorized" });
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabaseAuth.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      return json(401, { error: "Invalid token" });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role
    const { data: isAdmin, error: roleError } = await supabaseAuth.rpc(
      "has_role",
      {
        _user_id: userId,
        _role: "admin",
      }
    );

    if (roleError) {
      console.error("Role check error:", roleError);
      return json(500, { error: "Role check failed" });
    }

    if (!isAdmin) {
      return json(403, { error: "Forbidden" });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json(400, { error: "Invalid JSON body" });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const thumbnailUrl =
      typeof body.thumbnail_url === "string" ? body.thumbnail_url.trim() : "";
    const currency =
      typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "USD";
    const isPublished = Boolean((body as Record<string, unknown>).is_published);

    const priceRaw = (body as Record<string, unknown>).price;
    const price = typeof priceRaw === "number" ? priceRaw : Number(priceRaw);

    // Server-side validation
    if (!title || title.length > 120) {
      return json(400, { error: "Título inválido" });
    }
    if (description.length > 5000) {
      return json(400, { error: "Descripción demasiado larga" });
    }
    if (!Number.isFinite(price) || price < 0 || price > 1000000) {
      return json(400, { error: "Precio inválido" });
    }
    if (!allowedCurrencies.has(currency)) {
      return json(400, { error: "Moneda inválida" });
    }
    if (thumbnailUrl.length > 2048) {
      return json(400, { error: "URL de imagen inválida" });
    }

    // Use service role for DB write (RLS bypass), gated by the admin role check above.
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: program, error: insertError } = await supabase
      .from("programs")
      .insert({
        title,
        description: description || null,
        price,
        currency,
        thumbnail_url: thumbnailUrl || null,
        is_published: isPublished,
        created_by: userId,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Insert program error:", insertError);
      return json(400, { error: "No se pudo crear el programa" });
    }

    return json(200, program);
  } catch (error: unknown) {
    console.error("Error in admin-create-program:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return json(500, { error: message });
  }
});
