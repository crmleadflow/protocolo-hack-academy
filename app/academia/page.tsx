import Link from "next/link";
import { Collections } from "@/lib/db";
import { getCurrentMember } from "@/lib/current-member";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AcademyPage() {
  const [coursesCol, enrollmentsCol] = await Promise.all([
    Collections.courses(),
    Collections.enrollments(),
  ]);
  const courses = await coursesCol.find({ published: true }).toArray();

  const member = await getCurrentMember();
  const enrolledCourseIds = member
    ? (await enrollmentsCol.find({ memberId: member._id }).toArray()).map((e) =>
        String(e.courseId)
      )
    : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Academia</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Link key={String(course._id)} href={`/academia/${course.slug}`}>
            <Card className="h-full transition hover:border-primary">
              <CardHeader>
                <CardTitle className="text-lg">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">{course.description}</p>
                <div className="flex gap-2">
                  {course.isFree && <Badge variant="outline">gratis</Badge>}
                  {enrolledCourseIds.includes(String(course._id)) && (
                    <Badge>inscripto</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {courses.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay cursos publicados.</p>
        )}
      </div>
    </div>
  );
}
