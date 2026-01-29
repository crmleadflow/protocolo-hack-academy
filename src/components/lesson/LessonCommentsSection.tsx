import React, { useState } from "react";
import { MessageSquare, Send, Trash2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { HolographicCard } from "@/components/ui/holographic-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLessonComments, LessonComment } from "@/hooks/useLessonComments";
import { useLessonRatings } from "@/hooks/useLessonRatings";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface LessonCommentsSectionProps {
  lessonId: string;
  lessonTitle: string;
  className?: string;
}

export const LessonCommentsSection: React.FC<LessonCommentsSectionProps> = ({
  lessonId,
  lessonTitle,
  className,
}) => {
  const { comments, isLoading, isSubmitting, addComment, deleteComment } =
    useLessonComments(lessonId);
  const { summary, isSubmitting: isRatingSubmitting, rateLesson } =
    useLessonRatings(lessonId);
  const { user, isAdmin } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addComment(newComment);
    setNewComment("");
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRating = (rating: number) => {
    if (!isRatingSubmitting) {
      rateLesson(rating);
    }
  };

  return (
    <HolographicCard className={cn("space-y-4", className)}>
      {/* Header with Rating */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-heading font-bold">Comentarios y Calificación</h3>
            <p className="text-xs text-muted-foreground">
              Califica y comparte tu opinión sobre esta lección
            </p>
          </div>
        </div>
        
        {/* Star Rating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= (hoverRating || summary.userRating || 0);
              const isAverage = !hoverRating && !summary.userRating && star <= Math.round(summary.averageRating);
              
              return (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  disabled={isRatingSubmitting || !user}
                  className={cn(
                    "p-0.5 transition-all duration-150",
                    user && "hover:scale-125",
                    isRatingSubmitting && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Star
                    className={cn(
                      "w-5 h-5 transition-colors",
                      isFilled
                        ? "fill-yellow-400 text-yellow-400"
                        : isAverage
                        ? "fill-yellow-400/50 text-yellow-400/50"
                        : "text-muted-foreground/40"
                    )}
                  />
                </button>
              );
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            {summary.totalRatings > 0 ? (
              <span>
                <span className="font-medium text-foreground">{summary.averageRating}</span>
                <span className="mx-1">·</span>
                {summary.totalRatings} {summary.totalRatings === 1 ? "voto" : "votos"}
              </span>
            ) : (
              <span>Sin calificaciones</span>
            )}
          </div>
        </div>
      </div>

      {/* User's rating indicator */}
      {summary.userRating && (
        <div className="text-xs text-primary flex items-center gap-1">
          <Star className="w-3 h-3 fill-primary" />
          Tu calificación: {summary.userRating} {summary.userRating === 1 ? "estrella" : "estrellas"}
        </div>
      )}

      {/* Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe tu comentario..."
            className="min-h-[80px] bg-background/50"
            disabled={isSubmitting}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4 pt-4 border-t border-border/50">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-full bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Sé el primero en comentar</p>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              canDelete={user?.id === comment.user_id || isAdmin}
              onDelete={() => deleteComment(comment.id)}
              getInitials={getInitials}
            />
          ))
        )}
      </div>
    </HolographicCard>
  );
};

interface CommentItemProps {
  comment: LessonComment;
  canDelete: boolean;
  onDelete: () => void;
  getInitials: (name: string | null | undefined) => string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  canDelete,
  onDelete,
  getInitials,
}) => {
  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="flex gap-3 group">
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={comment.profile?.avatar_url || undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {getInitials(comment.profile?.full_name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">
            {comment.profile?.full_name || "Usuario"}
          </span>
          <span className="text-xs text-muted-foreground">{timeAgo}</span>
          
          {canDelete && (
            <button
              onClick={onDelete}
              className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>
    </div>
  );
};
