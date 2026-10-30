import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import type Stripe from "stripe";
import { stripe } from "@/lib/payments/stripe";
import { Collections } from "@/lib/db";
import { findOrCreateMemberByEmail } from "@/lib/members";

export async function POST(request: Request) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await request.text();

  if (!signature || !secret) {
    return NextResponse.json({ error: "Falta la firma o el secreto del webhook" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("[stripe-webhook] firma inválida:", (err as Error).message);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const offerId = session.metadata?.offerId;
  if (!offerId) return;

  const offers = await Collections.offers();
  const offer = await offers.findOne({ _id: new ObjectId(offerId) });
  if (!offer) return;

  const email = session.customer_details?.email;
  if (!email) {
    console.error("[stripe-webhook] checkout sin correo, no se puede inscribir a nadie");
    return;
  }
  const name = session.customer_details?.name || email.split("@")[0];

  const member = await findOrCreateMemberByEmail(email, name);

  const purchases = await Collections.purchases();
  const already = await purchases.findOne({ providerRef: session.id });
  if (already) return; // Stripe puede reenviar el mismo evento más de una vez.

  await purchases.insertOne({
    memberId: member._id,
    offerId: offer._id!,
    provider: "stripe",
    providerRef: session.id,
    status: "paid",
    amountCents: session.amount_total ?? offer.priceCents,
    currency: offer.currency,
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
  // Mentorías: la compra queda registrada en `purchases`; coordinar el
  // horario con el mentor es manual por ahora (ver CLAUDE.md "Pendientes").
}
