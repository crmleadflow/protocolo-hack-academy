import React, { useRef, useState } from "react";
import {
  Upload,
  Link2,
  FileVideo,
  Play,
  X,
  Loader2,
  Youtube,
  ExternalLink,
} from "lucide-react";
import { GlassInput } from "@/components/ui/glass-input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type VideoSourceType = "upload" | "link";

interface LessonVideoInputProps {
  videoFile: File | null;
  videoUrl: string;
  isUploading: boolean;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
}

// Helper to detect video platform from URL
const getVideoPlatform = (url: string): { name: string; icon: React.ReactNode } | null => {
  if (!url) return null;
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be")) {
    return { name: "YouTube", icon: <Youtube className="w-5 h-5 text-red-500" /> };
  }
  if (lowerUrl.includes("vimeo.com")) {
    return { name: "Vimeo", icon: <Play className="w-5 h-5 text-cyan-500" /> };
  }
  if (lowerUrl.includes("wistia.com") || lowerUrl.includes("wi.st")) {
    return { name: "Wistia", icon: <Play className="w-5 h-5 text-blue-500" /> };
  }
  if (lowerUrl.includes("bunny.net") || lowerUrl.includes("b-cdn.net")) {
    return { name: "Bunny.net", icon: <Play className="w-5 h-5 text-orange-500" /> };
  }
  if (lowerUrl.includes("loom.com")) {
    return { name: "Loom", icon: <Play className="w-5 h-5 text-purple-500" /> };
  }
  
  // Generic external video
  return { name: "Video externo", icon: <ExternalLink className="w-5 h-5 text-muted-foreground" /> };
};

export const LessonVideoInput: React.FC<LessonVideoInputProps> = ({
  videoFile,
  videoUrl,
  isUploading,
  onFileChange,
  onUrlChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceType, setSourceType] = useState<VideoSourceType>(
    videoUrl && !videoFile ? "link" : "upload"
  );
  const [linkInput, setLinkInput] = useState(videoUrl || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
      if (!validTypes.includes(file.type)) {
        return;
      }
      onFileChange(file);
      onUrlChange("");
      setLinkInput("");
    }
  };

  const handleRemoveFile = () => {
    onFileChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLinkSubmit = () => {
    if (linkInput.trim()) {
      onUrlChange(linkInput.trim());
      onFileChange(null);
    }
  };

  const handleRemoveLink = () => {
    onUrlChange("");
    setLinkInput("");
  };

  const platform = getVideoPlatform(videoUrl);
  const hasVideo = videoFile || videoUrl;

  // If we have a video already, show it
  if (hasVideo) {
    return (
      <div className="space-y-2">
        <Label>Video de la lección</Label>
        <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
          {videoFile ? (
            <>
              <FileVideo className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{videoFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB - Archivo local
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                {platform?.icon || <Play className="w-8 h-8 text-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{platform?.name || "Video"}</p>
                <p className="text-xs text-muted-foreground truncate">{videoUrl}</p>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={videoFile ? handleRemoveFile : handleRemoveLink}
            className="p-1.5 rounded-lg hover:bg-destructive/20 text-destructive transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {isUploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Subiendo video...
          </div>
        )}
      </div>
    );
  }

  // No video yet - show options
  return (
    <div className="space-y-3">
      <Label>Video de la lección</Label>
      
      {/* Source type tabs */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setSourceType("upload")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all",
            sourceType === "upload"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Subir archivo</span>
        </button>
        <button
          type="button"
          onClick={() => setSourceType("link")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all",
            sourceType === "link"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <Link2 className="w-4 h-4" />
          <span className="text-sm font-medium">Enlace externo</span>
        </button>
      </div>

      {/* Upload option */}
      {sourceType === "upload" && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            accept="video/mp4,video/webm,video/ogg,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-6 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors flex flex-col items-center gap-2"
          >
            <Upload className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Haz clic para subir un video
            </span>
            <span className="text-xs text-muted-foreground">
              MP4, WebM, OGG o MOV
            </span>
          </button>
        </>
      )}

      {/* Link option */}
      {sourceType === "link" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <GlassInput
              placeholder="https://www.youtube.com/watch?v=... o enlace de Vimeo, Bunny, etc."
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && linkInput.trim()) {
                  e.preventDefault();
                  handleLinkSubmit();
                }
              }}
              className="w-full"
            />
            <button
              type="button"
              onClick={handleLinkSubmit}
              disabled={!linkInput.trim()}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all text-sm",
                linkInput.trim()
                  ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/20"
                  : "bg-muted/50 text-muted-foreground cursor-not-allowed border border-border/50"
              )}
            >
              <Link2 className="w-4 h-4" />
              {linkInput.trim() ? "Agregar enlace de video" : "Pega un enlace arriba"}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Plataformas soportadas:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50">
              <Youtube className="w-3 h-3 text-red-500" />
              YouTube
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50">
              <Play className="w-3 h-3 text-cyan-500" />
              Vimeo
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50">
              <Play className="w-3 h-3 text-orange-500" />
              Bunny.net
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/50">
              <ExternalLink className="w-3 h-3" />
              Otros
            </span>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Subiendo video...
        </div>
      )}
    </div>
  );
};
