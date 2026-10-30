import { notFound } from "next/navigation";
import { Collections } from "@/lib/db";
import { createModule, createLesson, deleteModule, deleteLesson } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const courses = await Collections.courses();
  const course = await courses.findOne({ slug: courseSlug });
  if (!course) notFound();

  const modulesCol = await Collections.modules();
  const lessonsCol = await Collections.lessons();
  const modules = await modulesCol.find({ courseId: course._id }).sort({ order: 1 }).toArray();
  const lessons = await lessonsCol.find({ courseId: course._id }).sort({ order: 1 }).toArray();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="text-sm text-muted-foreground">{course.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createModule} className="flex items-end gap-3">
            <input type="hidden" name="courseId" value={String(course._id)} />
            <input type="hidden" name="courseSlug" value={course.slug} />
            <Input name="title" required placeholder="Título del módulo" />
            <Button type="submit">Agregar</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {modules.map((module) => {
          const moduleLessons = lessons.filter(
            (lesson) => String(lesson.moduleId) === String(module._id)
          );
          return (
            <Card key={String(module._id)}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{module.title}</CardTitle>
                <form action={deleteModule}>
                  <input type="hidden" name="moduleId" value={String(module._id)} />
                  <input type="hidden" name="courseSlug" value={course.slug} />
                  <Button type="submit" size="sm" variant="ghost">
                    Borrar módulo
                  </Button>
                </form>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {moduleLessons.map((lesson) => (
                  <div
                    key={String(lesson._id)}
                    className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span>
                      {lesson.title}{" "}
                      <span className="text-muted-foreground">(YouTube: {lesson.videoId})</span>
                    </span>
                    <form action={deleteLesson}>
                      <input type="hidden" name="lessonId" value={String(lesson._id)} />
                      <input type="hidden" name="courseSlug" value={course.slug} />
                      <Button type="submit" size="sm" variant="ghost">
                        Borrar
                      </Button>
                    </form>
                  </div>
                ))}
                <form action={createLesson} className="flex flex-wrap items-end gap-2 pt-2">
                  <input type="hidden" name="courseId" value={String(course._id)} />
                  <input type="hidden" name="moduleId" value={String(module._id)} />
                  <input type="hidden" name="courseSlug" value={course.slug} />
                  <Input name="title" required placeholder="Título de la lección" className="w-56" />
                  <Input
                    name="videoId"
                    required
                    placeholder="ID del video de YouTube"
                    className="w-56"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Agregar lección
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
