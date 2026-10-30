import Link from "next/link";
import { ObjectId } from "mongodb";
import { notFound, redirect } from "next/navigation";
import { Collections } from "@/lib/db";
import { getCurrentMember } from "@/lib/current-member";
import { markLessonComplete } from "@/lib/actions/academy";
import { Button } from "@/components/ui/button";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;

  const coursesCol = await Collections.courses();
  const course = await coursesCol.findOne({ slug: courseSlug, published: true });
  if (!course) notFound();

  const member = await getCurrentMember();
  if (!member) redirect(`/login?callbackUrl=/academia/${courseSlug}/${lessonId}`);

  const enrollmentsCol = await Collections.enrollments();
  const enrollment = await enrollmentsCol.findOne({ memberId: member._id, courseId: course._id });
  if (!enrollment) redirect(`/academia/${courseSlug}`);

  const lessonsCol = await Collections.lessons();
  const allLessons = await lessonsCol
    .find({ courseId: course._id })
    .sort({ order: 1 })
    .toArray();
  const lesson = allLessons.find((l) => String(l._id) === lessonId);
  if (!lesson) notFound();

  const index = allLessons.findIndex((l) => String(l._id) === lessonId);
  const prev = allLessons[index - 1];
  const next = allLessons[index + 1];

  const progressCol = await Collections.lessonProgress();
  const progress = await progressCol.findOne({
    memberId: member._id,
    lessonId: new ObjectId(lessonId),
  });
  const isCompleted = !!progress?.completed;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href={`/academia/${courseSlug}`} className="text-sm text-muted-foreground hover:underline">
        ← {course.title}
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">{lesson.title}</h1>

      <div className="mt-4 aspect-video overflow-hidden rounded-lg border bg-black">
        <iframe
          className="h-full w-full"
          src={`https://www.youtube.com/embed/${lesson.videoId}`}
          title={lesson.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex gap-2">
          {prev && (
            <Button asChild variant="outline">
              <Link href={`/academia/${courseSlug}/${prev._id}`}>Anterior</Link>
            </Button>
          )}
          {next && (
            <Button asChild variant="outline">
              <Link href={`/academia/${courseSlug}/${next._id}`}>Siguiente</Link>
            </Button>
          )}
        </div>
        <form action={markLessonComplete}>
          <input type="hidden" name="lessonId" value={String(lesson._id)} />
          <input type="hidden" name="courseId" value={String(course._id)} />
          <input type="hidden" name="courseSlug" value={course.slug} />
          <input type="hidden" name="completed" value={(!isCompleted).toString()} />
          <Button type="submit" variant={isCompleted ? "outline" : "default"}>
            {isCompleted ? "Marcar como no vista" : "Marcar como completada"}
          </Button>
        </form>
      </div>
    </div>
  );
}
