import { ObjectId } from "mongodb";
import { notFound } from "next/navigation";
import { Collections } from "@/lib/db";
import { getCurrentMember } from "@/lib/current-member";
import { createReply } from "@/lib/actions/forum";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ spaceSlug: string; threadId: string }>;
}) {
  const { spaceSlug, threadId } = await params;
  const spacesCol = await Collections.spaces();
  const space = await spacesCol.findOne({ slug: spaceSlug });
  if (!space) notFound();

  const threadsCol = await Collections.threads();
  const thread = await threadsCol.findOne({ _id: new ObjectId(threadId), spaceId: space._id });
  if (!thread) notFound();

  const repliesCol = await Collections.replies();
  const membersCol = await Collections.members();
  const replies = await repliesCol.find({ threadId: thread._id }).sort({ createdAt: 1 }).toArray();
  const authorIds = [thread.memberId, ...replies.map((r) => r.memberId)];
  const authors = await membersCol.find({ _id: { $in: authorIds } }).toArray();
  const authorById = new Map(authors.map((a) => [String(a._id), a]));

  const member = await getCurrentMember();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{thread.title}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {authorById.get(String(thread.memberId))?.name || "Miembro"}
          </p>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap text-sm">{thread.body}</CardContent>
      </Card>

      <div className="mt-6 flex flex-col gap-3">
        {replies.map((reply) => (
          <Card key={String(reply._id)}>
            <CardContent className="py-4">
              <p className="text-xs text-muted-foreground">
                {authorById.get(String(reply.memberId))?.name || "Miembro"}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{reply.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form action={createReply} className="flex flex-col gap-3">
            <input type="hidden" name="spaceSlug" value={space.slug} />
            <input type="hidden" name="threadId" value={String(thread._id)} />
            <Textarea name="body" required placeholder="Escribí una respuesta" />
            <Button type="submit" className="self-start">
              {member ? "Responder" : "Entrar para responder"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
