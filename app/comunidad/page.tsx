import Link from "next/link";
import { Collections } from "@/lib/db";
import { getCurrentMember } from "@/lib/current-member";
import { createSpace } from "@/lib/actions/forum";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function CommunityPage() {
  const spacesCol = await Collections.spaces();
  const spaces = await spacesCol.find().sort({ order: 1 }).toArray();
  const member = await getCurrentMember();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Comunidad</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {spaces.map((space) => (
          <Link key={String(space._id)} href={`/comunidad/${space.slug}`}>
            <Card className="transition hover:border-primary">
              <CardHeader>
                <CardTitle className="text-base">{space.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {space.description}
              </CardContent>
            </Card>
          </Link>
        ))}
        {spaces.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay espacios creados.</p>
        )}
      </div>

      {member?.role === "super_admin" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base">Crear espacio (admin)</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createSpace} className="flex items-end gap-3">
              <Input name="title" required placeholder="Nombre del espacio" />
              <Input name="description" placeholder="Descripción" />
              <Button type="submit">Crear</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
