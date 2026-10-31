import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { Collections } from "@/lib/db";
import { buildWompiCheckoutUrl, buildWompiReference, isWompiConfigured } from "@/lib/payments/wompi";

export async function POST(request: Request) {
  if (!isWompiConfigured()) {
    return NextResponse.redirect(new URL("/marketplace?error=wompi_no_configurado", request.url), 303);
  }

  const formData = await request.formData();
  const offerId = String(formData.get("offerId") || "");
  if (!offerId) {
    return NextResponse.json({ error: "Falta offerId" }, { status: 400 });
  }

  const offers = await Collections.offers();
  const offer = await offers.findOne({ _id: new ObjectId(offerId), active: true });
  if (!offer) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }
  if (offer.currency !== "COP") {
    // Wompi solo cobra en pesos colombianos — las ofertas en USD van por Stripe.
    return NextResponse.json(
      { error: "Esta oferta no está en pesos colombianos. Usá el otro botón de pago." },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const reference = buildWompiReference(offerId);

  const url = buildWompiCheckoutUrl({
    reference,
    amountInCents: offer.priceCents,
    currency: "COP",
    redirectUrl: `${baseUrl}/checkout/exito`,
  });

  return NextResponse.redirect(url, 303);
}
