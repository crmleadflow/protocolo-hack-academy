"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentMember, requireAdmin } from "@/lib/current-member";
import { Collections } from "@/lib/db";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createSpace(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!title) throw new Error("Falta el título");

  const spaces = await Collections.spaces();
  const count = await spaces.countDocuments();
  await spaces.insertOne({
    slug: slugify(title),
    title,
    description,
    order: count,
    createdAt: new Date(),
  });

  revalidatePath("/comunidad");
}

export async function createThread(formData: FormData) {
  const member = await getCurrentMember();
  const spaceSlug = String(formData.get("spaceSlug"));
  if (!member) redirect(`/login?callbackUrl=/comunidad/${spaceSlug}`);

  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const spaceId = String(formData.get("spaceId"));
  if (!title || !body) throw new Error("Faltan título o contenido");

  const threads = await Collections.threads();
  const now = new Date();
  await threads.insertOne({
    spaceId: new ObjectId(spaceId),
    memberId: member._id,
    title,
    body,
    pinned: false,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath(`/comunidad/${spaceSlug}`);
}

export async function createReply(formData: FormData) {
  const member = await getCurrentMember();
  const spaceSlug = String(formData.get("spaceSlug"));
  const threadId = String(formData.get("threadId"));
  if (!member) redirect(`/login?callbackUrl=/comunidad/${spaceSlug}/${threadId}`);

  const body = String(formData.get("body") || "").trim();
  if (!body) throw new Error("Falta el contenido");

  const replies = await Collections.replies();
  await replies.insertOne({
    threadId: new ObjectId(threadId),
    memberId: member._id,
    body,
    createdAt: new Date(),
  });

  revalidatePath(`/comunidad/${spaceSlug}/${threadId}`);
}
