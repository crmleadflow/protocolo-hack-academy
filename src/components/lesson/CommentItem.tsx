import React from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LessonComment } from "@/hooks/useLessonComments";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface CommentItemProps {
  comment: LessonComment;
  canDelete: boolean;
  onDelete: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  canDelete,
  onDelete,
}) => {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: es,
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-background/30 hover:bg-background/50 transition-colors group">
      <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-primary/20">
        <AvatarImage src={comment.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-medium">
          {getInitials(comment.profile?.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-semibold text-sm text-foreground">
              {comment.profile?.full_name || "Usuario"}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          {canDelete && (
            <button
              onClick={onDelete}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                "opacity-0 group-hover:opacity-100",
                "text-muted-foreground hover:text-destructive",
                "hover:bg-destructive/10"
              )}
              aria-label="Eliminar comentario"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
};
