import React, { useState } from "react";
import { MessageSquare, HelpCircle, Megaphone, X } from "lucide-react";
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
import type { ContentType } from "@/hooks/useCommunity";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, content: string, type: ContentType) => Promise<void>;
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

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    await onSubmit(title, content, selectedType);
    setIsSubmitting(false);
    
    // Reset form
    setTitle("");
    setContent("");
    setSelectedType("discussion");
    onOpenChange(false);
  };

  const availableTypes = contentTypes.filter(
    (t) => !t.adminOnly || isAdmin
  );

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

          {/* Actions */}
          <div className="flex gap-3 justify-end">
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
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
