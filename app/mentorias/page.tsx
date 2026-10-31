import Link from "next/link";
import { Collections } from "@/lib/db";
import { getCurrentMember } from "@/lib/current-member";
import { bookMentorshipSlot } from "@/lib/actions/mentorship";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hoursAgo } from "@/lib/dates";

export default async function MentorshipsPage() {
  const [offersCol, programsCol, slotsCol] = await Promise.all([
    Collections.offers(),
    Collections.mentorshipPrograms(),
    Collections.mentorshipSlots(),
  ]);

  const offers = await offersCol.find({ kind: "mentorship", active: true }).toArray();
  const programs = await programsCol.find({ published: true }).toArray();
  const slots = await slotsCol
    .find({ booked: false, startsAt: { $gte: hoursAgo(0) } })
    .sort({ startsAt: 1 })
    .toArray();

  const member = await getCurrentMember();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Mentorías</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Comprás el cupo en el marketplace y reservás tu horario acá abajo.
      </p>

      {offers.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {offers.map((offer) => (
            <Card key={String(offer._id)}>
              <CardHeader>
                <CardTitle className="text-base">{offer.title}</CardTitle>
                <CardDescription>{offer.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-semibold">
                  {(offer.priceCents / 100).toFixed(2)} {offer.currency}
                </p>
                <Button asChild className="mt-3 w-full">
                  <Link href="/marketplace">Comprar en el marketplace</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-10 flex flex-col gap-4">
        {programs.map((program) => {
          const programSlots = slots.filter((s) => String(s.programId) === String(program._id));
          if (programSlots.length === 0) return null;
          return (
            <Card key={String(program._id)}>
              <CardHeader>
                <CardTitle className="text-base">{program.title}</CardTitle>
                <CardDescription>{program.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {programSlots.map((slot) => (
                  <form
                    key={String(slot._id)}
                    action={bookMentorshipSlot}
                    className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <input type="hidden" name="slotId" value={String(slot._id)} />
                    <input type="hidden" name="programId" value={String(program._id)} />
                    <span>
                      {new Date(slot.startsAt).toLocaleString("es-CO")} · {slot.durationMinutes} min
                    </span>
                    <Button type="submit" size="sm" variant="outline">
                      {member ? "Reservar" : "Entrar para reservar"}
                    </Button>
                  </form>
                ))}
              </CardContent>
            </Card>
          );
        })}
        {programs.every(
          (p) => slots.filter((s) => String(s.programId) === String(p._id)).length === 0
        ) && (
          <p className="text-sm text-muted-foreground">
            Todavía no hay horarios disponibles para reservar.
          </p>
        )}
      </div>
    </div>
  );
}
