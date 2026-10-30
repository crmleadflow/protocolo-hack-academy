import Link from "next/link";
import { Collections } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ResourcesPage() {
  const resourcesCol = await Collections.resources();
  const resources = await resourcesCol.find({ published: true }).toArray();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Recursos gratis</h1>
      <p className="mt-2 text-muted-foreground">
        Descargá estos recursos sin costo. Solo te pedimos tus datos.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <Link key={String(resource._id)} href={`/recursos/${resource.slug}`}>
            <Card className="h-full transition hover:border-primary">
              <CardHeader>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {resource.description}
              </CardContent>
            </Card>
          </Link>
        ))}
        {resources.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay recursos publicados.</p>
        )}
      </div>
    </div>
  );
}
