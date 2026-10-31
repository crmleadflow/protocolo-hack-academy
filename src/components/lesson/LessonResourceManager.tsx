import React, { useState, useRef } from "react";
import {
  Plus,
  Link2,
  FileText,
  Trash2,
  Upload,
  Loader2,
  ExternalLink,
  Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Label } from "@/components/ui/label";
import { StudentLessonResources } from "@/components/lesson/StudentLessonResources";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LessonResource {
  id: string;
  lesson_id: string;
  type: "file" | "link";
  title: string;
  url: string;
  file_name: string | null;
  file_size: number | null;
  sort_order: number;
}

interface LessonResourceManagerProps {
  lessonId: string;
  resources: LessonResource[];
  onResourcesChange: () => void;
  isAdmin?: boolean;
}

export const LessonResourceManager: React.FC<LessonResourceManagerProps> = ({
  lessonId,
  resources,
  onResourcesChange,
  isAdmin = false,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [linkForm, setLinkForm] = useState({ title: "", url: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);

  const handleAddLink = async () => {
    if (!linkForm.title.trim() || !linkForm.url.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("lesson_resources").insert({
        lesson_id: lessonId,
        type: "link",
        title: linkForm.title,
        url: linkForm.url,
        sort_order: resources.length,
      });

      if (error) throw error;

      toast({ title: "Enlace agregado correctamente" });
      setLinkForm({ title: "", url: "" });
      setIsAddingLink(false);
      onResourcesChange();
    } catch (error) {
      console.error("Error adding link:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el enlace",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `files/${lessonId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("lesson-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("lesson-files")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("lesson_resources").insert({
        lesson_id: lessonId,
        type: "file",
        title: file.name.replace(/\.[^/.]+$/, ""),
        url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        sort_order: resources.length,
      });

      if (dbError) throw dbError;

      toast({ title: "Archivo subido correctamente" });
      onResourcesChange();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir el archivo",
      });
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteResource = async () => {
    if (!deleteResourceId) return;

    try {
      const resource = resources.find((r) => r.id === deleteResourceId);
      
      // If it's a file, delete from storage first
      if (resource?.type === "file" && resource.url) {
        const urlParts = resource.url.split("/lesson-files/");
        if (urlParts[1]) {
          await supabase.storage.from("lesson-files").remove([urlParts[1]]);
        }
      }

      const { error } = await supabase
        .from("lesson_resources")
        .delete()
        .eq("id", deleteResourceId);

      if (error) throw error;

      toast({ title: "Recurso eliminado" });
      onResourcesChange();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el recurso",
      });
    } finally {
      setDeleteResourceId(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Student view: always show the two action buttons below the video
  if (!isAdmin) {
    return <StudentLessonResources resources={resources} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">Recursos Adicionales</h3>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingFile}
            >
              {isUploadingFile ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              Subir Archivo
            </NeonButton>
            <NeonButton
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingLink(true)}
            >
              <Link2 className="w-4 h-4" />
              Agregar Enlace
            </NeonButton>
          </div>
        )}
      </div>

      {resources.length === 0 && isAdmin ? (
        <HolographicCard className="p-6 text-center">
          <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">
            No hay recursos adicionales. Agrega archivos o enlaces para que los alumnos puedan descargar o consultar.
          </p>
        </HolographicCard>
      ) : (
        <div className="space-y-2">
          {resources.map((resource) => (
            <HolographicCard
              key={resource.id}
              className="p-3 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                {resource.type === "link" ? (
                  <Link2 className="w-5 h-5 text-primary" />
                ) : (
                  <FileText className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{resource.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {resource.type === "link"
                    ? resource.url
                    : resource.file_size
                    ? formatFileSize(resource.file_size)
                    : resource.file_name}
                </p>
              </div>
               <div className="flex items-center gap-2">
                {resource.type === "link" ? (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Abrir enlace"
                  >
                    <span className="sr-only">Abrir enlace</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <a
                    href={resource.url}
                    download={resource.file_name ?? undefined}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Descargar archivo"
                  >
                    <span className="sr-only">Descargar archivo</span>
                    <Download className="w-4 h-4" />
                  </a>
                )}
                {isAdmin && (
                  <button
                    onClick={() => setDeleteResourceId(resource.id)}
                    className="p-2 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </HolographicCard>
          ))}
        </div>
      )}

      {/* Add Link Dialog */}
      <Dialog open={isAddingLink} onOpenChange={setIsAddingLink}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Agregar Enlace</DialogTitle>
            <DialogDescription>
              Agrega un enlace externo que los alumnos puedan consultar
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título del enlace *</Label>
              <GlassInput
                placeholder="Ej: Documentación oficial"
                value={linkForm.title}
                onChange={(e) =>
                  setLinkForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>URL *</Label>
              <GlassInput
                placeholder="https://ejemplo.com/recurso"
                value={linkForm.url}
                onChange={(e) =>
                  setLinkForm((prev) => ({ ...prev, url: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <NeonButton variant="ghost" onClick={() => setIsAddingLink(false)}>
              Cancelar
            </NeonButton>
            <NeonButton
              onClick={handleAddLink}
              disabled={!linkForm.title.trim() || !linkForm.url.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Agregar
            </NeonButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteResourceId}
        onOpenChange={() => setDeleteResourceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar recurso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResource}
              className="bg-destructive text-destructive-foreground"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
