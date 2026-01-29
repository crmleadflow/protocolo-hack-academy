import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ContentType = "discussion" | "question" | "announcement";

export interface CommunityPost {
  id: string;
  program_id: string;
  user_id: string;
  title: string;
  content: string;
  content_type: ContentType;
  is_pinned: boolean;
  is_resolved: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  user_liked?: boolean;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_accepted_answer: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  replies?: CommunityComment[];
}

export interface ChatMessage {
  id: string;
  program_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useCommunityPosts(programId: string | null) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!programId) {
      setPosts([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .eq("program_id", programId)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch author info and likes for each post
      const postsWithDetails = await Promise.all(
        (data || []).map(async (post) => {
          // Get author profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", post.user_id)
            .maybeSingle();

          // Check if current user liked
          let userLiked = false;
          if (user) {
            const { data: like } = await supabase
              .from("community_likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .maybeSingle();
            userLiked = !!like;
          }

          return {
            ...post,
            content_type: post.content_type as ContentType,
            author: profile,
            user_liked: userLiked,
          };
        })
      );

      setPosts(postsWithDetails);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("Error al cargar las publicaciones");
    } finally {
      setIsLoading(false);
    }
  }, [programId, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const createPost = async (
    title: string,
    content: string,
    contentType: ContentType
  ) => {
    if (!user || !programId) return null;

    try {
      const { data, error } = await supabase
        .from("community_posts")
        .insert({
          program_id: programId,
          user_id: user.id,
          title,
          content,
          content_type: contentType,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Publicación creada");
      fetchPosts();
      return data;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error al crear la publicación");
      return null;
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    try {
      if (post.user_liked) {
        await supabase
          .from("community_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);
      } else {
        await supabase.from("community_likes").insert({
          post_id: postId,
          user_id: user.id,
        });
      }

      // Optimistic update
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                user_liked: !p.user_liked,
                likes_count: p.user_liked
                  ? p.likes_count - 1
                  : p.likes_count + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error("Error toggling like:", error);
      fetchPosts();
    }
  };

  return {
    posts,
    isLoading,
    createPost,
    toggleLike,
    refetch: fetchPosts,
  };
}

export function useCommunityComments(postId: string | null) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!postId) {
      setComments([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author info for each comment
      const commentsWithAuthors = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", comment.user_id)
            .maybeSingle();

          return {
            ...comment,
            author: profile,
          };
        })
      );

      // Organize into tree structure
      const rootComments: CommunityComment[] = [];
      const childMap = new Map<string, CommunityComment[]>();

      commentsWithAuthors.forEach((comment) => {
        if (comment.parent_id) {
          const children = childMap.get(comment.parent_id) || [];
          children.push(comment);
          childMap.set(comment.parent_id, children);
        } else {
          rootComments.push(comment);
        }
      });

      rootComments.forEach((comment) => {
        comment.replies = childMap.get(comment.id) || [];
      });

      setComments(rootComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const createComment = async (content: string, parentId?: string) => {
    if (!user || !postId) return null;

    try {
      const { data, error } = await supabase
        .from("community_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("Comentario agregado");
      fetchComments();
      return data;
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Error al agregar comentario");
      return null;
    }
  };

  const markAsAccepted = async (commentId: string) => {
    if (!user) return;

    try {
      // First, unmark any existing accepted answer
      await supabase
        .from("community_comments")
        .update({ is_accepted_answer: false })
        .eq("post_id", postId);

      // Mark the new answer
      await supabase
        .from("community_comments")
        .update({ is_accepted_answer: true })
        .eq("id", commentId);

      // Mark post as resolved
      await supabase
        .from("community_posts")
        .update({ is_resolved: true })
        .eq("id", postId);

      toast.success("Respuesta aceptada");
      fetchComments();
    } catch (error) {
      console.error("Error marking as accepted:", error);
    }
  };

  return {
    comments,
    isLoading,
    createComment,
    markAsAccepted,
    refetch: fetchComments,
  };
}

export function useCommunityChat(programId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!programId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("community_messages")
        .select("*")
        .eq("program_id", programId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      // Fetch author info for each message
      const messagesWithAuthors = await Promise.all(
        (data || []).map(async (message) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", message.user_id)
            .maybeSingle();

          return {
            ...message,
            author: profile,
          };
        })
      );

      setMessages(messagesWithAuthors);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!programId) return;

    const channel = supabase
      .channel(`chat-${programId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "community_messages",
          filter: `program_id=eq.${programId}`,
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Fetch author info
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", newMessage.user_id)
            .maybeSingle();

          setMessages((prev) => [
            ...prev,
            { ...newMessage, author: profile },
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [programId]);

  const sendMessage = async (content: string) => {
    if (!user || !programId || !content.trim()) return null;

    try {
      const { data, error } = await supabase
        .from("community_messages")
        .insert({
          program_id: programId,
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Error al enviar mensaje");
      return null;
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
    refetch: fetchMessages,
  };
}
