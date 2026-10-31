import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/current-member";
import { Collections } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AccountPage() {
  const member = await getCurrentMember();
  if (!member) redirect("/login?callbackUrl=/cuenta");

  const [enrollmentsCol, coursesCol, mentorshipBookingsCol, mentorshipSlotsCol, mentorshipProgramsCol] =
    await Promise.all([
      Collections.enrollments(),
      Collections.courses(),
      Collections.mentorshipBookings(),
      Collections.mentorshipSlots(),
      Collections.mentorshipPrograms(),
    ]);
  const enrollments = await enrollmentsCol.find({ memberId: member._id }).toArray();
  const courseIds = enrollments.map((e) => e.courseId);
  const courses = await coursesCol.find({ _id: { $in: courseIds } }).toArray();

  const bookings = await mentorshipBookingsCol.find({ memberId: member._id }).toArray();
  const slotIds = bookings.map((b) => b.slotId);
  const programIds = bookings.map((b) => b.programId);
  const [bookedSlots, bookedPrograms] = await Promise.all([
    mentorshipSlotsCol.find({ _id: { $in: slotIds } }).toArray(),
    mentorshipProgramsCol.find({ _id: { $in: programIds } }).toArray(),
  ]);
  const slotById = new Map(bookedSlots.map((s) => [String(s._id), s]));
  const programById = new Map(bookedPrograms.map((p) => [String(p._id), p]));

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

      <h2 className="mt-8 text-lg font-medium">Tus mentorías reservadas</h2>
      <div className="mt-3 flex flex-col gap-2">
        {bookings.map((booking) => {
          const slot = slotById.get(String(booking.slotId));
          const program = programById.get(String(booking.programId));
          if (!slot || !program) return null;
          return (
            <div key={String(booking._id)} className="rounded border px-4 py-3 text-sm">
              <p className="font-medium">{program.title}</p>
              <p className="text-muted-foreground">
                {new Date(slot.startsAt).toLocaleString("es-CO")} · {slot.durationMinutes} min
              </p>
            </div>
          );
        })}
        {bookings.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no reservaste ninguna mentoría.</p>
        )}
      </div>
    </div>
  );
}
