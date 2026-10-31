import React, { useMemo, useState } from "react";
import {
  Target,
  Trophy,
  Plus,
  Check,
  RotateCcw,
  Clock,
  Send,
  Trash2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useChallenges } from "@/hooks/useCommunityModules";

interface Props {
  programId: string;
  isStaff: boolean;
  userId?: string;
  nameFor: (id: string) => string;
}

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("es-CO", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Sin fecha límite";

export const ChallengesSection: React.FC<Props> = ({
  programId,
  isStaff,
  userId,
  nameFor,
}) => {
  const {
    challenges,
    loading,
    myPartFor,
    join,
    submit,
    review,
    create,
    setStatus,
    remove,
    submissions,
  } = useChallenges(programId, isStaff);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    xp_reward: 100,
    due_date: "",
  });
  const [submitFor, setSubmitFor] = useState<string | null>(null);
  const [submissionText, setSubmissionText] = useState("");

  const openSubmissions = useMemo(
    () => submissions.filter((s) => challenges.some((c) => c.id === s.challenge_id)),
    [submissions, challenges]
  );

  const handleCreate = async () => {
    if (form.title.trim().length < 4) return;
    await create({
      title: form.title.trim(),
      description: form.description.trim(),
      xp_reward: Math.max(0, Math.min(5000, Number(form.xp_reward) || 0)),
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    });
    setForm({ title: "", description: "", xp_reward: 100, due_date: "" });
    setCreateOpen(false);
  };

  const handleSubmit = async () => {
    if (!submitFor) return;
    await submit(submitFor, submissionText);
    setSubmitFor(null);
    setSubmissionText("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="dark-island rounded-[2rem] px-6 py-4">
          <p className="display text-xl md:text-2xl">
            Retos <span className="serif-accent text-primary normal-case">y misiones</span>
          </p>
          <p className="text-xs uppercase tracking-widest opacity-70 mt-1">
            Ejecuta, entrega evidencia y ganas puntos
          </p>
        </div>
        {isStaff && (
          <Button onClick={() => setCreateOpen(true)} className="pill-solid gap-2 rounded-full">
            <Plus className="w-4 h-4" />
            Nuevo reto
          </Button>
        )}
      </div>

      {isStaff && openSubmissions.length > 0 && (
        <div className="rounded-[2rem] bg-secondary p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Entregas por revisar
          </p>
          <div className="space-y-4">
            {openSubmissions.map((s) => (
              <div key={s.id} className="rounded-[1.5rem] bg-background p-4">
                <p className="font-semibold text-sm">
                  {nameFor(s.user_id)}
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    · {fmtDate(s.submitted_at)}
                  </span>
                </p>
                <p className="text-sm mt-2 whitespace-pre-wrap">{s.submission_text}</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    className="rounded-full gap-1.5"
                    onClick={() => review(s.challenge_id, s.user_id, true)}
                  >
                    <Check className="w-3.5 h-3.5" /> Completar y dar puntos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full gap-1.5"
                    onClick={() => review(s.challenge_id, s.user_id, false)}
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Devolver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-[2rem] bg-secondary p-6">
              <Skeleton className="h-6 w-1/3 mb-3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : challenges.length === 0 ? (
        <div className="rounded-[2rem] bg-secondary p-10 text-center">
          <Target className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-heading font-semibold mb-1">Todavía no hay retos</h3>
          <p className="text-sm text-muted-foreground">
            {isStaff
              ? "Crea el primero con el botón de arriba."
              : "Cuando el equipo publique un reto, aparecerá aquí."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((c) => {
            const part = myPartFor(c.id);
            const expired = c.due_date ? new Date(c.due_date) < new Date() : false;
            return (
              <div key={c.id} className="rounded-[2rem] bg-secondary p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-heading text-lg md:text-xl font-semibold uppercase">
                      {c.title}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-primary" /> +{c.xp_reward} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {fmtDate(c.due_date)}
                      </span>
                      {c.status === "closed" && (
                        <span className="flex items-center gap-1 text-primary">
                          <Lock className="w-3 h-3" /> cerrado
                        </span>
                      )}
                    </p>
                  </div>
                  {isStaff && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => setStatus(c.id, c.status === "open" ? "closed" : "open")}
                      >
                        {c.status === "open" ? "Cerrar" : "Reabrir"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => remove(c.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {c.description && (
                  <p className="text-sm mt-4 whitespace-pre-wrap">{c.description}</p>
                )}

                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  {!part && c.status === "open" && (
                    <Button
                      size="sm"
                      className="rounded-full"
                      disabled={expired}
                      onClick={() => join(c.id)}
                    >
                      Unirme al reto
                    </Button>
                  )}
                  {part?.status === "joined" && c.status === "open" && (
                    <Button
                      size="sm"
                      className="rounded-full gap-1.5"
                      onClick={() => {
                        setSubmitFor(c.id);
                        setSubmissionText(part.submission_text || "");
                      }}
                    >
                      <Send className="w-3.5 h-3.5" /> Entregar evidencia
                    </Button>
                  )}
                  {part?.status === "submitted" && (
                    <span className="pill">Entrega enviada · en revisión</span>
                  )}
                  {part?.status === "completed" && (
                    <span className="pill pill-solid inline-flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Reto completado
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Crear reto */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase">Nuevo reto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-widest">Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Graba tu primer video de venta"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest">Instrucciones</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Qué debe hacer el miembro y qué se acepta como evidencia"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-widest">Puntos</Label>
                <Input
                  type="number"
                  min={0}
                  max={5000}
                  value={form.xp_reward}
                  onChange={(e) => setForm({ ...form, xp_reward: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Fecha límite</Label>
                <Input
                  type="datetime-local"
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                />
              </div>
            </div>
            <Button
              className="w-full rounded-full"
              disabled={form.title.trim().length < 4}
              onClick={handleCreate}
            >
              Publicar reto
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Entregar evidencia */}
      <Dialog open={!!submitFor} onOpenChange={(o) => !o && setSubmitFor(null)}>
        <DialogContent className="rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase">Tu evidencia</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={5}
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            placeholder="Describe lo que hiciste, adjunta enlaces o resultados"
          />
          <Button className="w-full rounded-full" onClick={handleSubmit}>
            Enviar entrega
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
