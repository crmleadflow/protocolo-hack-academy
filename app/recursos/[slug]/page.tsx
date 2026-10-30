import { notFound } from "next/navigation";
import { Collections } from "@/lib/db";
import { requestResource } from "@/lib/actions/leads";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const resourcesCol = await Collections.resources();
  const resource = await resourcesCol.findOne({ slug, published: true });
  if (!resource) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card>
        <CardHeader>
          <CardTitle>{resource.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{resource.description}</p>
          <form action={requestResource} className="flex flex-col gap-3">
            <input type="hidden" name="resourceSlug" value={resource.slug} />
            <div className="flex flex-col gap-1">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="phone">Teléfono (opcional)</Label>
              <Input id="phone" name="phone" />
            </div>
            <Button type="submit">Descargar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
