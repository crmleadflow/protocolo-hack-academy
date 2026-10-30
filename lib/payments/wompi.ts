// Wompi (pagos Colombia) — integración ARMADA PERO INCOMPLETA a propósito.
// Pendiente (ver CLAUDE.md "Pendientes"):
//   1. Generar la firma de integridad (WOMPI_EVENTS_SECRET) para el widget
//      de checkout: https://docs.wompi.co/docs/colombia/widget-checkout-web/
//   2. Armar el endpoint de eventos (POST /api/webhooks/wompi) que valide la
//      firma y marque la compra como pagada, igual que hace
//      app/api/webhooks/stripe/route.ts con Stripe.
//   3. Decidir con Hector si Wompi se ofrece solo a compradores con tarjeta
//      colombiana (detección por geolocalización/IP) o como opción manual.
//
// Por ahora /marketplace y /api/checkout/stripe solo usan Stripe. Este
// archivo existe para que el que retome esto no tenga que armar la
// integración desde cero.

import crypto from "crypto";

export interface WompiCheckoutParams {
  reference: string;
  amountInCents: number;
  currency: "COP";
  redirectUrl: string;
}

export function buildWompiIntegritySignature(params: WompiCheckoutParams): string | null {
  const secret = process.env.WOMPI_EVENTS_SECRET;
  if (!secret) return null;

  const raw = `${params.reference}${params.amountInCents}${params.currency}${secret}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}
