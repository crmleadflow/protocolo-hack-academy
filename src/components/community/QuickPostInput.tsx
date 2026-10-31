import React, { useState } from "react";
import { Send, MessageSquare, HelpCircle, Loader2, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { GlassInput } from "@/components/ui/glass-input";
import type { ContentType } from "@/hooks/useCommunity";

interface QuickPostInputProps {
  type: "discussion" | "question";
  onSubmit: (title: string, content: string, type: ContentType) => Promise<void>;
  onOpenFullDialog: () => void;
}

export const QuickPostInput: React.FC<QuickPostInputProps> = ({
  type,
  onSubmit,
  onOpenFullDialog,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const config = {
    discussion: {
      icon: MessageSquare,
      placeholder: "¿Qué quieres discutir con la comunidad?",
      titlePlaceholder: "Título de tu discusión",
      buttonText: "Publicar Discusión",
      color: "primary" as const,
      mentorEnabled: false,
    },
    question: {
      icon: HelpCircle,
      placeholder: "¿Tienes alguna pregunta? El mentor IA responderá automáticamente",
      titlePlaceholder: "Resume tu pregunta en una línea",
      buttonText: "Publicar Pregunta",
      color: "secondary" as const,
      mentorEnabled: true,
    },
  };

  const { icon: Icon, placeholder, titlePlaceholder, buttonText, color, mentorEnabled } = config[type];

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(title, content, type);
      setTitle("");
      setContent("");
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey && title.trim() && content.trim()) {
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        "rounded-[2rem] bg-secondary overflow-hidden transition-all duration-300",
        isExpanded ? "p-5" : "p-4"
      )}
    >
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center gap-3 text-left group"
        >
          <div className={cn(
            "p-2.5 rounded-xl transition-colors",
            color === "primary" ? "bg-primary/10 group-hover:bg-primary/20" : "bg-secondary/10 group-hover:bg-secondary/20"
          )}>
            <Icon className={cn(
              "w-5 h-5",
              color === "primary" ? "text-primary" : "text-secondary"
            )} />
          </div>
          <div className="flex-1">
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              {placeholder}
            </span>
            {mentorEnabled && (
              <div className="flex items-center gap-1.5 mt-1">
                <Bot className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs text-primary">Mentor IA responderá</span>
              </div>
            )}
          </div>
        </button>
      ) : (
        <div className="space-y-4" onKeyDown={handleKeyDown}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              color === "primary" ? "bg-primary/10" : "bg-secondary/10"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                color === "primary" ? "text-primary" : "text-secondary"
              )} />
            </div>
            <div>
              <span className="font-heading font-semibold">
                {type === "discussion" ? "Nueva Discusión" : "Nueva Pregunta"}
              </span>
              {mentorEnabled && (
                <div className="flex items-center gap-1.5">
                  <Bot className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground">El mentor IA responderá automáticamente</span>
                </div>
              )}
            </div>
          </div>

          <GlassInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={titlePlaceholder}
            maxLength={100}
            autoFocus
          />

          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Describe en detalle..."
            className="min-h-[100px] bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/30 transition-all"
            maxLength={2000}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Ctrl + Enter para enviar</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(false);
                  setTitle("");
                  setContent("");
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !content.trim() || isSubmitting}
                size="sm"
                className={cn(
                  "gap-2",
                  color === "primary" 
                    ? "bg-primary hover:bg-primary/90" 
                    : "bg-secondary hover:bg-secondary/90"
                )}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {buttonText}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
