"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/current-member";
import { Collections } from "@/lib/db";
import type { OfferCurrency, OfferKind } from "@/types/models";

export async function createOffer(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const kind = String(formData.get("kind")) as OfferKind;
  const currency = String(formData.get("currency")) as OfferCurrency;
  const refIdRaw = String(formData.get("refId") || "").trim();
  const priceRaw = String(formData.get("price") || "0").trim();

  if (!title) throw new Error("Falta el título");

  // El precio se ingresa en unidades normales (ej. 49.90) y se guarda en
  // centavos, como lo esperan Stripe y Wompi.
  const priceCents = Math.round(parseFloat(priceRaw.replace(",", ".")) * 100);
  if (!Number.isFinite(priceCents) || priceCents < 0) throw new Error("Precio inválido");

  const offers = await Collections.offers();
  const now = new Date();
  await offers.insertOne({
    title,
    description,
    kind,
    refId: refIdRaw ? new ObjectId(refIdRaw) : null,
    priceCents,
    currency,
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/ofertas");
  revalidatePath("/marketplace");
}

export async function setOfferActive(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const offerId = String(formData.get("offerId"));
  const active = formData.get("active") === "true";

  const offers = await Collections.offers();
  await offers.updateOne(
    { _id: new ObjectId(offerId) },
    { $set: { active, updatedAt: new Date() } }
  );

  revalidatePath("/admin/ofertas");
  revalidatePath("/marketplace");
}
