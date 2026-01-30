import React from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Heart, MessageCircle, Eye, CheckCircle, 
  Pin, HelpCircle, Megaphone, MessageSquare, Trash2 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CommunityPost } from "@/hooks/useCommunity";

interface CommunityPostCardProps {
  post: CommunityPost;
  onClick: () => void;
  onLike: () => void;
  onDelete?: () => void;
  isAdmin?: boolean;
}

const contentTypeConfig = {
  discussion: {
    icon: MessageSquare,
    label: "Discusión",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  question: {
    icon: HelpCircle,
    label: "Pregunta",
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  announcement: {
    icon: Megaphone,
    label: "Anuncio",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
};

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  onClick,
  onLike,
  onDelete,
  isAdmin,
}) => {
  const config = contentTypeConfig[post.content_type];
  const TypeIcon = config.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "glass-card p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.01] hover:border-primary/30",
        post.is_pinned && "border-primary/50 bg-primary/5"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-primary-foreground">
                {post.author?.full_name?.charAt(0).toUpperCase() || "U"}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-sm truncate">
                {post.author?.full_name || "Usuario"}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                  locale: es,
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={cn("text-xs", config.bgColor, config.color)}>
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
                <Badge variant="outline" className="text-xs text-green-500 bg-green-500/10">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Resuelto
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-heading font-semibold text-lg mb-2">{post.title}</h3>
      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
        {post.content}
      </p>

      {/* Footer Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike();
            }}
            className={cn(
              "flex items-center gap-1.5 transition-colors hover:text-red-500",
              post.user_liked && "text-red-500"
            )}
          >
            <Heart className={cn("w-4 h-4", post.user_liked && "fill-current")} />
            <span>{post.likes_count}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comments_count}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            <span>{post.views_count}</span>
          </div>
        </div>

        {/* Admin delete button */}
        {isAdmin && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex items-center gap-1.5 p-2 rounded-lg transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Eliminar publicación"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
