import React, { useMemo, useState } from "react";
import { Download, ExternalLink, FileText, Link2 } from "lucide-react";

import { HolographicCard } from "@/components/ui/holographic-card";
import { NeonButton } from "@/components/ui/neon-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

export function StudentLessonResources({
  resources,
}: {
  resources: StudentLessonResource[];
}) {
  const [openFiles, setOpenFiles] = useState(false);
  const [openLinks, setOpenLinks] = useState(false);

  const { files, links } = useMemo(() => {
    const files = resources.filter((r) => r.type === "file");
    const links = resources.filter((r) => r.type === "link");
    return { files, links };
  }, [resources]);

  const total = resources.length;

  return (
    <div className="space-y-3">
      <HolographicCard className="p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="font-heading font-semibold text-lg">Recursos</h3>
            <p className="text-xs text-muted-foreground">
              {total > 0
                ? `${files.length} archivo(s) • ${links.length} enlace(s)`
                : "No hay recursos adjuntos en esta lección"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NeonButton
              size="sm"
              onClick={() => setOpenFiles(true)}
              disabled={files.length === 0}
            >
              <Download className="w-4 h-4" />
              {files.length <= 1 ? "Descargar archivo" : "Descargar archivos"}
            </NeonButton>

            <NeonButton
              size="sm"
              onClick={() => setOpenLinks(true)}
              disabled={links.length === 0}
            >
              <ExternalLink className="w-4 h-4" />
              {links.length <= 1 ? "Abrir enlace" : "Abrir enlaces"}
            </NeonButton>
          </div>
        </div>
      </HolographicCard>

      {/* Files dialog */}
      <Dialog open={openFiles} onOpenChange={setOpenFiles}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Archivos de la lección</DialogTitle>
            <DialogDescription>
              Descarga los archivos compartidos por el administrador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {files.map((file) => (
              <HolographicCard key={file.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{file.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {file.file_size ? formatFileSize(file.file_size) : file.file_name}
                      </p>
                    </div>
                  </div>

                  <a
                    href={file.url}
                    download={file.file_name ?? undefined}
                    className="inline-flex"
                  >
                    <NeonButton size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                      Descargar
                    </NeonButton>
                  </a>
                </div>
              </HolographicCard>
            ))}

            {files.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No hay archivos adjuntos.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Links dialog */}
      <Dialog open={openLinks} onOpenChange={setOpenLinks}>
        <DialogContent className="glass-strong">
          <DialogHeader>
            <DialogTitle>Enlaces de la lección</DialogTitle>
            <DialogDescription>
              Abre los enlaces compartidos por el administrador.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {links.map((link) => (
              <HolographicCard key={link.id} className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Link2 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{link.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                    </div>
                  </div>

                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex"
                  >
                    <NeonButton size="sm" variant="ghost">
                      <ExternalLink className="w-4 h-4" />
                      Abrir
                    </NeonButton>
                  </a>
                </div>
              </HolographicCard>
            ))}

            {links.length === 0 && (
              <div className="text-sm text-muted-foreground">
                No hay enlaces adjuntos.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
