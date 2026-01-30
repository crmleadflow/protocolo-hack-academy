import React, { useState, useRef } from "react";
import { MessageSquare, HelpCircle, Megaphone, Paperclip, X, FileText, Image, File, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
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
    description: "Inicia una conversación",
    color: "text-primary",
    bgColor: "bg-primary/10 hover:bg-primary/20",
    borderColor: "border-primary",
    activeGlow: "shadow-[0_0_20px_hsl(var(--primary)/0.3)]",
  },
  {
    type: "question" as ContentType,
    icon: HelpCircle,
    label: "Pregunta",
    description: "Obtén respuestas",
    color: "text-secondary",
    bgColor: "bg-secondary/10 hover:bg-secondary/20",
    borderColor: "border-secondary",
    activeGlow: "shadow-[0_0_20px_hsl(var(--secondary)/0.3)]",
  },
  {
    type: "announcement" as ContentType,
    icon: Megaphone,
    label: "Anuncio",
    description: "Solo admins",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10 hover:bg-yellow-500/20",
    borderColor: "border-yellow-500",
    activeGlow: "shadow-[0_0_20px_rgba(234,179,8,0.3)]",
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

// Extracted form content component for reuse
const PostFormContent: React.FC<{
  availableTypes: typeof contentTypes;
  selectedType: ContentType;
  setSelectedType: (type: ContentType) => void;
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  selectedFile: File | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  isMobile: boolean;
}> = ({
  availableTypes,
  selectedType,
  setSelectedType,
  title,
  setTitle,
  content,
  setContent,
  selectedFile,
  onFileSelect,
  onRemoveFile,
  fileInputRef,
  isSubmitting,
  onSubmit,
  onCancel,
  isMobile,
}) => {
  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : File;
  const isValid = title.trim() && content.trim();

  return (
    <div className="flex flex-col h-full">
      <div className={cn(
        "flex-1 space-y-4 overflow-y-auto",
        isMobile ? "px-1 pb-4" : "py-4"
      )}>
        {/* Type Selection - Horizontal scroll on mobile */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Tipo de publicación</Label>
          <div className={cn(
            "flex gap-2",
            isMobile ? "overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none" : "flex-wrap"
          )}>
            {availableTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.type;

              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all",
                    isMobile ? "flex-shrink-0 min-w-fit" : "flex-1 min-w-[140px]",
                    type.bgColor,
                    isSelected 
                      ? cn(type.borderColor, type.activeGlow) 
                      : "border-transparent"
                  )}
                >
                  <Icon className={cn("w-4 h-4", type.color)} />
                  <div className="text-left">
                    <p className="font-medium text-sm whitespace-nowrap">{type.label}</p>
                    {!isMobile && (
                      <p className="text-xs text-muted-foreground">
                        {type.description}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="title" className="text-sm font-medium">Título</Label>
            <span className="text-xs text-muted-foreground">
              {title.length}/100
            </span>
          </div>
          <GlassInput
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Escribe un título descriptivo..."
            maxLength={100}
            className="h-11"
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="content" className="text-sm font-medium">Contenido</Label>
            <span className="text-xs text-muted-foreground">
              {content.length}/2000
            </span>
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe tu publicación en detalle..."
            className={cn(
              "bg-background/50 border-border/50 resize-none",
              isMobile ? "min-h-[100px]" : "min-h-[120px]"
            )}
            maxLength={2000}
          />
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Archivo adjunto</Label>
          <input
            ref={fileInputRef}
            type="file"
            onChange={onFileSelect}
            className="hidden"
            accept="*/*"
          />
          
          {selectedFile ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemoveFile}
                className="shrink-0 h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full justify-center gap-2 border-dashed h-11 hover:bg-muted/50"
            >
              <Paperclip className="w-4 h-4" />
              <span>Adjuntar archivo</span>
              <span className="text-muted-foreground text-xs">(máx. 100MB)</span>
            </Button>
          )}
        </div>
      </div>

      {/* Actions - Always visible at bottom */}
      <div className={cn(
        "flex gap-3 pt-4 mt-auto border-t border-border/50 bg-background/95 backdrop-blur-sm",
        isMobile ? "pb-4 -mx-4 px-4 sticky bottom-0" : ""
      )}>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 h-11"
        >
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className={cn(
            "flex-1 h-11 gap-2 font-semibold transition-all",
            isValid 
              ? "bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" 
              : "bg-muted"
          )}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Publicando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Publicar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export const CreatePostDialog: React.FC<CreatePostDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isAdmin = false,
}) => {
  const isMobile = useIsMobile();
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

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedType("discussion");
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
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const availableTypes = contentTypes.filter(
    (t) => !t.adminOnly || isAdmin
  );

  const formProps = {
    availableTypes,
    selectedType,
    setSelectedType,
    title,
    setTitle,
    content,
    setContent,
    selectedFile,
    onFileSelect: handleFileSelect,
    onRemoveFile: removeFile,
    fileInputRef,
    isSubmitting,
    onSubmit: handleSubmit,
    onCancel: handleCancel,
    isMobile,
  };

  // Use Sheet for mobile, Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[85vh] rounded-t-2xl border-t border-border/50 bg-background/95 backdrop-blur-xl"
        >
          <SheetHeader className="pb-2">
            <SheetTitle className="font-heading text-lg">
              Nueva Publicación
            </SheetTitle>
          </SheetHeader>
          <PostFormContent {...formProps} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">
            Nueva Publicación
          </DialogTitle>
        </DialogHeader>
        <PostFormContent {...formProps} />
      </DialogContent>
    </Dialog>
  );
};
