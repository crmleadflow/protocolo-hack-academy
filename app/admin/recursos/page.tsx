import { Collections } from "@/lib/db";
import { createResource, setResourcePublished } from "@/lib/actions/resources";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default async function AdminResourcesPage() {
  const resourcesCol = await Collections.resources();
  const all = await resourcesCol.find().sort({ createdAt: -1 }).toArray();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Recursos gratis</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nuevo recurso</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createResource} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" required placeholder="Nombre del recurso" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="description">Descripción</Label>
              <Input id="description" name="description" placeholder="Opcional" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="fileUrl">Enlace del archivo</Label>
              <Input id="fileUrl" name="fileUrl" required placeholder="https://..." className="w-64" />
            </div>
            <Button type="submit">Crear</Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {all.map((resource) => (
          <Card key={String(resource._id)}>
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">{resource.title}</p>
                <Badge variant={resource.published ? "default" : "secondary"} className="mt-1">
                  {resource.published ? "publicado" : "oculto"}
                </Badge>
              </div>
              <form action={setResourcePublished}>
                <input type="hidden" name="resourceId" value={String(resource._id)} />
                <input type="hidden" name="published" value={(!resource.published).toString()} />
                <Button type="submit" size="sm" variant="outline">
                  {resource.published ? "Ocultar" : "Publicar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
