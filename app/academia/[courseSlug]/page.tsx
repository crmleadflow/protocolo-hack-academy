import Link from "next/link";
import { notFound } from "next/navigation";
import { Collections } from "@/lib/db";
import { getCurrentMember } from "@/lib/current-member";
import { enrollInFreeCourse } from "@/lib/actions/academy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const coursesCol = await Collections.courses();
  const course = await coursesCol.findOne({ slug: courseSlug, published: true });
  if (!course) notFound();

  const modulesCol = await Collections.modules();
  const lessonsCol = await Collections.lessons();
  const modules = await modulesCol.find({ courseId: course._id }).sort({ order: 1 }).toArray();
  const lessons = await lessonsCol.find({ courseId: course._id }).sort({ order: 1 }).toArray();

  const member = await getCurrentMember();
  let isEnrolled = false;
  let completedLessonIds = new Set<string>();

  if (member) {
    const enrollmentsCol = await Collections.enrollments();
    const enrollment = await enrollmentsCol.findOne({ memberId: member._id, courseId: course._id });
    isEnrolled = !!enrollment;

    if (isEnrolled) {
      const progressCol = await Collections.lessonProgress();
      const progress = await progressCol
        .find({ memberId: member._id, courseId: course._id, completed: true })
        .toArray();
      completedLessonIds = new Set(progress.map((p) => String(p.lessonId)));
    }
  }

  const progressPct =
    lessons.length > 0 ? Math.round((completedLessonIds.size / lessons.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{course.title}</h1>
      <p className="mt-2 text-muted-foreground">{course.description}</p>

      {isEnrolled ? (
        <div className="mt-4 flex items-center gap-3">
          <Progress value={progressPct} className="w-48" />
          <span className="text-sm text-muted-foreground">{progressPct}% completado</span>
        </div>
      ) : course.isFree ? (
        <form action={enrollInFreeCourse} className="mt-4">
          <input type="hidden" name="courseSlug" value={course.slug} />
          <Button type="submit">Inscribirme gratis</Button>
        </form>
      ) : (
        <div className="mt-4">
          <Button asChild>
            <Link href="/ofertas">Ver cómo acceder</Link>
          </Button>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {modules.map((module) => {
          const moduleLessons = lessons.filter(
            (lesson) => String(lesson.moduleId) === String(module._id)
          );
          return (
            <Card key={String(module._id)}>
              <CardHeader>
                <CardTitle className="text-base">{module.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {moduleLessons.map((lesson) => {
                  const done = completedLessonIds.has(String(lesson._id));
                  const content = (
                    <div className="flex items-center gap-2 py-1 text-sm">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      {lesson.title}
                    </div>
                  );
                  return isEnrolled ? (
                    <Link
                      key={String(lesson._id)}
                      href={`/academia/${course.slug}/${lesson._id}`}
                      className="hover:underline"
                    >
                      {content}
                    </Link>
                  ) : (
                    <div key={String(lesson._id)} className="opacity-60">
                      {content}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
