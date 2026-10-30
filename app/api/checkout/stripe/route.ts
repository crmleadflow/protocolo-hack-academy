import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { stripe } from "@/lib/payments/stripe";
import { Collections } from "@/lib/db";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.redirect(
      new URL("/marketplace?error=stripe_no_configurado", request.url),
      303
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let offerId = "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    offerId = String(body.offerId || "");
  } else {
    const formData = await request.formData();
    offerId = String(formData.get("offerId") || "");
  }

  if (!offerId) {
    return NextResponse.json({ error: "Falta offerId" }, { status: 400 });
  }

  const offers = await Collections.offers();
  const offer = await offers.findOne({ _id: new ObjectId(offerId), active: true });
  if (!offer) {
    return NextResponse.json({ error: "Oferta no encontrada" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: offer.currency.toLowerCase(),
          product_data: {
            name: offer.title,
            description: offer.description || undefined,
          },
          unit_amount: offer.priceCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/checkout/exito?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/marketplace`,
    metadata: { offerId: String(offer._id), offerKind: offer.kind },
  });

  if (!session.url) {
    return NextResponse.json({ error: "No se pudo crear el checkout" }, { status: 500 });
  }

  return NextResponse.redirect(session.url, 303);
}
