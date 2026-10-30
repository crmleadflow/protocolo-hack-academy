import Link from "next/link";
import { Collections } from "@/lib/db";
import { createCourse, setCoursePublished } from "@/lib/actions/courses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default async function AdminCoursesPage() {
  const courses = await Collections.courses();
  const all = await courses.find().sort({ createdAt: -1 }).toArray();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Cursos</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo curso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCourse} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required placeholder="Nombre del curso" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" placeholder="Opcional" />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <Checkbox name="isFree" />
              Gratis
            </label>
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {all.map((course) => (
          <Card key={String(course._id)}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <Link
                  href={`/admin/cursos/${course.slug}`}
                  className="font-medium hover:underline"
                >
                  {course.title}
                </Link>
                <div className="mt-1 flex gap-2">
                  <Badge variant={course.published ? "default" : "secondary"}>
                    {course.published ? "publicado" : "borrador"}
                  </Badge>
                  {course.isFree && <Badge variant="outline">gratis</Badge>}
                </div>
              </div>
              <form action={setCoursePublished}>
                <input type="hidden" name="courseId" value={String(course._id)} />
                <input type="hidden" name="published" value={(!course.published).toString()} />
                <Button type="submit" size="sm" variant="outline">
                  {course.published ? "Despublicar" : "Publicar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
