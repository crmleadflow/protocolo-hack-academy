"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, getCurrentMember } from "@/lib/current-member";
import { Collections } from "@/lib/db";

export async function createMentorshipProgram(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title) throw new Error("Falta el título");

  const programs = await Collections.mentorshipPrograms();
  const now = new Date();
  await programs.insertOne({
    title,
    description,
    mentorMemberId: admin._id,
    offerId: null,
    published: true,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/mentorias");
  revalidatePath("/mentorias");
}

export async function createMentorshipSlot(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const programId = String(formData.get("programId"));
  const startsAtRaw = String(formData.get("startsAt") || "");
  const durationMinutes = parseInt(String(formData.get("durationMinutes") || "30"), 10);
  if (!startsAtRaw) throw new Error("Falta la fecha y hora");

  const slots = await Collections.mentorshipSlots();
  await slots.insertOne({
    programId: new ObjectId(programId),
    startsAt: new Date(startsAtRaw),
    durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 30,
    booked: false,
    createdAt: new Date(),
  });

  revalidatePath("/admin/mentorias");
  revalidatePath("/mentorias");
}

export async function deleteMentorshipSlot(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const slotId = String(formData.get("slotId"));
  const slots = await Collections.mentorshipSlots();
  await slots.deleteOne({ _id: new ObjectId(slotId), booked: false });

  revalidatePath("/admin/mentorias");
  revalidatePath("/mentorias");
}

export async function bookMentorshipSlot(formData: FormData) {
  const slotId = String(formData.get("slotId"));
  const programId = String(formData.get("programId"));
  const member = await getCurrentMember();
  if (!member) {
    redirect(`/login?callbackUrl=/mentorias`);
  }

  const slots = await Collections.mentorshipSlots();
  const slot = await slots.findOne({ _id: new ObjectId(slotId) });
  if (!slot || slot.booked) {
    throw new Error("Ese horario ya no está disponible");
  }

  const bookings = await Collections.mentorshipBookings();
  const marked = await slots.updateOne(
    { _id: slot._id, booked: false },
    { $set: { booked: true } }
  );
  if (marked.modifiedCount === 0) {
    throw new Error("Ese horario ya no está disponible");
  }

  await bookings.insertOne({
    programId: new ObjectId(programId),
    slotId: slot._id!,
    memberId: member._id,
    createdAt: new Date(),
  });

  revalidatePath("/mentorias");
  revalidatePath("/cuenta");
}
