import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { Collections } from "@/lib/db";
import { getCurrentMember } from "@/lib/current-member";
import { registerForEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const eventsCol = await Collections.events();
  const event = await eventsCol.findOne({ _id: new ObjectId(id), published: true });
  if (!event) notFound();

  const member = await getCurrentMember();
  let isRegistered = false;
  if (member) {
    const registrationsCol = await Collections.eventRegistrations();
    const reg = await registrationsCol.findOne({ eventId: event._id, memberId: member._id });
    isRegistered = !!reg;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <p className="text-sm">{new Date(event.startsAt).toLocaleString("es-CO")}</p>

          {isRegistered ? (
            <a
              href={event.zoomUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <Button>Entrar por Zoom</Button>
            </a>
          ) : (
            <form action={registerForEvent}>
              <input type="hidden" name="eventId" value={String(event._id)} />
              <Button type="submit">Registrarme</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
