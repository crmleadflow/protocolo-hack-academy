import Link from "next/link";
import { Collections } from "@/lib/db";
import { hoursAgo } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function EventsPage() {
  const eventsCol = await Collections.events();
  const events = await eventsCol
    .find({ published: true, startsAt: { $gte: hoursAgo(2) } })
    .sort({ startsAt: 1 })
    .toArray();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Eventos</h1>
      <div className="mt-6 flex flex-col gap-3">
        {events.map((event) => (
          <Link key={String(event._id)} href={`/eventos/${event._id}`}>
            <Card className="transition hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">{event.title}</CardTitle>
                <Badge variant="outline">{event.kind}</Badge>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {new Date(event.startsAt).toLocaleString("es-CO")}
              </CardContent>
            </Card>
          </Link>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay eventos próximos.</p>
        )}
      </div>
    </div>
  );
}
