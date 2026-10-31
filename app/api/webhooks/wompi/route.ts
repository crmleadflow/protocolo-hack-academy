import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { Collections } from "@/lib/db";
import { findOrCreateMemberByEmail } from "@/lib/members";
import { parseOfferIdFromWompiReference, validateWompiWebhookSignature } from "@/lib/payments/wompi";

// https://docs.wompi.co/docs/colombia/eventos/
export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!payload) {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!validateWompiWebhookSignature(payload)) {
    console.error("[wompi-webhook] firma inválida, evento descartado");
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const transaction = payload?.data?.transaction;
  if (!transaction || transaction.status !== "APPROVED") {
    // Pendiente, declinado, etc.: no hay nada que activar todavía.
    return NextResponse.json({ received: true });
  }

  const reference: string = transaction.reference;
  const offerId = parseOfferIdFromWompiReference(reference);
  if (!offerId) {
    console.error("[wompi-webhook] referencia sin oferta reconocible:", reference);
    return NextResponse.json({ received: true });
  }

  const offers = await Collections.offers();
  const offer = await offers.findOne({ _id: new ObjectId(offerId) });
  if (!offer) {
    console.error("[wompi-webhook] oferta no encontrada:", offerId);
    return NextResponse.json({ received: true });
  }

  const email: string | undefined = transaction.customer_email;
  if (!email) {
    console.error("[wompi-webhook] transacción aprobada sin correo, no se puede inscribir a nadie");
    return NextResponse.json({ received: true });
  }

  const member = await findOrCreateMemberByEmail(email, email.split("@")[0]);

  const purchases = await Collections.purchases();
  const already = await purchases.findOne({ providerRef: transaction.id });
  if (already) return NextResponse.json({ received: true }); // Wompi puede reenviar el mismo evento.

  await purchases.insertOne({
    memberId: member._id,
    offerId: offer._id!,
    provider: "wompi",
    providerRef: transaction.id,
    status: "paid",
    amountCents: transaction.amount_in_cents ?? offer.priceCents,
    currency: "COP",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  if (offer.kind === "course" && offer.refId) {
    const enrollments = await Collections.enrollments();
    await enrollments.updateOne(
      { memberId: member._id, courseId: offer.refId },
      {
        $setOnInsert: {
          memberId: member._id,
          courseId: offer.refId,
          source: "offer",
          offerId: offer._id,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );
  }

  return NextResponse.json({ received: true });
}
