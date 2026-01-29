import React, { useMemo } from "react";
import { Download, ExternalLink, FileText, Link2 } from "lucide-react";

import { HolographicCard } from "@/components/ui/holographic-card";

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
  const { files, links } = useMemo(() => {
    const files = resources.filter((r) => r.type === "file");
    const links = resources.filter((r) => r.type === "link");
    return { files, links };
  }, [resources]);

  const total = resources.length;

  // Don't show section if no resources
  if (total === 0) {
    return null;
  }

  return (
    <HolographicCard className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-semibold text-lg">Recursos de la lección</h3>
          <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-white/10">
            {total} recurso{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Files section */}
        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Archivos para descargar ({files.length})</span>
            </div>
            <div className="grid gap-2">
              {files.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  download={file.file_name ?? undefined}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {file.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.file_size ? formatFileSize(file.file_size) : file.file_name}
                    </p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Links section */}
        {links.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link2 className="w-4 h-4" />
              <span>Enlaces externos ({links.length})</span>
            </div>
            <div className="grid gap-2">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0">
                    <ExternalLink className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-secondary transition-colors">
                      {link.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {link.url}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </HolographicCard>
  );
}
