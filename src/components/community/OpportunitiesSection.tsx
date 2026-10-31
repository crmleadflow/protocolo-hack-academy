import React, { useState } from "react";
import {
  Briefcase,
  Plus,
  Mail,
  Link2,
  Check,
  Trash2,
  Lock,
  Users,
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
import { useOpportunities } from "@/hooks/useCommunityModules";

interface Props {
  programId: string;
  isStaff: boolean;
  userId?: string;
}

export const OpportunitiesSection: React.FC<Props> = ({ programId, isStaff, userId }) => {
  const {
    items,
    loading,
    myResponse,
    respond,
    create,
    setStatus,
    remove,
    responseCount,
  } = useOpportunities(programId, isStaff);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    contact_email: "",
    link: "",
    global: false,
  });
  const [respondFor, setRespondFor] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleCreate = async () => {
    if (form.title.trim().length < 4) return;
    await create({
      title: form.title.trim(),
      description: form.description.trim(),
      contact_email: form.contact_email.trim(),
      link: form.link.trim(),
      global: form.global,
    });
    setForm({ title: "", description: "", contact_email: "", link: "", global: false });
    setCreateOpen(false);
  };

  const handleRespond = async () => {
    if (!respondFor || !userId) return;
    await respond(respondFor, userId, message);
    setRespondFor(null);
    setMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="dark-island rounded-[2rem] px-6 py-4">
          <p className="display text-xl md:text-2xl">
            Oportunidades <span className="serif-accent text-primary normal-case">comerciales</span>
          </p>
          <p className="text-xs uppercase tracking-widest opacity-70 mt-1">
            Alianzas, clientes y colaboraciones de la comunidad
          </p>
        </div>
        {isStaff && (
          <Button onClick={() => setCreateOpen(true)} className="pill-solid gap-2 rounded-full">
            <Plus className="w-4 h-4" />
            Publicar oportunidad
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
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] bg-secondary p-10 text-center">
          <Briefcase className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="font-heading font-semibold mb-1">Sin oportunidades todavía</h3>
          <p className="text-sm text-muted-foreground">
            {isStaff
              ? "Publica una alianza, un cliente o una colaboración con el botón de arriba."
              : "Cuando el equipo publique una oportunidad, aparecerá aquí."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((o) => {
            const mine = userId ? myResponse(o.id, userId) : undefined;
            return (
              <div key={o.id} className="rounded-[2rem] bg-secondary p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-heading text-lg md:text-xl font-semibold uppercase">
                      {o.title}
                    </h3>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                      {o.status === "closed" ? "cerrada" : "abierta"}
                    </p>
                  </div>
                  {isStaff && (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-xs"
                        onClick={() => setStatus(o.id, o.status === "open" ? "closed" : "open")}
                      >
                        {o.status === "open" ? "Cerrar" : "Reabrir"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => remove(o.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>

                {o.description && (
                  <p className="text-sm mt-4 whitespace-pre-wrap">{o.description}</p>
                )}

                <div className="mt-5 flex items-center gap-3 flex-wrap">
                  {o.contact_email && (
                    <a
                      href={`mailto:${o.contact_email}`}
                      className="pill inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" /> {o.contact_email}
                    </a>
                  )}
                  {o.link && (
                    <a
                      href={o.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pill inline-flex items-center gap-1.5"
                    >
                      <Link2 className="w-3.5 h-3.5" /> Ver más
                    </a>
                  )}
                  {isStaff && (
                    <span className="pill inline-flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> {responseCount(o.id)} postulados
                    </span>
                  )}
                  {mine ? (
                    <span className="pill pill-solid inline-flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Ya te postulaste
                    </span>
                  ) : (
                    o.status === "open" &&
                    userId && (
                      <Button
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setRespondFor(o.id);
                          setMessage("");
                        }}
                      >
                        Postularme
                      </Button>
                    )
                  )}
                  {o.status === "closed" && (
                    <span className="pill inline-flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> cerrada
                    </span>
                  )}
                </div>

                {mine && mine.message && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Tu postulación: {mine.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase">Nueva oportunidad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-widest">Título</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ej. Buscamos closer para equipo de alto ticket"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-widest">Descripción</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs uppercase tracking-widest">Correo de contacto</Label>
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-widest">Enlace</Label>
                <Input
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.global}
                onCheckedChange={(v) => setForm({ ...form, global: v === true })}
              />
              Mostrarla a todos los cursos
            </label>
            <Button
              className="w-full rounded-full"
              disabled={form.title.trim().length < 4}
              onClick={handleCreate}
            >
              Publicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!respondFor} onOpenChange={(o) => !o && setRespondFor(null)}>
        <DialogContent className="rounded-[2rem] max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading uppercase">Tu postulación</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Cuéntales quién eres, qué sabes hacer y por qué encajas"
          />
          <Button className="w-full rounded-full" onClick={handleRespond}>
            Enviar postulación
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
