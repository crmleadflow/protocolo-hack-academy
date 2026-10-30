"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function createCourse(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const isFree = formData.get("isFree") === "on";
  if (!title) throw new Error("Falta el título");

  const courses = await Collections.courses();
  const slug = slugify(title);
  const now = new Date();
  await courses.insertOne({
    slug,
    title,
    description,
    coverImageUrl: null,
    published: false,
    isFree,
    priceOfferId: null,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/admin/cursos");
  redirect(`/admin/cursos/${slug}`);
}

export async function setCoursePublished(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const courseId = String(formData.get("courseId"));
  const published = formData.get("published") === "true";

  const courses = await Collections.courses();
  await courses.updateOne(
    { _id: new ObjectId(courseId) },
    { $set: { published, updatedAt: new Date() } }
  );

  revalidatePath("/admin/cursos");
}

export async function createModule(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const courseId = String(formData.get("courseId"));
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Falta el título del módulo");

  const modules = await Collections.modules();
  const count = await modules.countDocuments({ courseId: new ObjectId(courseId) });
  const now = new Date();
  await modules.insertOne({
    courseId: new ObjectId(courseId),
    title,
    order: count,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath(`/admin/cursos/${formData.get("courseSlug")}`);
}

export async function createLesson(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const courseId = String(formData.get("courseId"));
  const moduleId = String(formData.get("moduleId"));
  const title = String(formData.get("title") || "").trim();
  const videoId = String(formData.get("videoId") || "").trim();
  if (!title || !videoId) throw new Error("Falta el título o el id del video de YouTube");

  const lessons = await Collections.lessons();
  const count = await lessons.countDocuments({ moduleId: new ObjectId(moduleId) });
  const now = new Date();
  await lessons.insertOne({
    courseId: new ObjectId(courseId),
    moduleId: new ObjectId(moduleId),
    title,
    order: count,
    videoProvider: "youtube",
    videoId,
    durationSeconds: null,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath(`/admin/cursos/${formData.get("courseSlug")}`);
}

export async function deleteModule(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const moduleId = String(formData.get("moduleId"));
  const modules = await Collections.modules();
  const lessons = await Collections.lessons();
  await lessons.deleteMany({ moduleId: new ObjectId(moduleId) });
  await modules.deleteOne({ _id: new ObjectId(moduleId) });

  revalidatePath(`/admin/cursos/${formData.get("courseSlug")}`);
}

export async function deleteLesson(formData: FormData) {
  const admin = await requireAdmin();
  if (!admin) throw new Error("No autorizado");

  const lessonId = String(formData.get("lessonId"));
  const lessons = await Collections.lessons();
  await lessons.deleteOne({ _id: new ObjectId(lessonId) });

  revalidatePath(`/admin/cursos/${formData.get("courseSlug")}`);
}
