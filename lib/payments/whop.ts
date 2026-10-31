// Whop — checkout hospedado (Checkout Configurations API, "variant inline").
// Probado de verdad el 30/10/2026 con una llave real (cuenta
// "Leadflowneurosophia", biz_a1KWFty4Um4YxD): la documentación pública de
// Whop estaba desactualizada en dos puntos importantes, corregidos acá
// después de probar contra la API real:
//   1. El body NO lleva `plan` (eso da "variant_id is required for payment
//      mode") — lleva `variant: { title, billing_type: "one_time",
//      initial_price, currency }`. No hace falta mandar `company_id`: la
//      cuenta sale sola de la llave.
//   2. `purchase_url` viene ABSOLUTA (ej. "https://whop.com/checkout/ch_.../"),
//      confirmado con una llamada real — igual se cubre el caso relativo por
//      las dudas.
//   3. `redirect_url` tiene que empezar con "https://" — un
//      "http://localhost:3000/..." lo rechaza. En desarrollo local, probar
//      este botón no va a andar hasta que el sitio esté en un dominio https.
//
// Mismo gateway que se agregó al Payment Hub del CRM (~/lead-flow-crm, rama
// feature/whop-payment-gateway), pero reimplementado acá porque Protocolo
// Hack tiene su propio catálogo de ofertas (no son planes fijos como en el
// CRM): en vez de pedirle a Hector que cree un "Plan" en Whop por cada
// curso/mentoría, se manda una variante armada al vuelo con el título y
// precio de la oferta.
//
// AVISO sin confirmar todavía: para identificar al comprador en el webhook
// hace falta su correo (`data.user.email`), que la API de Whop devuelve null
// salvo que la llave tenga el permiso `member:email:read`. La llave actual
// se creó con el rol "Propietario" (todos los permisos), así que debería
// venir — falta un pago real de prueba para confirmarlo.
//
// Env vars:
//   WHOP_API_KEY        — apik_xxxxxxxxxxxxxxxxx (Company API Key)
//   WHOP_COMPANY_ID      — biz_xxxxxxxxxxxxxx (solo como referencia, no se
//                          manda en el checkout)
//   WHOP_WEBHOOK_SECRET  — ws_xxxxxxxxxxxxxxxxx

import crypto from "crypto";

function apiBase(): string {
  return process.env.WHOP_SANDBOX === "true"
    ? "https://sandbox-api.whop.com/api/v1"
    : "https://api.whop.com/api/v1";
}

export function isWhopConfigured(): boolean {
  // El prefijo real de las llaves que genera el dashboard de Whop es
  // "apik_" (la documentación pública mostraba "whop_", desactualizada).
  // WHOP_COMPANY_ID no hace falta para el checkout (la cuenta sale de la
  // llave) — queda como dato de referencia, no se exige acá.
  return !!process.env.WHOP_API_KEY && process.env.WHOP_API_KEY.startsWith("apik_");
}

async function whopFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${apiBase()}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error?.message || json?.message || `Whop API error ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

export async function createWhopCheckout(params: {
  offerId: string;
  title: string;
  description?: string;
  priceCents: number;
  currency: "USD" | "COP";
  successUrl: string;
}): Promise<{ url: string; checkoutConfigurationId?: string }> {
  const data = await whopFetch("/checkout_configurations", {
    method: "POST",
    body: JSON.stringify({
      mode: "payment",
      variant: {
        title: params.title,
        billing_type: "one_time",
        initial_price: params.priceCents / 100,
        currency: params.currency.toLowerCase(),
      },
      metadata: { offer_id: params.offerId },
      redirect_url: params.successUrl,
    }),
  });

  const rawUrl: string | undefined = data?.purchase_url;
  if (!rawUrl) throw new Error("Whop no retornó purchase_url");
  const url = rawUrl.startsWith("http") ? rawUrl : `https://whop.com${rawUrl}`;

  return { url, checkoutConfigurationId: data?.id };
}

// Firma "Standard Webhooks" con la variante de Whop: la llave es el
// WHOP_WEBHOOK_SECRET tal cual (sin sacarle el prefijo `ws_` ni decodificarlo
// de base64 — así lo documenta Whop para quien no usa su SDK).
export function verifyWhopWebhookSignature(
  webhookId: string,
  webhookTimestamp: string,
  rawBody: string,
  signatureHeader: string
): boolean {
  const secret = process.env.WHOP_WEBHOOK_SECRET;
  if (!secret) return false;

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedContent).digest("base64");

  return signatureHeader.split(" ").some((parte) => {
    const [version, valor] = parte.split(",");
    if (version !== "v1" || !valor) return false;
    try {
      const a = Buffer.from(expected);
      const b = Buffer.from(valor);
      if (a.length !== b.length) return false;
      return crypto.timingSafeEqual(a, b);
    } catch {
      return false;
    }
  });
}
