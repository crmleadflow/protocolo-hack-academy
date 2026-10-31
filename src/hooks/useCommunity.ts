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
  file_url?: string | null;
  file_name?: string | null;
  file_size?: number | null;
  file_type?: string | null;
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

      const postsWithDetails = await Promise.all(
        (data || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("user_id", post.user_id)
            .maybeSingle();

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

  // Detectar si un texto contiene una pregunta
  const containsQuestion = (text: string): boolean => {
    // Detectar signos de interrogación
    if (text.includes("?") || text.includes("¿")) return true;
    
    // Detectar palabras clave de preguntas en español
    const questionKeywords = [
      /\b(cómo|como)\b/i,
      /\b(qué|que)\b/i,
      /\b(cuál|cual)\b/i,
      /\b(cuándo|cuando)\b/i,
      /\b(dónde|donde)\b/i,
      /\b(por qué|porque|porqué)\b/i,
      /\b(quién|quien)\b/i,
      /\b(cuánto|cuanta|cuantos|cuantas)\b/i,
      /\bpuedo\b/i,
      /\bpuedes\b/i,
      /\bse puede\b/i,
      /\balguien sabe\b/i,
      /\bnecesito ayuda\b/i,
      /\bayuda con\b/i,
      /\btengo (una |un )?duda\b/i,
      /\bno (entiendo|sé|se)\b/i,
    ];
    
    return questionKeywords.some(pattern => pattern.test(text));
  };

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

      // El mentor responde a preguntas y discusiones que contengan preguntas
      if (data) {
        const fullText = `${title} ${content}`;
        if (contentType === "question" || containsQuestion(fullText)) {
          requestMentorAnswer(data.id, programId);
        }
      }

      return data;
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Error al crear la publicación");
      return null;
    }
  };

  const requestMentorAnswer = async (postId: string, progId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        console.error("No session token available for mentor answer");
        return;
      }

      // Llamar a la edge function con el token explícito
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/community-mentor-answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ postId, programId: progId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Mentor answer error:", response.status, errorData);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        toast.success("El Mentor IA ha respondido tu pregunta", {
          description: "Revisa los comentarios 🤖",
          icon: "✨",
        });
      }
    } catch (error) {
      console.error("Error requesting mentor answer:", error);
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
      await supabase
        .from("community_comments")
        .update({ is_accepted_answer: false })
        .eq("post_id", postId);

      await supabase
        .from("community_comments")
        .update({ is_accepted_answer: true })
        .eq("id", commentId);

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
  const [isUploading, setIsUploading] = useState(false);

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

  const uploadFile = async (file: File): Promise<{ url: string; name: string; size: number; type: string } | null> => {
    if (!user || !programId) return null;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("community-files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("community-files")
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error al subir el archivo");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Detectar si un texto contiene una pregunta
  const containsQuestion = (text: string): boolean => {
    // Detectar signos de interrogación
    if (text.includes("?") || text.includes("¿")) return true;
    
    // Detectar palabras clave de preguntas en español
    const questionKeywords = [
      /\b(cómo|como)\b/i,
      /\b(qué|que)\b/i,
      /\b(cuál|cual)\b/i,
      /\b(cuándo|cuando)\b/i,
      /\b(dónde|donde)\b/i,
      /\b(por qué|porque|porqué)\b/i,
      /\b(quién|quien)\b/i,
      /\b(cuánto|cuanta|cuantos|cuantas)\b/i,
      /\bpuedo\b/i,
      /\bpuedes\b/i,
      /\bse puede\b/i,
      /\balguien sabe\b/i,
      /\bnecesito ayuda\b/i,
      /\bayuda con\b/i,
      /\btengo (una |un )?duda\b/i,
      /\bno (entiendo|sé|se)\b/i,
    ];
    
    return questionKeywords.some(pattern => pattern.test(text));
  };

  const requestMentorChatAnswer = async (messageContent: string, progId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.access_token) {
        console.error("No session token available for mentor chat answer");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/community-mentor-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ messageContent, programId: progId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Mentor chat answer error:", response.status, errorData);
      }
    } catch (error) {
      console.error("Error requesting mentor chat answer:", error);
    }
  };

  const sendMessage = async (
    content: string,
    fileData?: { url: string; name: string; size: number; type: string }
  ) => {
    if (!user || !programId) return null;
    if (!content.trim() && !fileData) return null;

    try {
      const { data, error } = await supabase
        .from("community_messages")
        .insert({
          program_id: programId,
          user_id: user.id,
          content: content.trim(),
          file_url: fileData?.url || null,
          file_name: fileData?.name || null,
          file_size: fileData?.size || null,
          file_type: fileData?.type || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Si el mensaje contiene una pregunta, el mentor responde
      if (data && containsQuestion(content)) {
        // Pequeño delay para que el mensaje del usuario aparezca primero
        setTimeout(() => {
          requestMentorChatAnswer(content, programId);
        }, 1000);
      }

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
    isUploading,
    sendMessage,
    uploadFile,
    refetch: fetchMessages,
  };
}
