import { createClient } from "npm:@supabase/supabase-js@2";

// Orders are marked paid ONLY here, after verifying Whop's signature and re-reading the payment from Whop's API.
const enc = new TextEncoder();

async function hmac(keyBytes: Uint8Array, msg: string) {
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
  return btoa(String.fromCharCode(...sig));
}
function safeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
function b64decode(s: string) {
  try { return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)); } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method", { status: 405 });
  const secret = Deno.env.get("WHOP_WEBHOOK_SECRET");
  const apiKey = Deno.env.get("WHOP_API_KEY");
  if (!secret || !apiKey) return new Response("not configured", { status: 503 });

  const id = req.headers.get("webhook-id") ?? "";
  const ts = req.headers.get("webhook-timestamp") ?? "";
  const sigHeader = req.headers.get("webhook-signature") ?? "";
  const raw = await req.text();
  if (!id || !ts || Math.abs(Date.now() / 1000 - Number(ts)) > 300) return new Response("bad timestamp", { status: 400 });

  const signed = `${id}.${ts}.${raw}`;
  const candidates: Uint8Array[] = [enc.encode(secret)];
  const stripped = secret.replace(/^(ws_|whsec_)/, "");
  const dec = b64decode(stripped);
  if (dec) candidates.push(dec);
  const expected = await Promise.all(candidates.map((k) => hmac(k, signed)));
  const provided = sigHeader.split(" ").map((p) => p.split(",")[1]).filter(Boolean);
  if (!provided.some((p) => expected.some((e) => safeEq(p, e)))) return new Response("bad signature", { status: 401 });

  const event = JSON.parse(raw);
  if (event.type !== "payment.succeeded") return new Response("ignored", { status: 200 });

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const paymentId = event.data?.id;
  // Confirm with Whop directly; never trust the payload alone.
  const pr = await fetch(`https://api.whop.com/api/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!pr.ok) {
    console.error(`Whop payment lookup failed [${pr.status}]: ${await pr.text()}`);
    return new Response("lookup failed", { status: 502 });
  }
  const payment = await pr.json();
  const orderId = payment.metadata?.order_id ?? event.data?.metadata?.order_id;
  if (!orderId || !["paid", "succeeded"].includes(String(payment.status))) return new Response("not paid", { status: 200 });

  const { data: order } = await admin.from("orders").select("id,user_id,status,total_amount").eq("id", orderId).maybeSingle();
  if (!order) return new Response("unknown order", { status: 200 });
  if (order.status === "paid") return new Response("duplicate", { status: 200 });

  const paidAmount = Number(payment.total ?? payment.subtotal ?? payment.final_amount ?? NaN);
  if (!Number.isNaN(paidAmount) && paidAmount + 0.01 < Number(order.total_amount)) {
    console.error(`Amount mismatch for ${orderId}: paid ${paidAmount}, expected ${order.total_amount}`);
    return new Response("amount mismatch", { status: 200 });
  }

  await admin.from("orders").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", orderId).eq("status", "pending");
  await admin.from("payments").insert({
    user_id: order.user_id, order_id: orderId, provider: "whop", provider_reference: paymentId,
    amount: order.total_amount, currency: "USD", status: "completed", payment_data: { webhook_id: id },
  });
  const { data: items } = await admin.from("order_items").select("product_type,product_id").eq("order_id", orderId);
  for (const it of items ?? []) {
    await admin.from("entitlements").upsert({ user_id: order.user_id, product_type: it.product_type, product_id: it.product_id, order_id: orderId, status: "active" }, { onConflict: "user_id,product_type,product_id" });
    if (it.product_type === "program") {
      const { data: ex } = await admin.from("enrollments").select("id").eq("user_id", order.user_id).eq("program_id", it.product_id).maybeSingle();
      if (ex) await admin.from("enrollments").update({ status: "active" }).eq("id", ex.id);
      else await admin.from("enrollments").insert({ user_id: order.user_id, program_id: it.product_id, status: "active", enrolled_at: new Date().toISOString() });
    }
  }
  return new Response("ok", { status: 200 });
});
