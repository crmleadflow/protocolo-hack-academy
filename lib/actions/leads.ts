"use server";

import { ObjectId } from "mongodb";
import { redirect } from "next/navigation";
import { Collections } from "@/lib/db";
import { findOrCreateMemberByEmail } from "@/lib/members";
import { registerIntentAndQueue } from "@/lib/crm/bridge";

// Formulario de "dejá tus datos para descargar" en /recursos/[slug].
// Esto es lo que, en el encargo original, se deja "simple y extensible": el
// mecanismo de pedir datos a cambio de valor es este formulario.
export async function requestResource(formData: FormData) {
  const resourceSlug = String(formData.get("resourceSlug"));
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!name || !email) throw new Error("Faltan nombre o correo");

  const resourcesCol = await Collections.resources();
  const resource = await resourcesCol.findOne({ slug: resourceSlug, published: true });
  if (!resource) throw new Error("Recurso no encontrado");

  const member = await findOrCreateMemberByEmail(email, name, phone || null);
  await registerIntentAndQueue(member, "resource_request", {
    resourceId: resource._id,
    metadata: { resourceSlug },
  });

  redirect(resource.fileUrl);
}

// Click en una oferta del marketplace que no tiene checkout propio (plugin,
// plan de Lead Flow, charla/conferencia): se registra la intención y se
// manda al CRM como lead para que Hector lo cierre a mano.
export async function requestOfferInfo(formData: FormData) {
  const offerId = String(formData.get("offerId"));
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!name || !email) throw new Error("Faltan nombre o correo");

  const offersCol = await Collections.offers();
  const offer = await offersCol.findOne({ _id: new ObjectId(offerId), active: true });
  if (!offer) throw new Error("Oferta no encontrada");

  const member = await findOrCreateMemberByEmail(email, name, phone || null);
  await registerIntentAndQueue(member, "offer_click", {
    offerId: offer._id,
    metadata: { offerKind: offer.kind, offerTitle: offer.title },
  });

  redirect(`/marketplace/gracias?oferta=${encodeURIComponent(offer.title)}`);
}
