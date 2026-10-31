// Wompi (pagos Colombia) — Checkout Widget Web.
// https://docs.wompi.co/docs/colombia/widget-checkout-web/
//
// Wompi tiene DOS secretos distintos en su panel, que no hay que confundir:
//   - WOMPI_INTEGRITY_SECRET: firma el checkout (para que nadie cambie el
//     monto en la URL antes de pagar).
//   - WOMPI_EVENTS_SECRET: firma los eventos del webhook (para confirmar que
//     el aviso de "ya pagó" vino de verdad de Wompi).

import crypto from "crypto";

export function isWompiConfigured(): boolean {
  return !!process.env.WOMPI_PUBLIC_KEY;
}

export function buildWompiIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: "COP" = "COP"
): string | null {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) return null;
  return crypto
    .createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${secret}`)
    .digest("hex");
}

// La compra queda identificada por esta referencia (no se guarda nada en
// Mongo antes de pagar): va "oferta:<id>:<random>" y el webhook la separa
// para saber qué se compró. Wompi la devuelve tal cual en cada evento.
export function buildWompiReference(offerId: string): string {
  return `oferta_${offerId}_${crypto.randomBytes(8).toString("hex")}`;
}

export function parseOfferIdFromWompiReference(reference: string): string | null {
  const match = /^oferta_([a-f0-9]{24})_/.exec(reference);
  return match ? match[1] : null;
}

export function buildWompiCheckoutUrl(params: {
  reference: string;
  amountInCents: number;
  currency?: "COP";
  redirectUrl: string;
}): string {
  const publicKey = process.env.WOMPI_PUBLIC_KEY;
  if (!publicKey) throw new Error("Falta WOMPI_PUBLIC_KEY");

  const currency = params.currency ?? "COP";
  const search = new URLSearchParams({
    "public-key": publicKey,
    currency,
    "amount-in-cents": String(params.amountInCents),
    reference: params.reference,
    "redirect-url": params.redirectUrl,
  });

  const signature = buildWompiIntegritySignature(params.reference, params.amountInCents, currency);
  if (signature) search.set("signature:integrity", signature);

  return `https://checkout.wompi.co/p/?${search.toString()}`;
}

// Valida la firma de un evento de webhook (ver docs.wompi.co/docs/colombia/eventos/).
export function validateWompiWebhookSignature(payload: {
  signature?: { properties?: string[]; checksum?: string };
  timestamp?: number;
  data?: Record<string, unknown>;
}): boolean {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) return false;

  const properties = payload.signature?.properties || [];
  const checksum = payload.signature?.checksum;
  const timestamp = payload.timestamp;
  if (!checksum || !timestamp || properties.length === 0) return false;

  let concatenated = "";
  for (const prop of properties) {
    const value = prop
      .split(".")
      .reduce<unknown>((obj, key) => (obj as Record<string, unknown> | undefined)?.[key], payload.data);
    concatenated += String(value ?? "");
  }
  concatenated += String(timestamp) + secret;

  const expected = crypto.createHash("sha256").update(concatenated).digest("hex");
  if (expected.length !== checksum.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(checksum));
}
