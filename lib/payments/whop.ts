// Whop — checkout hospedado (Checkout Configurations API, modo "plan inline").
// Fuente: docs.whop.com (api-reference/checkout-configurations,
// developer/guides/webhooks, developer/api/getting-started) — leído el
// 30/10/2026. Mismo gateway que se agregó al Payment Hub del CRM
// (~/lead-flow-crm, rama feature/whop-payment-gateway), pero reimplementado
// acá porque Protocolo Hack tiene su propio catálogo de ofertas (no son
// planes fijos como en el CRM): en vez de pedirle a Hector que cree un
// "Plan" en Whop por cada curso/mentoría, se manda un "plan inline" armado
// al vuelo con el título y precio de la oferta.
//
// AVISOS (sin confirmar con una llave real todavía):
//   1. `purchase_url` puede venir absoluta o relativa — se cubren los dos casos.
//   2. Para identificar al comprador en el webhook hace falta el correo
//      (`data.user.email`), que la API de Whop devuelve null salvo que la
//      llave tenga el permiso `member:email:read`. Al crear la llave en el
//      dashboard de Whop, hay que marcar ese permiso — si no, no se puede
//      inscribir a nadie automáticamente.
//
// Env vars:
//   WHOP_API_KEY       — whop_xxxxxxxxxxxxxxxxx (Company API Key)
//   WHOP_COMPANY_ID    — biz_xxxxxxxxxxxxxx
//   WHOP_WEBHOOK_SECRET — ws_xxxxxxxxxxxxxxxxx

import crypto from "crypto";

function apiBase(): string {
  return process.env.WHOP_SANDBOX === "true"
    ? "https://sandbox-api.whop.com/api/v1"
    : "https://api.whop.com/api/v1";
}

export function isWhopConfigured(): boolean {
  return !!process.env.WHOP_API_KEY && !!process.env.WHOP_COMPANY_ID;
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
  const companyId = process.env.WHOP_COMPANY_ID;
  if (!companyId) throw new Error("Falta WHOP_COMPANY_ID");

  const data = await whopFetch("/checkout_configurations", {
    method: "POST",
    body: JSON.stringify({
      mode: "payment",
      plan: {
        company_id: companyId,
        currency: params.currency.toLowerCase(),
        initial_price: params.priceCents / 100,
        product: {
          external_identifier: params.offerId,
          title: params.title,
          ...(params.description && { description: params.description }),
        },
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
