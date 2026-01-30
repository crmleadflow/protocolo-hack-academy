import React, { useState } from "react";
import { Send, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentFormProps {
  isSubmitting: boolean;
  onSubmit: (content: string) => Promise<void>;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await onSubmit(newComment);
    setNewComment("");
    setIsFocused(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div
        className={cn(
          "relative rounded-xl transition-all duration-300",
          isFocused
            ? "ring-2 ring-primary/50 shadow-[0_0_20px_rgba(var(--primary)/0.15)]"
            : "ring-1 ring-border/50"
        )}
      >
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !newComment && setIsFocused(false)}
          placeholder="Escribe tu comentario sobre esta lección..."
          className={cn(
            "min-h-[80px] bg-background/50 border-0 resize-none",
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            "placeholder:text-muted-foreground/60"
          )}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground hidden sm:block">
          <MessageSquarePlus className="w-3 h-3 inline mr-1" />
          Comparte tus dudas o reflexiones
        </p>
        
        <Button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          size="sm"
          className={cn(
            "gap-2 px-4 transition-all",
            newComment.trim() && "shadow-[0_0_15px_rgba(var(--primary)/0.3)]"
          )}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "Enviando..." : "Comentar"}
        </Button>
      </div>
    </form>
  );
};
