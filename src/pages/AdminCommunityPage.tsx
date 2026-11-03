import { useMemo, useRef, useState } from "react";
import {
  Loader2, Upload, Link2, Trash2, Megaphone, Target, CalendarDays, BarChart3, ExternalLink, X, Plus, Briefcase,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudentPrograms } from "@/hooks/useStudentPrograms";
import { useEvents, useMembers } from "@/hooks/useCommunityModules";
import { ChallengesSection } from "@/components/community/ChallengesSection";
import { OpportunitiesSection } from "@/components/community/OpportunitiesSection";
import { usePolls } from "@/hooks/useCommunityPolls";
import { toast } from "sonner";

const TAB_CLS = "rounded-full px-4 gap-2 data-[state=active]:bg-foreground data-[state=active]:text-background";
const card = "rounded-3xl border border-border bg-card p-6 space-y-4";

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : "Sin fecha";

async function uploadToCommunity(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("community-files").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) {
    toast.error("No se pudo subir el archivo");
    return null;
  }
  return supabase.storage.from("community-files").getPublicUrl(path).data.publicUrl;
}

function AnnouncementTab({ programId, userId, onPosted }: { programId: string; userId: string; onPosted: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [media, setMedia] = useState<{ name: string; url: string }[]>([]);
  const [pin, setPin] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const addLink = () => {
    const v = linkInput.trim();
    if (!/^https?:\/\/\S+$/.test(v)) return toast.error("El enlace debe empezar con http:// o https://");
    setLinks((l) => [...l, v]);
    setLinkInput("");
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    for (const f of files) {
      const url = await uploadToCommunity(f, userId);
      if (url) setMedia((m) => [...m, { name: f.name, url }]);
    }
    setUploading(false);
    e.target.value = "";
  };

  const publish = async () => {
    if (!title.trim()) return toast.error("Escribe un título");
    setSaving(true);
    const content = [text.trim(), ...links, ...media.map((m) => m.url)].filter(Boolean).join("\n\n") || title.trim();
    const { error } = await supabase.from("community_posts").insert({
      program_id: programId,
      user_id: userId,
      title: title.trim(),
      content,
      content_type: "announcement",
      is_pinned: pin,
    });
    setSaving(false);
    if (error) return toast.error("No se pudo publicar: " + error.message);
    toast.success("Anuncio publicado en la comunidad");
    setTitle(""); setText(""); setLinks([]); setMedia([]);
    onPosted();
  };

  return (
    <div className={card}>
      <Input placeholder="Título del anuncio" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
      <Textarea placeholder="Mensaje (opcional)" value={text} onChange={(e) => setText(e.target.value)} className="min-h-[120px]" maxLength={2000} />

      <div className="flex gap-2">
        <Input placeholder="Pega un enlace (YouTube, Vimeo, web...)" value={linkInput} onChange={(e) => setLinkInput(e.target.value)} />
        <Button type="button" variant="outline" className="rounded-full" onClick={addLink}>
          <Link2 className="mr-2 h-4 w-4" /> Agregar
        </Button>
      </div>

      <div>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf" className="hidden" onChange={onFiles} />
        <Button type="button" variant="outline" className="rounded-full" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Subir imágenes o videos
        </Button>
      </div>

      {(links.length > 0 || media.length > 0) && (
        <ul className="space-y-1 text-sm">
          {links.map((l, i) => (
            <li key={l + i} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
              <span className="truncate">{l}</span>
              <button aria-label="Quitar" onClick={() => setLinks((x) => x.filter((_, k) => k !== i))}><X className="h-4 w-4" /></button>
            </li>
          ))}
          {media.map((m, i) => (
            <li key={m.url} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2">
              <span className="truncate">{m.name}</span>
              <button aria-label="Quitar" onClick={() => setMedia((x) => x.filter((_, k) => k !== i))}><X className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={pin} onCheckedChange={setPin} /> Fijar arriba en la comunidad
        </label>
        <Button className="rounded-full" disabled={saving || uploading} onClick={publish}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar anuncio"}
        </Button>
      </div>
    </div>
  );
}

function ChallengesAdmin({ programId, userId }: { programId: string; userId: string }) {
  const { members } = useMembers(programId);
  const nameFor = (id: string) => (id === userId ? "Tú" : members.find((m) => m.user_id === id)?.full_name || "Miembro");
  return <ChallengesSection programId={programId} isStaff userId={userId} nameFor={nameFor} />;
}

function EventTab({ programId, userId }: { programId: string; userId: string }) {
  const flyerRef = useRef<HTMLInputElement>(null);
  const { events, create, setStatus } = useEvents(programId, true);
  const [f, setF] = useState({ title: "", description: "", starts: "", meeting: "", social: "", flyer: "", global: false });
  const [uploading, setUploading] = useState(false);

  const onFlyer = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToCommunity(file, userId);
    setUploading(false);
    if (url) setF((s) => ({ ...s, flyer: url }));
    e.target.value = "";
  };

  const submit = async () => {
    if (!f.title.trim() || !f.starts) return toast.error("Falta el título o la fecha del evento");
    await create({
      title: f.title.trim(),
      description: f.description.trim(),
      starts_at: new Date(f.starts).toISOString(),
      meeting_url: f.meeting.trim(),
      flyer_url: f.flyer,
      social_url: f.social.trim(),
      global: f.global,
    });
    setF({ title: "", description: "", starts: "", meeting: "", social: "", flyer: "", global: false });
  };

  return (
    <div className="space-y-6">
      <div className={card}>
        <Input placeholder="Título del evento" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
        <Textarea placeholder="Descripción" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>Fecha y hora</Label><Input type="datetime-local" value={f.starts} onChange={(e) => setF({ ...f, starts: e.target.value })} /></div>
          <div><Label>Enlace de la sala (Zoom, Meet...)</Label><Input placeholder="https://..." value={f.meeting} onChange={(e) => setF({ ...f, meeting: e.target.value })} /></div>
        </div>
        <Input placeholder="Enlace de redes sociales (opcional)" value={f.social} onChange={(e) => setF({ ...f, social: e.target.value })} />
        <div className="flex flex-wrap items-center gap-3">
          <input ref={flyerRef} type="file" accept="image/*" className="hidden" onChange={onFlyer} />
          <Button type="button" variant="outline" className="rounded-full" disabled={uploading} onClick={() => flyerRef.current?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            {f.flyer ? "Cambiar imagen" : "Subir imagen del evento"}
          </Button>
          {f.flyer && <img src={f.flyer} alt="" className="h-12 rounded-lg" />}
        </div>
        <div className="flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={f.global} onCheckedChange={(v) => setF({ ...f, global: v })} /> Mostrarlo a todos los cursos
          </label>
          <Button className="rounded-full" onClick={submit}>Crear evento</Button>
        </div>
      </div>
      <ul className="space-y-2">
        {events.map((ev) => (
          <li key={ev.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{ev.title}</p>
              <p className="text-xs text-muted-foreground">{fmt(ev.starts_at)} · {ev.status === "scheduled" ? "Programado" : ev.status === "done" ? "Hecho" : "Cancelado"}</p>
            </div>
            {ev.status === "scheduled" && (
              <>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(ev.id, "done")}>Marcar hecho</Button>
                <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(ev.id, "cancelled")}>Cancelar</Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PollTab({ programId }: { programId: string }) {
  const { polls, countsFor, create, setStatus, remove } = usePolls(programId);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const submit = async () => {
    const clean = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) return toast.error("Escribe la pregunta y al menos 2 opciones");
    if (await create(question.trim(), clean)) {
      setQuestion("");
      setOptions(["", ""]);
    }
  };

  return (
    <div className="space-y-6">
      <div className={card}>
        <Input placeholder="Pregunta de la encuesta" value={question} onChange={(e) => setQuestion(e.target.value)} maxLength={200} />
        {options.map((o, i) => (
          <Input key={i} placeholder={`Opción ${i + 1}`} value={o} onChange={(e) => setOptions((x) => x.map((v, k) => (k === i ? e.target.value : v)))} maxLength={100} />
        ))}
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={options.length >= 6} onClick={() => setOptions((x) => [...x, ""])}>
            <Plus className="mr-1 h-4 w-4" /> Otra opción
          </Button>
          <Button className="rounded-full" onClick={submit}>Publicar encuesta</Button>
        </div>
      </div>
      <ul className="space-y-2">
        {polls.map((p) => {
          const counts = countsFor(p);
          return (
            <li key={p.id} className="space-y-2 rounded-2xl bg-card p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium">{p.question}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(p.id, p.status === "open" ? "closed" : "open")}>
                    {p.status === "open" ? "Cerrar" : "Reabrir"}
                  </Button>
                  <Button size="icon" variant="ghost" aria-label="Eliminar encuesta" onClick={() => confirm("¿Eliminar esta encuesta y sus votos?") && remove(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ul className="text-xs text-muted-foreground">
                {p.options.map((o, i) => <li key={i}>{o}: {counts[i]} votos</li>)}
              </ul>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AdminCommunityPage() {
  const { user } = useAuth();
  const { programs, isLoading } = useStudentPrograms();
  const [programId, setProgramId] = useState("");
  const [postedCount, setPostedCount] = useState(0);
  const current = useMemo(() => programId || programs[0]?.id || "", [programId, programs]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-4xl md:text-6xl">Comunidad</h1>
            <p className="mt-2 text-muted-foreground">Publica anuncios, retos, eventos y encuestas para tus alumnos.</p>
          </div>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/community"><ExternalLink className="mr-2 h-4 w-4" /> Ver la comunidad</Link>
          </Button>
        </header>

        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : programs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Primero publica un programa para poder usar la comunidad.</p>
        ) : (
          <>
            <div className="max-w-sm">
              <Label>Programa</Label>
              <Select value={current} onValueChange={setProgramId}>
                <SelectTrigger className="rounded-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {programs.map((p) => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="anuncio" className="space-y-6">
              <TabsList className="h-12 flex-wrap rounded-full bg-secondary p-1">
                <TabsTrigger value="anuncio" className={TAB_CLS}><Megaphone className="h-4 w-4" /> Anuncio</TabsTrigger>
                <TabsTrigger value="reto" className={TAB_CLS}><Target className="h-4 w-4" /> Reto</TabsTrigger>
                <TabsTrigger value="oportunidad" className={TAB_CLS}><Briefcase className="h-4 w-4" /> Oportunidad</TabsTrigger>
                <TabsTrigger value="evento" className={TAB_CLS}><CalendarDays className="h-4 w-4" /> Evento</TabsTrigger>
                <TabsTrigger value="encuesta" className={TAB_CLS}><BarChart3 className="h-4 w-4" /> Encuesta</TabsTrigger>
              </TabsList>
              <TabsContent value="anuncio">
                <AnnouncementTab key={postedCount} programId={current} userId={user!.id} onPosted={() => setPostedCount((n) => n + 1)} />
              </TabsContent>
              <TabsContent value="reto"><ChallengesAdmin programId={current} userId={user!.id} /></TabsContent>
              <TabsContent value="oportunidad"><OpportunitiesSection programId={current} isStaff userId={user!.id} /></TabsContent>
              <TabsContent value="evento"><EventTab programId={current} userId={user!.id} /></TabsContent>
              <TabsContent value="encuesta"><PollTab programId={current} /></TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AppLayout>
  );
}
