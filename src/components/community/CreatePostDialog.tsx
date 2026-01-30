import React, { useState, useRef } from "react";
import { MessageSquare, HelpCircle, Megaphone, Paperclip, X, FileText, Image, File, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { ContentType } from "@/hooks/useCommunity";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string, type: ContentType, file?: File) => Promise<void>;
  isAdmin?: boolean;
}

const contentTypes = [
  {
    type: "discussion" as ContentType,
    icon: MessageSquare,
    label: "Discusión",
    description: "Inicia una conversación con la comunidad",
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
    borderColor: "border-primary",
  },
  {
    type: "question" as ContentType,
    icon: HelpCircle,
    label: "Pregunta",
    description: "Haz una pregunta y obtén respuestas",
    color: "text-secondary",
    bgColor: "bg-secondary/10 hover:bg-secondary/20",
    borderColor: "border-secondary",
  },
  {
    type: "announcement" as ContentType,
    icon: Megaphone,
    label: "Anuncio",
    description: "Comparte noticias importantes (solo admins)",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
    borderColor: "border-yellow-500",
    adminOnly: true,
  },
];

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const getFileIcon = (type: string) => {
  if (type.startsWith("image/")) return Image;
  if (type.includes("pdf") || type.includes("document")) return FileText;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isAdmin = false,
}) => {
  const [selectedType, setSelectedType] = useState<ContentType>("discussion");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("El archivo es muy grande", {
        description: "El tamaño máximo es 100MB",
      });
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(title, content, selectedType, selectedFile || undefined);
      
      // Reset form
      setTitle("");
      setContent("");
      setSelectedType("discussion");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableTypes = contentTypes.filter(
    (t) => !t.adminOnly || isAdmin
  );

  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : File;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Nueva Publicación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Type Selection */}
          <div className="space-y-3">
            <Label>Tipo de publicación</Label>
            <div className="grid grid-cols-2 gap-3">
              {availableTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.type;

                return (
                  <button
                    key={type.type}
                    onClick={() => setSelectedType(type.type)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      type.bgColor,
                      isSelected ? type.borderColor : "border-transparent"
                    )}
                  >
                    <Icon className={cn("w-5 h-5 mb-2", type.color)} />
                    <p className="font-medium text-sm">{type.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <GlassInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Escribe un título descriptivo..."
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground text-right">
              {title.length}/100
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe tu publicación en detalle..."
              className="min-h-[120px] bg-background/50 border-border/50"
              maxLength={2000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length}/2000
            </p>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Archivo adjunto (opcional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            
            {selectedFile ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                <FileIcon className="w-8 h-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={removeFile}
                  className="shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full justify-start gap-2 border-dashed"
              >
                <Paperclip className="w-4 h-4" />
                Adjuntar archivo (máx. 100MB)
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || isSubmitting}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
