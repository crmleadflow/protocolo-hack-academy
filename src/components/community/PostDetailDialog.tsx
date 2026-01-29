import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import {
  Heart, MessageCircle, CheckCircle, Send,
  HelpCircle, MessageSquare, Megaphone, Pin
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCommunityComments, CommunityPost, CommunityComment } from "@/hooks/useCommunity";
import { useAuth } from "@/contexts/AuthContext";

interface PostDetailDialogProps {
  post: CommunityPost | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLike: () => void;
}

const contentTypeConfig = {
  discussion: { icon: MessageSquare, label: "Discusión", color: "text-primary" },
  question: { icon: HelpCircle, label: "Pregunta", color: "text-secondary" },
  announcement: { icon: Megaphone, label: "Anuncio", color: "text-yellow-500" },
};

export const PostDetailDialog: React.FC<PostDetailDialogProps> = ({
  post,
  open,
  onOpenChange,
  onLike,
}) => {
  const { user, isAdmin } = useAuth();
  const { comments, isLoading, createComment, markAsAccepted } = useCommunityComments(
    post?.id || null
  );
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  const config = contentTypeConfig[post.content_type];
  const TypeIcon = config.icon;
  const isAuthor = user?.id === post.user_id;

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    await createComment(newComment);
    setNewComment("");
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-border/50 max-w-2xl max-h-[90vh]">
        <DialogHeader className="border-b border-border/50 pb-4">
          <div className="flex items-start gap-4">
            {/* Author Avatar */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
              {post.author?.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-bold text-primary-foreground">
                  {post.author?.full_name?.charAt(0).toUpperCase() || "U"}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <DialogTitle className="font-heading text-xl mb-2">
                {post.title}
              </DialogTitle>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">
                  {post.author?.full_name || "Usuario"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                    locale: es,
                  })}
                </span>

                <Badge variant="outline" className={cn("text-xs", config.color)}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>

                {post.is_pinned && (
                  <Badge variant="outline" className="text-xs text-primary">
                    <Pin className="w-3 h-3 mr-1" />
                    Fijado
                  </Badge>
                )}

                {post.is_resolved && (
                  <Badge variant="outline" className="text-xs text-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Resuelto
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="py-4 space-y-6">
            {/* Post Content */}
            <div className="prose prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-foreground">{post.content}</p>
            </div>

            {/* Post Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <button
                onClick={onLike}
                className={cn(
                  "flex items-center gap-1.5 text-sm transition-colors hover:text-red-500",
                  post.user_liked && "text-red-500"
                )}
              >
                <Heart className={cn("w-4 h-4", post.user_liked && "fill-current")} />
                <span>{post.likes_count} Me gusta</span>
              </button>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MessageCircle className="w-4 h-4" />
                <span>{post.comments_count} Comentarios</span>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-4">
              <h4 className="font-heading font-semibold">
                Comentarios ({comments.length})
              </h4>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No hay comentarios aún. ¡Sé el primero en comentar!
                </p>
              ) : (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      isPostQuestion={post.content_type === "question"}
                      canMarkAccepted={(isAuthor || isAdmin) && !post.is_resolved}
                      onMarkAccepted={() => markAsAccepted(comment.id)}
                    />
                  ))}
                </div>
              )}

              {/* Add Comment */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex gap-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 min-h-[80px] bg-background/50 border-border/50"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Enviando..." : "Comentar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface CommentItemProps {
  comment: CommunityComment;
  isPostQuestion: boolean;
  canMarkAccepted: boolean;
  onMarkAccepted: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isPostQuestion,
  canMarkAccepted,
  onMarkAccepted,
}) => {
  return (
    <div
      className={cn(
        "flex gap-3 p-3 rounded-lg",
        comment.is_accepted_answer && "bg-green-500/10 border border-green-500/30"
      )}
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
        {comment.author?.avatar_url ? (
          <img
            src={comment.author.avatar_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-bold text-primary-foreground">
            {comment.author?.full_name?.charAt(0).toUpperCase() || "U"}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {comment.author?.full_name || "Usuario"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), {
              addSuffix: true,
              locale: es,
            })}
          </span>
          {comment.is_accepted_answer && (
            <Badge variant="outline" className="text-xs text-green-500 bg-green-500/10">
              <CheckCircle className="w-3 h-3 mr-1" />
              Respuesta aceptada
            </Badge>
          )}
        </div>

        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>

        {/* Actions */}
        {isPostQuestion && canMarkAccepted && !comment.is_accepted_answer && (
          <button
            onClick={onMarkAccepted}
            className="mt-2 text-xs text-green-500 hover:text-green-400 flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            Marcar como respuesta aceptada
          </button>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 pl-4 border-l border-border/50 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isPostQuestion={isPostQuestion}
                canMarkAccepted={canMarkAccepted}
                onMarkAccepted={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
