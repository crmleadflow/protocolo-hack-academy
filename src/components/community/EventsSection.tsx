import React, { useState } from "react";
import {
  CalendarDays,
  Plus,
  Video,
  Check,
  Trash2,
  Ban,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvents } from "@/hooks/useCommunityModules";

interface Props {
  programId: string;
  isStaff: boolean;
  userId?: string;
}

const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export const EventsSection: React.FC<Props> = ({ programId, isStaff, userId }) => {
  const {
    events,
    loading,
    attending,
    attendeeCount,
    toggleRsvp,
    create,
    setStatus,
    remove,
  } = useEvents(programId, isStaff);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    starts_at: "",
    meeting_url: "",
    global: false,
  });

  const handleCreate = async () => {
    if (form.title.trim().length < 4 || !form.starts_at) return;
    await create({
      title: form.title.trim(),
      description: form.description.trim(),
      starts_at: new Date(form.starts_at).toISOString(),
      meeting_url: form.meeting_url.trim(),
      global: form.global,
    });
    setForm({ title: "", description: "", starts_at: "", meeting_url: "", global: false });
    setOpen(false);
  };

  const upcoming = events.filter((e) => e.status === "scheduled");
  const past = events.filter((e) => e.status !== "scheduled");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="dark-island rounded-[2rem] px-6 py-4">
          <p className="display text-xl md:text-2xl">
            Eventos <span className="serif-accent text-primary normal-case">en vivo</span>
          </p>
          <p className="text-xs uppercase tracking-widest opacity-70 mt-1">
            Sesiones, workshops y encuentros de la comunidad
          </p>
        </div>
        {isStaff && (
          <Button onClick={() => setOpen(true)} className="pill-solid gap-2 rounded-full">
            <Plus className="w-4 h-4" />
            Crear evento
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-[2rem] bg-secondary p-6">
              <Skeleton className="h-6 w-1/2 mb-3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {upcoming.length === 0 ? (
            <div className="rounded-[2rem] bg-secondary p-10 text-center">
              <CalendarDays className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-heading font-semibold mb-1">No hay eventos programados</h3>
              <p className="text-sm text-muted-foreground">
                {isStaff
                  ? "Crea el primero con el botón de arriba."
                  : "Cuando el equipo agende una sesión, aparecerá aquí."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((e) => {
                const going = userId ? attending(e.id, userId) : false;
                return (
                  <div key={e.id} className="rounded-[2rem] bg-secondary p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="font-heading text-lg md:text-xl font-semibold uppercase">
                          {e.title}
                        </h3>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {fmtWhen(e.starts_at)}
                        </p>
                      </div>
                      {isStaff && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs gap-1"
                            onClick={() => setStatus(e.id, "done")}
                          >
                            <Check className="w-3.5 h-3.5" /> Hecho
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full text-xs gap-1"
                            onClick={() => setStatus(e.id, "cancelled")}
                          >
                            <Ban className="w-3.5 h-3.5" /> Cancelar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => remove(e.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {e.description && (
                      <p className="text-sm mt-4 whitespace-pre-wrap">{e.description}</p>
                    )}

                    <div className="mt-5 flex items-center gap-3 flex-wrap">
                      {userId && (
                        <Button
                          size="sm"
                          variant={going ? "outline" : "default"}
                          className="rounded-full"
                          onClick={() => toggleRsvp(e.id, userId, !going)}
                        >
                          {going ? "Ya me registré · salir" : "Voy a asistir"}
                        </Button>
                      )}
                      {e.meeting_url && (
                        <a
                          href={e.meeting_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pill inline-flex items-center gap-1.5"
                        >
                          <Video className="w-3.5 h-3.5" /> Enlace de la sala
                        </a>
                      )}
                      {isStaff && (
                        <span className="pill inline-flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> {attendeeCount(e.id)} confirmados
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {past.length > 0 && (
            <div className="rounded-[2rem] bg-secondary p-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Ya pasaron
              </p>
              <div className="space-y-3">
                {past.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-heading font-semibold uppercase text-sm">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{fmtWhen(e.starts_at)}</p>
                    </div>
                    <span className="pill">{e.status === "cancelled" ? "cancelado" : "realizado"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase">Nuevo evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-widest">Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Workshop en vivo: oferta irresistible"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest">Descripción</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-widest">Fecha y hora</Label>
                <Input
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Enlace de la sala</Label>
                <Input
                  value={form.meeting_url}
                  onChange={(e) => setForm({ ...form, meeting_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.global}
                onCheckedChange={(v) => setForm({ ...form, global: v === true })}
              />
              Mostrarlo a todos los cursos, no solo a este
            </label>
            <Button
              className="w-full rounded-full"
              disabled={form.title.trim().length < 4 || !form.starts_at}
              onClick={handleCreate}
            >
              Crear evento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
