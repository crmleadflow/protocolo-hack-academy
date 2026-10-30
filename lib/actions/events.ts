"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, getCurrentMember } from "@/lib/current-member";
import { Collections } from "@/lib/db";
import type { EventKind } from "@/types/models";

export async function createEvent(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const kind = String(formData.get("kind")) as EventKind;
  const startsAtRaw = String(formData.get("startsAt") || "");
  const zoomUrl = String(formData.get("zoomUrl") || "").trim();

  if (!title || !startsAtRaw || !zoomUrl) throw new Error("Faltan campos obligatorios");

  const events = await Collections.events();
  const now = new Date();
  await events.insertOne({
    title,
    description,
    kind,
    startsAt: new Date(startsAtRaw),
    zoomUrl,
    published: true,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
}

export async function registerForEvent(formData: FormData) {
  const eventId = String(formData.get("eventId"));
  const member = await getCurrentMember();
  if (!member) {
    redirect(`/login?callbackUrl=/eventos/${eventId}`);
  }

  const registrations = await Collections.eventRegistrations();
  await registrations.updateOne(
    { eventId: new ObjectId(eventId), memberId: member._id },
    {
      $setOnInsert: {
        eventId: new ObjectId(eventId),
        memberId: member._id,
        createdAt: new Date(),
      },
    },
    { upsert: true }
  );

  revalidatePath(`/eventos/${eventId}`);
}
