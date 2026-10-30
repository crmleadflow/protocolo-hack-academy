"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/current-member";
import { Collections } from "@/lib/db";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createResource(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const fileUrl = String(formData.get("fileUrl") || "").trim();
  if (!title || !fileUrl) throw new Error("Falta el título o el enlace del archivo");

  const resources = await Collections.resources();
  const now = new Date();
  await resources.insertOne({
    slug: slugify(title),
    title,
    description,
    fileUrl,
    published: true,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/recursos");
  revalidatePath("/recursos");
}

export async function setResourcePublished(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const resourceId = String(formData.get("resourceId"));
  const published = formData.get("published") === "true";

  const resources = await Collections.resources();
  await resources.updateOne(
    { _id: new ObjectId(resourceId) },
    { $set: { published, updatedAt: new Date() } }
  );

  revalidatePath("/admin/recursos");
  revalidatePath("/recursos");
}
