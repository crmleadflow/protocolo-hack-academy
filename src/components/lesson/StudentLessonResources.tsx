import React, { useMemo, useState } from "react";
import { 
  Download, 
  ExternalLink, 
  FileText, 
  Link2, 
  Loader2, 
  FolderOpen,
  FileArchive,
  FileImage,
  FileVideo,
  FileAudio
} from "lucide-react";
import { cn } from "@/lib/utils";
import { HolographicCard } from "@/components/ui/holographic-card";
import { useToast } from "@/hooks/use-toast";

export interface StudentLessonResource {
  id: string;
  type: "file" | "link";
  title: string;
  url: string;
  file_name: string | null;
  file_size: number | null;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(fileName: string | null) {
  if (!fileName) return FileText;
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return FileImage;
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return FileVideo;
  if (['mp3', 'wav', 'ogg', 'flac'].includes(ext)) return FileAudio;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return FileArchive;
  return FileText;
}

async function downloadFile(url: string, fileName: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Error al descargar el archivo");
  
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(blobUrl);
}

export function StudentLessonResources({
  resources,
}: {
  resources: StudentLessonResource[];
}) {
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { files, links } = useMemo(() => {
    const files = resources.filter((r) => r.type === "file");
    const links = resources.filter((r) => r.type === "link");
    return { files, links };
  }, [resources]);

  const total = resources.length;

  const handleDownload = async (file: StudentLessonResource) => {
    if (!file.url || !file.file_name) return;
    
    setDownloadingId(file.id);
    try {
      await downloadFile(file.url, file.file_name);
      toast({ title: "Archivo descargado correctamente" });
    } catch (error) {
      console.error("Error downloading file:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo descargar el archivo",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (total === 0) {
    return null;
  }

  return (
    <HolographicCard className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 ring-1 ring-secondary/20">
          <FolderOpen className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-foreground">
            Recursos de la Lección
          </h3>
          <p className="text-xs text-muted-foreground">
            {total} {total === 1 ? "recurso disponible" : "recursos disponibles"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-1 scrollbar-thin scrollbar-thumb-secondary/20">
        {/* Files section */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5" />
              <span>Archivos ({files.length})</span>
            </div>
            <div className="space-y-2">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.file_name);
                return (
                  <button
                    key={file.id}
                    onClick={() => handleDownload(file)}
                    disabled={downloadingId === file.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl w-full text-left transition-all group",
                      "bg-background/30 hover:bg-background/50",
                      "border border-border/30 hover:border-primary/30",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                      "bg-primary/10 group-hover:bg-primary/20"
                    )}>
                      {downloadingId === file.id ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      ) : (
                        <FileIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {file.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.file_size ? formatFileSize(file.file_size) : file.file_name}
                      </p>
                    </div>
                    <div className={cn(
                      "p-2 rounded-lg transition-all flex-shrink-0",
                      "bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground"
                    )}>
                      {downloadingId === file.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Links section */}
        {links.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
              <Link2 className="w-3.5 h-3.5" />
              <span>Enlaces ({links.length})</span>
            </div>
            <div className="space-y-2">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all group",
                    "bg-background/30 hover:bg-background/50",
                    "border border-border/30 hover:border-secondary/30"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    "bg-secondary/10 group-hover:bg-secondary/20"
                  )}>
                    <ExternalLink className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-secondary transition-colors">
                      {link.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new URL(link.url).hostname}
                    </p>
                  </div>
                  <div className={cn(
                    "p-2 rounded-lg transition-all flex-shrink-0",
                    "bg-secondary/10 group-hover:bg-secondary group-hover:text-secondary-foreground"
                  )}>
                    <ExternalLink className="w-4 h-4" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </HolographicCard>
  );
}
