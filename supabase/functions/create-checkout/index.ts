import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

// Prices are ALWAYS read from the database here; the browser only sends product ids.
const Body = z.object({
  items: z.array(z.object({ type: z.enum(["program", "tool"]), id: z.string().uuid() })).min(1).max(20),
});

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Inicia sesión para pagar" }, 401);
    const { data: u } = await admin.auth.getUser(token);
    if (!u.user) return json({ error: "Inicia sesión para pagar" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const unique = [...new Map(parsed.data.items.map((i) => [`${i.type}:${i.id}`, i])).values()];

    const progIds = unique.filter((i) => i.type === "program").map((i) => i.id);
    const toolIds = unique.filter((i) => i.type === "tool").map((i) => i.id);
    const [{ data: progs }, { data: tools }] = await Promise.all([
      progIds.length ? admin.from("programs").select("id,title,price,currency,visibility_status").in("id", progIds) : Promise.resolve({ data: [] }),
      toolIds.length ? admin.from("tools").select("id,title,price_monthly,currency,visibility_status").in("id", toolIds) : Promise.resolve({ data: [] }),
    ]);
    const lines = [
      ...(progs ?? []).filter((p: any) => p.visibility_status === "published").map((p: any) => ({ product_type: "program", product_id: p.id, title: p.title, unit_amount: Number(p.price), currency: p.currency })),
      ...(tools ?? []).filter((t: any) => t.visibility_status === "published").map((t: any) => ({ product_type: "tool", product_id: t.id, title: t.title, unit_amount: Number(t.price_monthly), currency: t.currency })),
    ];
    if (lines.length !== unique.length) return json({ error: "Algún producto ya no está disponible" }, 400);
    const total = lines.reduce((s, l) => s + l.unit_amount, 0);

    const STRIPE_READY = false; // Stripe activation pending (setup failed: seller country not supported)
    if (!STRIPE_READY) {
      return json({ error: "pagos_pendientes", message: "El pago con tarjeta todavía no está activado.", total, currency: lines[0].currency }, 503);
    }

    const { data: order } = await admin.from("orders").insert({ user_id: u.user.id, total_amount: total, currency: lines[0].currency, provider: "stripe" }).select("id").single();
    await admin.from("order_items").insert(lines.map(({ currency: _c, ...l }) => ({ ...l, order_id: order!.id })));
    return json({ order_id: order!.id });
  } catch (e) {
    console.error(e);
    return json({ error: "Error interno" }, 500);
  }
});
