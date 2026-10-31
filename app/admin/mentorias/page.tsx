import { Collections } from "@/lib/db";
import { createMentorshipProgram, createMentorshipSlot, deleteMentorshipSlot } from "@/lib/actions/mentorship";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default async function AdminMentorshipPage() {
  const [programsCol, slotsCol, bookingsCol, membersCol] = await Promise.all([
    Collections.mentorshipPrograms(),
    Collections.mentorshipSlots(),
    Collections.mentorshipBookings(),
    Collections.members(),
  ]);

  const programs = await programsCol.find().sort({ createdAt: -1 }).toArray();
  const slots = await slotsCol.find().sort({ startsAt: 1 }).toArray();
  const bookings = await bookingsCol.find().toArray();
  const memberIds = bookings.map((b) => b.memberId);
  const members = await membersCol.find({ _id: { $in: memberIds } }).toArray();
  const memberById = new Map(members.map((m) => [String(m._id), m]));
  const bookingBySlotId = new Map(bookings.map((b) => [String(b.slotId), b]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Mentorías</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo programa</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMentorshipProgram} className="flex flex-wrap items-end gap-3">
            <Input name="title" required placeholder="Título del programa" className="w-56" />
            <Input name="description" placeholder="Descripción" className="w-64" />
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4">
        {programs.map((program) => {
          const programSlots = slots.filter((s) => String(s.programId) === String(program._id));
          return (
            <Card key={String(program._id)}>
              <CardHeader>
                <CardTitle className="text-base">{program.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <form action={createMentorshipSlot} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="programId" value={String(program._id)} />
                  <Input name="startsAt" type="datetime-local" required className="w-56" />
                  <Input
                    name="durationMinutes"
                    type="number"
                    defaultValue={30}
                    min={15}
                    step={15}
                    className="w-24"
                  />
                  <Button type="submit" size="sm" variant="outline">
                    Agregar horario
                  </Button>
                </form>

                <div className="flex flex-col gap-1">
                  {programSlots.map((slot) => {
                    const booking = bookingBySlotId.get(String(slot._id));
                    const member = booking ? memberById.get(String(booking.memberId)) : null;
                    return (
                      <div
                        key={String(slot._id)}
                        className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                      >
                        <span>
                          {new Date(slot.startsAt).toLocaleString("es-CO")} · {slot.durationMinutes} min
                        </span>
                        <div className="flex items-center gap-2">
                          {slot.booked ? (
                            <Badge>{member ? `Reservado: ${member.name}` : "Reservado"}</Badge>
                          ) : (
                            <>
                              <Badge variant="outline">Libre</Badge>
                              <form action={deleteMentorshipSlot}>
                                <input type="hidden" name="slotId" value={String(slot._id)} />
                                <Button type="submit" size="sm" variant="ghost">
                                  Borrar
                                </Button>
                              </form>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {programSlots.length === 0 && (
                    <p className="text-sm text-muted-foreground">Sin horarios todavía.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
