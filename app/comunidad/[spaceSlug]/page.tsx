import Link from "next/link";
import { notFound } from "next/navigation";
import { Collections } from "@/lib/db";
import { getCurrentMember } from "@/lib/current-member";
import { createThread } from "@/lib/actions/forum";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function SpacePage({
  params,
}: {
  params: Promise<{ spaceSlug: string }>;
}) {
  const { spaceSlug } = await params;
  const spacesCol = await Collections.spaces();
  const space = await spacesCol.findOne({ slug: spaceSlug });
  if (!space) notFound();

  const threadsCol = await Collections.threads();
  const threads = await threadsCol.find({ spaceId: space._id }).sort({ createdAt: -1 }).toArray();
  const member = await getCurrentMember();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{space.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{space.description}</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Nuevo tema</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createThread} className="flex flex-col gap-3">
            <input type="hidden" name="spaceId" value={String(space._id)} />
            <input type="hidden" name="spaceSlug" value={space.slug} />
            <Input name="title" required placeholder="Título" />
            <Textarea name="body" required placeholder="¿Qué querés compartir?" />
            <Button type="submit" className="self-start">
              {member ? "Publicar" : "Entrar para publicar"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-2">
        {threads.map((thread) => (
          <Link key={String(thread._id)} href={`/comunidad/${space.slug}/${thread._id}`}>
            <Card className="transition hover:border-primary">
              <CardContent className="py-4">
                <p className="font-medium">{thread.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{thread.body}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
        {threads.length === 0 && (
          <p className="text-sm text-muted-foreground">Todavía no hay temas en este espacio.</p>
        )}
      </div>
    </div>
  );
}
