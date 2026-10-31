import React from "react";
import { MessageSquare, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { HolographicCard } from "@/components/ui/holographic-card";
import { useLessonComments } from "@/hooks/useLessonComments";
import { useLessonRatings } from "@/hooks/useLessonRatings";
import { useAuth } from "@/contexts/AuthContext";
import { LessonRatingSection } from "./LessonRatingSection";
import { CommentForm } from "./CommentForm";
import { CommentsList } from "./CommentsList";
import { Separator } from "@/components/ui/separator";

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
  const { user } = useAuth();

  return (
    <HolographicCard className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-foreground">
            Feedback de la Lección
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            {comments.length} {comments.length === 1 ? "comentario" : "comentarios"}
          </p>
        </div>
      </div>

      {/* Rating Section */}
      <div className="pb-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-foreground">Calificación</span>
        </div>
        <LessonRatingSection
          summary={summary}
          isSubmitting={isRatingSubmitting}
          onRate={rateLesson}
        />
      </div>

      <Separator className="mb-4 bg-border/30" />

      {/* Comments Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Comentarios</span>
        </div>

        {/* Comment Form */}
        {user && (
          <div className="mb-4">
            <CommentForm isSubmitting={isSubmitting} onSubmit={addComment} />
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 min-h-0">
          <CommentsList
            comments={comments}
            isLoading={isLoading}
            onDelete={deleteComment}
          />
        </div>
      </div>

      {/* Login prompt for non-authenticated users */}
      {!user && (
        <div className="mt-4 p-4 rounded-xl bg-muted/20 border border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            Inicia sesión para dejar un comentario o calificar esta lección
          </p>
        </div>
      )}
    </HolographicCard>
  );
};
