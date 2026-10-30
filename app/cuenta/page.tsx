import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { Collections } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login?callbackUrl=/cuenta");

  const [enrollmentsCol, coursesCol] = await Promise.all([
    Collections.enrollments(),
    Collections.courses(),
  ]);
  const enrollments = await enrollmentsCol.find({ memberId: member._id }).toArray();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await coursesCol.find({ _id: { $in: courseIds } }).toArray();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Tu cuenta</h1>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">{member.name}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{member.email}</CardContent>
      </Card>

      <h2 className="mt-8 text-lg font-medium">Tus cursos</h2>
      <div className="mt-3 flex flex-col gap-2">
        {courses.map((course) => (
          <Link
            key={String(course._id)}
            href={`/academia/${course.slug}`}
            className="rounded border px-4 py-3 text-sm hover:bg-muted"
          >
            {course.title}
          </Link>
        ))}
        {courses.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no te inscribiste a ningún curso.</p>
        )}
      </div>
    </div>
  );
}
