import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload, Link2, Trash2, Download, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Resource = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  kind: "file" | "link";
  url: string;
  file_name: string | null;
  file_size: number | null;
  enabled: boolean;
  sort_order: number;
};

const formatSize = (b: number | null) => (!b ? "" : b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

export default function AdminResourcesPage() {
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [linkForm, setLinkForm] = useState({ title: "", type: "Enlace", url: "" });
  const [addingLink, setAddingLink] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-resources"],
    queryFn: async () => {
      const { data, error } = await supabase.from("public_resources").select("*").order("sort_order").order("created_at");
      if (error) throw error;
      return data as Resource[];
    },
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-resources"] });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `files/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("public-resources").upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("public-resources").getPublicUrl(path);
      const { error } = await supabase.from("public_resources").insert({
        title: file.name.replace(/\.[^/.]+$/, ""),
        type: "Guía PDF",
        kind: "file",
        url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        enabled: false,
        sort_order: data.length,
      });
      if (error) throw error;
      toast.success("Archivo subido. Actívalo cuando quieras que se vea en la página.");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo subir el archivo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddLink = async () => {
    if (!linkForm.title.trim() || !linkForm.url.trim()) return;
    setBusy("add-link");
    try {
      const { error } = await supabase.from("public_resources").insert({
        title: linkForm.title,
        type: linkForm.type || "Enlace",
        kind: "link",
        url: linkForm.url,
        enabled: false,
        sort_order: data.length,
      });
      if (error) throw error;
      toast.success("Enlace agregado. Actívalo cuando quieras que se vea en la página.");
      setLinkForm({ title: "", type: "Enlace", url: "" });
      setAddingLink(false);
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo agregar el enlace");
    } finally {
      setBusy(null);
    }
  };

  const toggleEnabled = async (r: Resource) => {
    setBusy(r.id);
    const { error } = await supabase.from("public_resources").update({ enabled: !r.enabled }).eq("id", r.id);
    setBusy(null);
    if (error) return toast.error("No se pudo actualizar");
    refresh();
  };

  const remove = async (r: Resource) => {
    setBusy(r.id);
    try {
      if (r.kind === "file" && r.url) {
        const part = r.url.split("/public-resources/")[1];
        if (part) await supabase.storage.from("public-resources").remove([part]);
      }
      const { error } = await supabase.from("public_resources").delete().eq("id", r.id);
      if (error) throw error;
      toast.success("Recurso eliminado");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo eliminar");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
        <header>
          <h1 className="display text-4xl md:text-6xl">Banco de recursos</h1>
          <p className="mt-2 text-muted-foreground">
            Sube archivos o enlaces. Solo los que actives aquí se ven y se entregan al instante en la página pública /recursos.
          </p>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <Button variant="outline" className="rounded-full" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Subir archivo
          </Button>
          <Button variant="outline" className="rounded-full" onClick={() => setAddingLink((v) => !v)}>
            <Link2 className="mr-2 h-4 w-4" /> Agregar enlace
          </Button>
        </div>

        {addingLink && (
          <div className="grid gap-3 rounded-3xl border border-border bg-card p-6 md:grid-cols-[1fr_1fr_1fr_auto]">
            <Input placeholder="Título" value={linkForm.title} onChange={(e) => setLinkForm((f) => ({ ...f, title: e.target.value }))} />
            <Input placeholder="Tipo (ej. Video, Plantilla)" value={linkForm.type} onChange={(e) => setLinkForm((f) => ({ ...f, type: e.target.value }))} />
            <Input placeholder="https://..." value={linkForm.url} onChange={(e) => setLinkForm((f) => ({ ...f, url: e.target.value }))} />
            <Button className="rounded-full" disabled={busy === "add-link"} onClick={handleAddLink}>
              {busy === "add-link" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Agregar"}
            </Button>
          </div>
        )}

        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Todavía no hay recursos. Sube un archivo o agrega un enlace.</p>
        ) : (
          <div className="space-y-2">
            {data.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.type} {r.kind === "file" && r.file_size ? `· ${formatSize(r.file_size)}` : ""}
                  </p>
                </div>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground">
                  {r.kind === "link" ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                </a>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.enabled ? "Visible" : "Oculto"}</span>
                  <Switch checked={r.enabled} disabled={busy === r.id} onCheckedChange={() => toggleEnabled(r)} aria-label={`Activar ${r.title}`} />
                </div>
                <button onClick={() => remove(r)} disabled={busy === r.id} className="p-2 text-destructive hover:opacity-70">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
