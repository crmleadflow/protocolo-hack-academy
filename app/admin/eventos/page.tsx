import { Collections } from "@/lib/db";
import { createEvent } from "@/lib/actions/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default async function AdminEventsPage() {
  const eventsCol = await Collections.events();
  const all = await eventsCol.find().sort({ startsAt: -1 }).toArray();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Eventos</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo evento</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createEvent} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required className="w-56" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" className="w-56" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="kind">Tipo</Label>
              <select id="kind" name="kind" className="h-9 rounded-md border bg-background px-2 text-sm">
                <option value="webinar">Webinar</option>
                <option value="llamada">Llamada</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="startsAt">Fecha y hora</Label>
              <Input id="startsAt" name="startsAt" type="datetime-local" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="zoomUrl">Enlace de Zoom</Label>
              <Input id="zoomUrl" name="zoomUrl" required placeholder="https://zoom.us/..." className="w-64" />
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {all.map((event) => (
          <Card key={String(event._id)}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{event.title}</p>
                <div className="mt-1 flex gap-2">
                  <Badge variant="outline">{event.kind}</Badge>
                  <Badge variant="secondary">
                    {new Date(event.startsAt).toLocaleString("es-CO")}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
