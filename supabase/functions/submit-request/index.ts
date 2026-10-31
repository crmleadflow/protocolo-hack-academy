import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Body = z.object({
  request_type: z.enum(["conferencia", "mentoria", "leadflow", "recurso", "evento", "contacto", "seminario", "capacitacion", "bootcamp"]),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(40).optional().nullable(),
  company: z.string().trim().max(120).optional().nullable(),
  message: z.string().trim().max(2000).optional().nullable(),
  page_url: z.string().max(500).optional().nullable(),
  utm: z.object({
    utm_source: z.string().max(200).optional(),
    utm_medium: z.string().max(200).optional(),
    utm_campaign: z.string().max(200).optional(),
    utm_content: z.string().max(200).optional(),
  }).partial().optional(),
});

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const b = parsed.data;

    let userId: string | null = null;
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (token) {
      const { data } = await admin.auth.getUser(token);
      userId = data.user?.id ?? null;
    }

    const { data: reqRow, error: rErr } = await admin.from("commercial_requests").insert({
      request_type: b.request_type, name: b.name, email: b.email, phone: b.phone || null,
      company: b.company || null, message: b.message || null,
      source_page: b.page_url ? new URL(b.page_url).pathname : null, user_id: userId,
    }).select("id").single();
    if (rErr) return json({ error: "No se pudo guardar" }, 500);

    const utm = b.utm ?? {};
    const { data: intent } = await admin.from("intent_events").insert({
      event_type: `request_${b.request_type}`, request_id: reqRow.id, user_id: userId, page_url: b.page_url ?? null, utm,
    }).select("id").single();

    // RULE: never send phone to Lead Flow (it triggers an unauthorized WhatsApp). Only name + email + context.
    const payload: Record<string, string> = { name: b.name, email: b.email, source: `protocolo-hack:${b.request_type}` };
    if (b.page_url) payload.page_url = b.page_url;
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const) if (utm[k]) payload[k] = utm[k]!;

    const { data: outbox } = await admin.from("crm_outbox").insert({ intent_event_id: intent?.id ?? null, payload }).select("id").single();

    // Delivery only if the CRM base URL and token are configured; otherwise stays pending.
    const base = Deno.env.get("LEADFLOW_CRM_URL");
    const tok = Deno.env.get("LEADFLOW_WEBHOOK_TOKEN");
    if (base && tok && outbox) {
      try {
        const res = await fetch(`${base.replace(/\/$/, "")}/api/webhooks/lead/${encodeURIComponent(tok)}`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
        });
        const txt = await res.text();
        await admin.from("crm_outbox").update(res.ok
          ? { status: "sent", sent_at: new Date().toISOString(), attempts: 1 }
          : { status: "failed", attempts: 1, last_error: `[${res.status}] ${txt.slice(0, 500)}` }).eq("id", outbox.id);
      } catch (e) {
        await admin.from("crm_outbox").update({ status: "failed", attempts: 1, last_error: String(e).slice(0, 500) }).eq("id", outbox.id);
      }
    }
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "Error interno" }, 500);
  }
});
