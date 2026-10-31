import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { Collections } from "@/lib/db";
import { createWhopCheckout, isWhopConfigured } from "@/lib/payments/whop";

export async function POST(request: Request) {
  if (!isWhopConfigured()) {
    return NextResponse.redirect(new URL("/marketplace?error=whop_no_configurado", request.url), 303);
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

  try {
    const { url } = await createWhopCheckout({
      offerId: String(offer._id),
      title: offer.title,
      description: offer.description,
      priceCents: offer.priceCents,
      currency: offer.currency,
      successUrl: `${baseUrl}/checkout/exito`,
    });
    return NextResponse.redirect(url, 303);
  } catch (err) {
    console.error("[checkout/whop] error:", (err as Error).message);
    return NextResponse.redirect(new URL("/marketplace?error=whop_checkout_fallo", request.url), 303);
  }
}
