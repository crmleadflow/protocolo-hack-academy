import React, { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ContentType } from "@/hooks/useCommunity";

export type SendKind = "discussion" | "question" | "challenge" | "opportunity" | "poll";

export const SEND_LABELS: Record<SendKind, string> = {
  discussion: "Discusión",
  question: "Pregunta",
  challenge: "Reto",
  opportunity: "Oportunidad",
  poll: "Encuesta",
};

interface Props {
  kind: SendKind | null;
  programId: string;
  onClose: () => void;
  createPost: (title: string, content: string, type: ContentType) => Promise<{ id: string } | null>;
  sendCard: (kind: string, refId: string, title: string) => Promise<unknown>;
  onCreated: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const SendItemDialog: React.FC<Props> = ({ kind, programId, onClose, createPost, sendCard, onCreated }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [xp, setXp] = useState("50");
  const [due, setDue] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle(""); setBody(""); setXp("50"); setDue(""); setEmail(""); setLink(""); setOptions(["", ""]);
  };

  const submit = async () => {
    if (!kind) return;
    const t = title.trim();
    if (!t) return toast.error(kind === "poll" ? "Escribe la pregunta" : "Escribe un título");
    setSaving(true);
    try {
      let refId: string | null = null;
      if (kind === "discussion" || kind === "question") {
        const post = await createPost(t, body.trim() || t, kind);
        refId = post?.id ?? null;
      } else if (kind === "challenge") {
        const { data, error } = await supabase
          .from("community_challenges")
          .insert({
            program_id: programId,
            title: t,
            description: body.trim(),
            xp_reward: Math.max(0, parseInt(xp, 10) || 0),
            due_date: due ? new Date(due).toISOString() : null,
            status: "open",
          })
          .select("id")
          .single();
        if (error) throw error;
        refId = data.id;
      } else if (kind === "opportunity") {
        const { data, error } = await supabase
          .from("community_opportunities")
          .insert({
            program_id: programId,
            title: t,
            description: body.trim(),
            contact_email: email.trim(),
            link: link.trim(),
            status: "open",
          })
          .select("id")
          .single();
        if (error) throw error;
        refId = data.id;
      } else if (kind === "poll") {
        const clean = options.map((o) => o.trim()).filter(Boolean);
        if (clean.length < 2) {
          toast.error("Pon al menos 2 opciones");
          return;
        }
        const { data, error } = await db
          .from("community_polls")
          .insert({ program_id: programId, question: t, options: clean })
          .select("id")
          .single();
        if (error) throw error;
        refId = data.id;
      }
      if (!refId) return;
      await sendCard(kind, refId, t);
      onCreated();
      reset();
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!kind} onOpenChange={(o) => !o && !saving && onClose()}>
      <DialogContent className="rounded-[2rem] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">{kind ? `Enviar ${SEND_LABELS[kind].toLowerCase()} al chat` : ""}</DialogTitle>
        </DialogHeader>
        {kind && (
          <div className="space-y-3">
            <Input
              placeholder={kind === "poll" ? "Pregunta de la encuesta" : "Título"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={kind === "poll" ? 200 : 100}
              autoFocus
            />
            {kind !== "poll" && (
              <Textarea
                placeholder={kind === "question" ? "Detalla tu pregunta (el mentor IA responderá)" : "Descripción"}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="min-h-[100px]"
                maxLength={2000}
              />
            )}
            {kind === "challenge" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Puntos</Label><Input type="number" min={0} value={xp} onChange={(e) => setXp(e.target.value)} /></div>
                <div><Label>Fecha límite (opcional)</Label><Input type="date" value={due} onChange={(e) => setDue(e.target.value)} /></div>
              </div>
            )}
            {kind === "opportunity" && (
              <>
                <Input placeholder="Enlace (opcional)" value={link} onChange={(e) => setLink(e.target.value)} />
                <Input type="email" placeholder="Correo de contacto (opcional)" value={email} onChange={(e) => setEmail(e.target.value)} />
              </>
            )}
            {kind === "poll" && (
              <>
                {options.map((o, i) => (
                  <Input key={i} placeholder={`Opción ${i + 1}`} value={o} maxLength={100}
                    onChange={(e) => setOptions((x) => x.map((v, k) => (k === i ? e.target.value : v)))} />
                ))}
                <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={options.length >= 6}
                  onClick={() => setOptions((x) => [...x, ""])}>
                  <Plus className="mr-1 h-4 w-4" /> Otra opción
                </Button>
              </>
            )}
            <Button className="w-full rounded-full" disabled={saving} onClick={submit}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar al chat"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
