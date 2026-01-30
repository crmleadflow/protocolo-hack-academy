import React from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { LessonComment } from "@/hooks/useLessonComments";
import { CommentItem } from "./CommentItem";
import { useAuth } from "@/contexts/AuthContext";

interface CommentsListProps {
  comments: LessonComment[];
  isLoading: boolean;
  onDelete: (commentId: string) => void;
}

export const CommentsList: React.FC<CommentsListProps> = ({
  comments,
  isLoading,
  onDelete,
}) => {
  const { user, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando comentarios...</p>
        </div>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h4 className="font-medium text-foreground mb-1">Sin comentarios aún</h4>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          Sé el primero en compartir tu opinión sobre esta lección
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          canDelete={user?.id === comment.user_id || isAdmin}
          onDelete={() => onDelete(comment.id)}
        />
      ))}
    </div>
  );
};
