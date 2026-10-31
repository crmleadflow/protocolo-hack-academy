import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { Collections } from "@/lib/db";
import { findOrCreateMemberByEmail } from "@/lib/members";
import { verifyWhopWebhookSignature } from "@/lib/payments/whop";

const TOLERANCIA_SEGUNDOS = 300;

export async function POST(request: Request) {
  const webhookId = request.headers.get("webhook-id");
  const webhookTimestamp = request.headers.get("webhook-timestamp");
  const webhookSignature = request.headers.get("webhook-signature");
  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return new NextResponse(null, { status: 400 });
  }

  const ahoraSegundos = Math.floor(Date.now() / 1000);
  if (Math.abs(ahoraSegundos - parseInt(webhookTimestamp, 10)) > TOLERANCIA_SEGUNDOS) {
    console.warn("[whop-webhook] timestamp fuera de tolerancia");
    return new NextResponse(null, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyWhopWebhookSignature(webhookId, webhookTimestamp, rawBody, webhookSignature)) {
    console.error("[whop-webhook] firma inválida, evento descartado");
    return new NextResponse(null, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  if (event.type !== "payment.succeeded") {
    return NextResponse.json({ received: true });
  }

  const payment = event.data ?? {};
  const offerId: string | undefined = payment?.metadata?.offer_id;
  if (!offerId) {
    console.error("[whop-webhook] pago sin offer_id en metadata");
    return NextResponse.json({ received: true });
  }

  const offers = await Collections.offers();
  const offer = await offers.findOne({ _id: new ObjectId(offerId) });
  if (!offer) {
    console.error("[whop-webhook] oferta no encontrada:", offerId);
    return NextResponse.json({ received: true });
  }

  // La llave de Whop necesita el permiso `member:email:read` para que esto
  // venga con valor — ver aviso en lib/payments/whop.ts.
  const email: string | undefined = payment?.user?.email;
  if (!email) {
    console.error(
      "[whop-webhook] pago aprobado sin correo del comprador (falta el permiso member:email:read en la llave de Whop)"
    );
    return NextResponse.json({ received: true });
  }

  const member = await findOrCreateMemberByEmail(email, payment?.user?.name || email.split("@")[0]);

  const purchases = await Collections.purchases();
  const already = await purchases.findOne({ providerRef: String(payment.id) });
  if (already) return NextResponse.json({ received: true });

  await purchases.insertOne({
    memberId: member._id,
    offerId: offer._id!,
    provider: "whop",
    providerRef: String(payment.id),
    status: "paid",
    amountCents: Math.round((payment.settlement_amount ?? payment.total ?? offer.priceCents / 100) * 100),
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

  return NextResponse.json({ received: true });
}
