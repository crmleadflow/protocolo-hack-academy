"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { Collections } from "@/lib/db";

export async function enrollInFreeCourse(formData: FormData) {
  const member = await getCurrentMember();
  const courseSlug = String(formData.get("courseSlug"));
  if (!member) {
    redirect(`/login?callbackUrl=/academia/${courseSlug}`);
  }

  const courses = await Collections.courses();
  const course = await courses.findOne({ slug: courseSlug });
  if (!course || !course.isFree) throw new Error("Este curso no es gratis");

  const enrollments = await Collections.enrollments();
  await enrollments.updateOne(
    { memberId: member._id, courseId: course._id },
    { $setOnInsert: { memberId: member._id, courseId: course._id, source: "free", offerId: null, createdAt: new Date() } },
    { upsert: true }
  );

  revalidatePath(`/academia/${courseSlug}`);
}

export async function markLessonComplete(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error("No autenticado");

  const lessonId = String(formData.get("lessonId"));
  const courseId = String(formData.get("courseId"));
  const courseSlug = String(formData.get("courseSlug"));
  const completed = formData.get("completed") !== "false";

  const progress = await Collections.lessonProgress();
  await progress.updateOne(
    { memberId: member._id, lessonId: new ObjectId(lessonId) },
    {
      $set: {
        memberId: member._id,
        courseId: new ObjectId(courseId),
        lessonId: new ObjectId(lessonId),
        completed,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );

  revalidatePath(`/academia/${courseSlug}`);
}
